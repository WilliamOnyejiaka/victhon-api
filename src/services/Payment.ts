import axios from 'axios'
import crypto from 'crypto';
import BaseService from './Service';
import {Booking, BookingStatus} from "../entities/Booking";
import {AppDataSource} from "../data-source";
import env, {EnvKey} from "../config/env";
import {Escrow, EscrowStatus, RefundStatus} from "../entities/Escrow";
import {Transaction, TransactionStatus, TransactionType} from "../entities/Transaction";
import logger from "../config/logger";
import {Wallet} from "../entities/Wallet";
import {QueueEvents, QueueNames, UserType} from "../types/constants";
import {RabbitMQ} from "./RabbitMQ";
import {In} from "typeorm";
import notify from "./notify";
import {NotificationType} from "../entities/Notification";
import {Dispute} from "../entities/Dispute";

export default class Payment extends BaseService {

    private readonly bookingRepo = AppDataSource.getRepository(Booking);
    private readonly transactionRepo = AppDataSource.getRepository(Transaction);
    private readonly walletRepo = AppDataSource.getRepository(Wallet);
    private readonly escrowRepo = AppDataSource.getRepository(Escrow);
    private readonly disputeRepo = AppDataSource.getRepository(Dispute);

    private readonly PAYSTACK_SECRET_KEY = env(EnvKey.PAYSTACK_SECRET_KEY)!;

    public async initializeBookingPayment(bookingId: string, userId: string) {
        try {
            const booking = await this.bookingRepo.findOne({
                where: {id: bookingId, userId: userId},
                relations: ["escrow", "user", "professional.wallet"]
            });

            if (!booking) return this.responseData(404, true, "Booking was not found");
            if (booking.status !== BookingStatus.ACCEPTED) return this.responseData(400, true, "Booking has not yet been accepted");
            if (booking.escrow.status !== EscrowStatus.PENDING) return this.responseData(400, true, "Cannot pay for this booking");

            let wallet = booking.professional.wallet;
            if (!wallet) {
                wallet = await this.walletRepo.save(this.walletRepo.create({
                    professionalId: booking.professionalId,
                    balance: 0,
                    pendingAmount: 0,
                    totalBalance: 0,
                }));
            }

            const existingTx = await this.transactionRepo.findOne({
                where: {
                    escrowId: booking.escrow.id,
                    type: TransactionType.BOOKING_DEPOSIT,
                    status: TransactionStatus.PENDING,
                },
            });

            if (existingTx) {
                return this.responseData(200, false, "Payment already initialized", {
                    reference: existingTx.reference,
                });
            }

            const transaction = this.transactionRepo.create({
                userId,
                type: TransactionType.BOOKING_DEPOSIT,
                amount: booking.escrow.amount,
                escrowId: booking.escrow.id,
                status: TransactionStatus.FAILED,
                walletId: wallet.id,
            });

            await this.transactionRepo.save(transaction);

            const response = await axios.post(
                'https://api.paystack.co/transaction/initialize',
                {
                    email: booking.user.email,
                    amount: booking.escrow.amount,
                    metadata: {
                        type: TransactionType.BOOKING_DEPOSIT,
                        transactionId: transaction.id,
                        userId,
                        escrowId: booking.escrow.id,
                    }
                },
                {
                    headers: {
                        Authorization: `Bearer ${this.PAYSTACK_SECRET_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            if (response.status === 200 && response.data.status) {
                const {access_code, reference} = response.data.data;

                transaction.accessCode = access_code;
                transaction.reference = reference;
                transaction.status = TransactionStatus.PENDING;

                await this.transactionRepo.save(transaction);

                return this.responseData(200, false, "Payment was initiated successfully", response.data.data);
            }

            return this.responseData(500, true, "Payment initialization failed");
        } catch (error) {
            console.error(error);
            return this.handleTypeormError(error);
        }
    }


    public async reconcilePendingTransactions() {

        const BATCH_SIZE = 100;
        const TIMEOUT_MS = 30 * 60 * 1000;
        const MAX_BATCHES = 1000;

        const threshold = new Date(Date.now() - TIMEOUT_MS);
        let batches = 0;

        while (batches++ < MAX_BATCHES) {
            const transactions = await AppDataSource.transaction(async manager => {
                /**
                 * 1️⃣ Select rows and lock them
                 * 2️⃣ Skip rows locked by other workers
                 * 3️⃣ Immediately mark as PROCESSING
                 */
                const txs = await manager
                    .createQueryBuilder(Transaction, "tx")
                    .where("tx.status = :status", {status: TransactionStatus.PENDING})
                    .andWhere("tx.createdAt < :threshold", {threshold})
                    .orderBy("tx.createdAt", "ASC")
                    .limit(BATCH_SIZE)
                    .setLock("pessimistic_write")
                    .getMany();

                if (txs.length === 0) return [];

                await manager
                    .createQueryBuilder()
                    .update(Transaction)
                    .set({status: TransactionStatus.PROCESSING})
                    .whereInIds(txs.map(t => t.id))
                    .execute();

                return txs;
            });

            // 🔚 Nothing left to process
            if (transactions.length === 0) {
                logger.info("✅ No more pending transactions");
                break;
            }

            logger.info(`📦 Processing ${transactions.length} transactions`);

            // 2️⃣ Process OUTSIDE lock
            for (const tx of transactions) {
                try {
                    if (!tx.reference) {
                        await this.failTransaction(tx.id, "Missing reference");
                        continue;
                    }

                    const paystackTx = await this.verifyPaystackTransaction(tx.reference);

                    if (paystackTx.status === "success") {
                        await RabbitMQ.publishToExchange(QueueNames.PAYMENT, QueueEvents.PAYMENT_CHARGE_SUCCESSFUL, {
                            eventType: QueueEvents.PAYMENT_CHARGE_SUCCESSFUL,
                            payload: {data: paystackTx},
                        });
                    } else if (paystackTx.status === "failed") {
                        await this.failTransaction(tx.id, "Paystack failed");
                    } else {
                        // still pending → return to PENDING for retry
                        await this.resetToPending(tx.id);
                    }

                } catch (err) {
                    logger.error(`❌ Error processing tx ${tx.id}`, err);
                    await this.failTransaction(tx.id, "Error processing tx");
                }
            }
        }
    }

    public async verifyPaystackTransaction(reference: string) {
        const MAX_RETRIES = 3;
        const RETRY_DELAY_MS = 1000; // 1 second between retries

        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                const response = await axios.get(
                    `https://api.paystack.co/transaction/verify/${reference}`,
                    {
                        headers: {
                            Authorization: `Bearer ${this.PAYSTACK_SECRET_KEY}`,
                        },
                    }
                );
                return response.data; // success, return immediately
            } catch (error) {
                console.error(`Attempt ${attempt} failed:`, error);

                if (attempt === MAX_RETRIES) {
                    throw new Error(`Failed to verify transaction after ${MAX_RETRIES} attempts`);
                }

                // wait a bit before retrying
                await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
            }
        }
    }

    public async failTransaction(
        txId: string,
        reason: string
    ) {
        await AppDataSource.getRepository(Transaction).update(
            {id: txId},
            {status: TransactionStatus.FAILED}
        );
    }

    public async resetToPending(
        txId: string
    ) {
        await AppDataSource.getRepository(Transaction).update(
            {id: txId},
            {status: TransactionStatus.PENDING}
        );
    }


    public async successfulCharge(eventData: any) {
        try {
            const {transactionId} = eventData.metadata;

            if (!transactionId) {
                logger.error("No transactionId in webhook metadata");
                return;
            }

            let eventToPublish = null;

            await AppDataSource.transaction(async (manager) => {
                // Fetch transaction with relations using the transactional manager
                const payment = await manager.findOne(Transaction, {
                    where: {id: transactionId},
                    relations: ["escrow", "escrow.booking", "escrow.booking.professional", "escrow.booking.professional.wallet"],
                    lock: {mode: "pessimistic_write"}
                });

                if (!payment) {
                    logger.error(`Payment not found for transactionId: ${transactionId}`);
                    throw new Error("Transaction not found"); // Will trigger rollback
                }

                // Idempotency: Prevent double processing
                if (payment.status === TransactionStatus.SUCCESS) {
                    logger.info(`Payment already processed: ${transactionId}`);
                    return; // Exit early, no changes made
                }

                // Update transaction status
                await manager.update(
                    Transaction,
                    {id: transactionId},
                    {status: TransactionStatus.SUCCESS}
                );

                if (payment.type === TransactionType.BOOKING_DEPOSIT) {

                    const escrow = payment.escrow;
                    if (!escrow) {
                        throw new Error("Escrow not found for transaction");
                    }

                    /**
                     * 5️⃣ Escrow idempotency
                     */
                    if (escrow.status === EscrowStatus.PAID) {
                        logger.info(`Escrow already PAID for transaction: ${transactionId}`);
                        return;
                    }

                    // Update escrow to PAID
                    await manager.update(
                        Escrow,
                        {id: escrow.id},
                        {status: EscrowStatus.PAID}
                    );

                    // Find or create professional's wallet
                    const wallet = await manager.findOne(Wallet, {
                        where: {professionalId: escrow.booking.professionalId},
                        lock: {mode: "pessimistic_write"}
                    });

                    if (!wallet) {
                        logger.error(`Wallet not found for transactionId: ${transactionId}`);
                        throw new Error("Wallet not found"); // Will trigger rollback
                    }

                    const newPendingAmount: number = Number(wallet.pendingAmount) + Number(escrow.amount);
                    const newTotalBalance = Number(wallet.balance) + newPendingAmount;

                    // Update wallet balances
                    await manager.update(
                        Wallet,
                        {id: wallet.id},
                        {
                            pendingAmount: newPendingAmount,
                            totalBalance: newTotalBalance,
                        }
                    );

                    eventToPublish = {
                        queueName: QueueNames.PAYMENT,
                        eventType: QueueEvents.PAYMENT_BOOK_SUCCESSFUL,
                        payload: {
                            transactionId: transactionId,
                            professionalId: escrow.booking.professionalId
                        }
                    };


                    // const payload = {
                    //     transactionId: transactionId,
                    //     professionalId: escrow.booking.professionalId
                    // };
                    // const queueName = QueueNames.PAYMENT;
                    // const eventType = QueueEvents.PAYMENT_BOOK_SUCCESSFUL
                    // await RabbitMQ.publishToExchange(queueName, eventType, {
                    //     eventType: eventType,
                    //     payload,
                    // });
                }

                logger.info(`🤑 Payment successfully processed for transaction: ${transactionId}`);
            });

            // Really validate here
            if (eventToPublish != null) {
                await RabbitMQ.publishToExchange(
                    (eventToPublish as any).queueName,
                    (eventToPublish as any).eventType,
                    {
                        eventType: (eventToPublish as any).eventType,
                        payload: (eventToPublish as any).payload
                    }
                );
            }
            // If transaction completes successfully, it auto-commits
        } catch (error) {
            // Any error inside the transaction automatically rolls back
            logger.error(`Payment processing failed for transactionId: ${eventData.metadata?.transactionId}`, error);
            return this.handleTypeormError(error);
        }
    }

    public async dispute(reference: string) {
        try {
            const result = await AppDataSource.transaction(async manager => {
                const transactionRepo = manager.getRepository(Transaction);
                const escrowRepo = manager.getRepository(Escrow);
                const walletRepo = manager.getRepository(Wallet);
                const disputeRepo = manager.getRepository(Dispute);
                const bookingRepo = manager.getRepository(Booking);

                const transaction = await transactionRepo.findOne({
                    where: {reference: reference, status: TransactionStatus.SUCCESS},
                    relations: ['escrow', 'escrow.booking', 'wallet'],
                    lock: {mode: 'pessimistic_write'},
                });

                if (!transaction) {
                    logger.error(`Transaction not found for reference: ${reference}`);
                    return;
                }

                const escrow = transaction.escrow;

                if (!escrow) {
                    logger.error(`Escrow not found for transactionId: ${transaction.id}`);
                    return;
                }

                if (escrow.status !== EscrowStatus.PAID) {
                    logger.error(`Escrow was not PAID for transactionId: ${transaction.id}`);
                    return;
                }

                const existingDispute = await transactionRepo.findOne({
                    where: {
                        escrowId: escrow.id,
                        type: TransactionType.DISPUTE,
                    },
                    lock: {mode: 'pessimistic_read'},
                });

                if (existingDispute) {
                    logger.warn(`Dispute already exists for escrow ${escrow.id}`);
                    return;
                }


                const disputeTx = transactionRepo.create({
                    userId: transaction.userId!,
                    escrowId: transaction.escrow!.id,
                    amount: transaction.amount,
                    type: TransactionType.DISPUTE,
                    status: TransactionStatus.PENDING,
                    reference: reference,
                });

                const newDispute = disputeRepo.create({
                    transactionId: transaction.id,
                    amount: transaction.amount,
                    reason: 'Dispute initiated',
                });

                escrow.status = EscrowStatus.DISPUTED;

                const booking = escrow.booking;

                if (!booking) {
                    logger.error(`Booking not found for escrow: ${escrow.id}`);
                    return;
                }

                const wallet = transaction.wallet;

                if (!wallet) {
                    logger.error(`Wallet not found for transactionId: ${transaction.id}`);
                    return;
                }


                booking.status = BookingStatus.CANCELLED;
                wallet.pendingAmount = Number(wallet.pendingAmount) - Number(transaction.amount);
                wallet.totalBalance = Number(wallet.balance) + Number(wallet.pendingAmount);

                await manager.save([transaction, disputeTx, escrow, wallet, booking, newDispute]);

                return booking;
            });

            if (result) {
                await notify({
                    userId: result.professionalId,
                    userType: UserType.PROFESSIONAL,
                    type: NotificationType.CANCEL_BOOKING,
                    data: {...result, professional: undefined}
                });
            } else {
                logger.error("Dispute transaction failed")
            }
        } catch (error) {
            console.error(error);
            return this.handleTypeormError(error);
        }
    }

    public async refundBooking(bookingId: string, userId: string) {
        try {
            const booking = await this.bookingRepo.findOne({
                where: {id: bookingId, userId},
                relations: ["escrow"],
            });

            if (!booking) return this.responseData(404, true, "Booking not found");
            if (booking.status == BookingStatus.COMPLETED) return this.responseData(400, true, "Refund not allowed, booking was completed.");
            if (booking.escrow.status !== EscrowStatus.PAID) return this.responseData(400, true, "Refund not allowed");
            if (booking.escrow.refundStatus !== RefundStatus.NONE && booking.escrow.refundStatus !== RefundStatus.FAILED) return this.responseData(400, true, "Refund not allowed, booking already refunded");

            const paymentTx = await this.transactionRepo.findOne({
                where: {
                    escrowId: booking.escrow.id,
                    type: TransactionType.BOOKING_DEPOSIT,
                    status: TransactionStatus.SUCCESS,
                },
            });

            if (!paymentTx) return this.responseData(404, true, "Original payment not found");

            // 🔁 Idempotency guard
            const existingRefund = await this.transactionRepo.findOne({
                where: {
                    escrowId: booking.escrow.id,
                    type: TransactionType.REFUND,
                    status: In([TransactionStatus.SUCCESS, TransactionStatus.PENDING]),
                },
            });

            if (existingRefund) return this.responseData(200, false, "Refund already initiated");

            // 🔄 Create REFUND transaction (PENDING)
            const refundTx = this.transactionRepo.create({
                userId,
                escrowId: booking.escrow.id,
                amount: paymentTx.amount,
                type: TransactionType.REFUND,
                status: TransactionStatus.FAILED,
                reference: paymentTx.reference,
            });

            await this.transactionRepo.save(refundTx);

            const response = await axios.post(
                "https://api.paystack.co/refund",
                {
                    transaction: paymentTx.reference,
                    amount: paymentTx.amount,
                },
                {
                    headers: {
                        Authorization: `Bearer ${this.PAYSTACK_SECRET_KEY}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.status === 200 && response.data.status) {
                refundTx.status = TransactionStatus.PENDING;
                booking.status = BookingStatus.DISPUTED;

                await this.bookingRepo.save(booking);
                await this.transactionRepo.save(refundTx);

                await notify({
                    userId: booking.professionalId,
                    userType: UserType.PROFESSIONAL,
                    type: NotificationType.DISPUTED,
                    data: {...booking, professional: undefined}
                });

                return this.responseData(200, false, "Refund was initiated successfully", response.data.data);
            }

            return this.responseData(400, false, "Refund failed to initiated");
        } catch (error) {
            console.error(error);
            return this.handleTypeormError(error);
        }
    }

    public async refundSuccessful(reference: string) {
        try {
            const result = await AppDataSource.transaction(async manager => {
                const refundTx = await manager.findOne(Transaction, {
                    where: {
                        reference,
                        type: TransactionType.REFUND,
                    },
                    relations: ["escrow", "escrow.booking", "escrow.booking.professional"],
                    lock: {mode: "pessimistic_write"},
                });

                if (!refundTx || refundTx.status === TransactionStatus.SUCCESS) {
                    return;
                }

                const escrow = refundTx.escrow;
                if (!escrow) {
                    throw new Error("Escrow not found for refund transaction");
                }

                if (escrow.refundStatus === RefundStatus.SUCCESS) {
                    logger.info(`Escrow already refunded: ${escrow.id}`);
                    return null;
                }

                if (escrow.status !== EscrowStatus.PAID) {
                    throw new Error("Escrow not in refundable state");
                }

                const wallet = await manager.findOne(Wallet, {
                    where: {professionalId: escrow.booking.professionalId},
                    lock: {mode: "pessimistic_write"},
                });

                if (!wallet) throw new Error("Wallet not found");

                // 💸 Reverse pending funds
                if (Number(wallet.pendingAmount) < Number(escrow.amount)) {
                    throw new Error("Invalid wallet state");
                }

                wallet.pendingAmount = Number(wallet.pendingAmount) - Number(escrow.amount);
                wallet.totalBalance = Number(wallet.balance) + Number(wallet.pendingAmount);

                escrow.refundStatus = RefundStatus.SUCCESS;
                escrow.status = EscrowStatus.CANCELLED;
                refundTx.status = TransactionStatus.SUCCESS;

                await manager.save([wallet, escrow, refundTx]);
                return refundTx;
            });

            if (result) {
                logger.info(`💸 Refund completed for transaction:${result.id}}`);
            } else {
                logger.info(`💸 Refund failed for reference:${reference}}`);
            }
        } catch (error) {
            console.error(error);
            this.handleTypeormError(error);
        }
    }

    public async refundFailed(reference: string) {
        try {
            const result = await AppDataSource.transaction(async manager => {
                const refundTx = await manager.findOne(Transaction, {
                    where: {
                        reference,
                        type: TransactionType.REFUND,
                    },
                    relations: ["escrow", "escrow.booking", "escrow.booking.user"],
                    lock: {mode: "pessimistic_write"},
                });

                if (!refundTx || refundTx.status === TransactionStatus.SUCCESS) {
                    return;
                }

                const escrow = refundTx.escrow;
                if (!escrow) {
                    throw new Error("Escrow not found for refund transaction");
                }

                if (escrow.refundStatus === RefundStatus.SUCCESS) {
                    logger.info(`Escrow already refunded: ${escrow.id}`);
                    return null;
                }

                escrow.refundStatus = RefundStatus.FAILED;
                refundTx.status = TransactionStatus.FAILED;

                await manager.save([escrow, refundTx]);

                return refundTx;
            });

            if (result) {
                await notify({
                    userId: result.userId,
                    userType: UserType.USER,
                    type: NotificationType.REFUND_FAILED,
                    data: result
                });
                logger.info(`💸 Refund completed for transaction:${result.id}}`);
            } else {
                logger.info(`💸 Refund failed for reference:${reference}}`);
            }
        } catch (error) {
            console.error(error);
            this.handleTypeormError(error);
        }
    }


    public async webhook(payload: any, signature: any) {
        const hash = crypto
            .createHmac('sha512', this.PAYSTACK_SECRET_KEY)
            .update(payload)
            .digest('hex');

        if (hash !== signature) return this.responseData(400, true, 'Invalid signature');

        const event = JSON.parse(payload.toString());
        const data = event.data;

        let queuePayload = {data};
        let queueName = QueueNames.PAYMENT;
        let eventType;

        switch (event.event) {
            case 'charge.success':

                eventType = QueueEvents.PAYMENT_CHARGE_SUCCESSFUL
                await RabbitMQ.publishToExchange(queueName, eventType, {
                    eventType: eventType,
                    payload: queuePayload,
                });
                break;

            case 'charge.failed':
                console.log('Payment failed:', event.data.reference);
                break;
            case 'charge.dispute.create':
                break;
            case 'charge.dispute.remind':
                break;
            case 'charge.dispute.resolve':
                break;
            case 'refund.processed':
                // await this.refundSuccessful(data);

                eventType = QueueEvents.PAYMENT_REFUND_SUCCESSFUL
                await RabbitMQ.publishToExchange(queueName, eventType, {
                    eventType: eventType,
                    payload: {reference: data.transaction_reference},
                });
                break;

            case 'refund.failed':
                eventType = QueueEvents.PAYMENT_REFUND_FAILED
                await RabbitMQ.publishToExchange(queueName, eventType, {
                    eventType: eventType,
                    payload: {reference: data.transaction_reference},
                });
                break;
            case 'subscription.create':
            case 'invoice.payment_failed':
                // Handle recurring payments
                break;
            case "transfer.success":
                // await handleTransferSuccess(event.data);
                break;

            case "transfer.failed":
                // await handleTransferFailed(event.data);
                break;

            default:
                console.log('Unhandled event:', event.event);
        }

        // Always respond 200 quickly
        return this.responseData(200, false, null);
    }


    // public async withdraw(userId: string, amount: number) {
    //     try {
    //         const response = await axios.post(
    //             'https://api.paystack.co/transferrecipient',
    //             {
    //                 name: string,
    //                 account_number: string;
    //                 bank_code: string;
    //             },
    //             {
    //                 headers: {
    //                     Authorization: `Bearer ${this.PAYSTACK_SECRET_KEY}`,
    //                     'Content-Type': 'application/json'
    //                 }
    //             }
    //         );
    //     } catch (error) {
    //
    //     }
    // }

    async verifyBookingTransaction(bookingId: string, userId: string) {
        try {
            const booking = await this.bookingRepo.findOne({
                where: {id: bookingId, userId},
                relations: ["escrow", "user"]
            });

            if (!booking) return this.responseData(404, true, "Booking was not found");
            const escrow = booking.escrow;

            if (escrow && escrow.status !== EscrowStatus.PAID) return this.responseData(400, true, "Invalid Refund");

            const payment = await this.transactionRepo.findOne({
                where: {
                    escrowId: escrow.id,
                    type: TransactionType.BOOKING_DEPOSIT,
                    status: TransactionStatus.PENDING,
                    userId: userId,
                },
                relations: ["escrow", "escrow.booking", "escrow.booking.professional"],
            });

            if (!payment) return this.responseData(404, true, "Payment was not found");

            // Verify the transaction
            const response = await axios.get(
                `https://api.paystack.co/transaction/verify/${payment.reference}`,
                {
                    headers: {
                        Authorization: `Bearer ${this.PAYSTACK_SECRET_KEY}`
                    }
                }
            );

            const {data} = response.data;
            return this.responseData(200, false, "Booking transaction has been verified", {status: data.status});
        } catch (error) {
            logger.error(error);
            return this.handleTypeormError(error);
        }
    }
}