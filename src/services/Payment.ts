import axios from 'axios'
import crypto from 'crypto';
import BaseService from './Service';
import {Booking, BookingStatus} from "../entities/Booking";
import {AppDataSource} from "../data-source";
import env, {EnvKey} from "../config/env";
import {Escrow, EscrowStatus} from "../entities/Escrow";
import {Transaction, TransactionStatus, TransactionType} from "../entities/Transaction";
import logger from "../config/logger";
import {Wallet} from "../entities/Wallet";

export default class Payment extends BaseService {

    private readonly bookingRepo = AppDataSource.getRepository(Booking);
    private readonly transactionRepo = AppDataSource.getRepository(Transaction);
    private readonly walletRepo = AppDataSource.getRepository(Wallet);

    private readonly escrowRepo = AppDataSource.getRepository(Escrow);

    private readonly PAYSTACK_SECRET_KEY = env(EnvKey.PAYSTACK_SECRET_KEY)!;


    public async initializeBookingPayment(bookingId: string, userId: string) {
        try {
            const booking = await this.bookingRepo.findOne({
                where: {id: bookingId, userId: userId},
                relations: ["escrow", "user"]
            });

            if (!booking) return this.responseData(404, true, "Booking was not found");
            // if (booking.status !== BookingStatus.ACCEPTED) return this.responseData(400, true, "Booking has not yet been accepted");

            if (booking.escrow.status !== EscrowStatus.PENDING) return this.responseData(400, true, "Cannot pay for this booking");

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
                status: TransactionStatus.PENDING,
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

                await this.transactionRepo.save(transaction);

                return this.responseData(200, false, "Payment was initiated successfully", response.data.data);
            }

            transaction.status = TransactionStatus.FAILED;
            await this.transactionRepo.save(transaction);

            return this.responseData(500, true, "Payment initialization failed");
        } catch (error) {
            console.error(error);
            return this.handleTypeormError(error);
        }
    }

     public async successfulCharge(eventData: any) {
        try {
            const {transactionId} = eventData.metadata;
            const payment = await this.transactionRepo.findOne({
                where: {id: transactionId}, relations: ["escrow", "escrow.booking", "escrow.booking.professional"],
            });

            if (!payment) {
                logger.error("Payment was not found" + transactionId);
                return;
            }

            // Prevent double-processing (idempotency)
            if (payment.status === TransactionStatus.SUCCESS) {
                logger.info(`Payment already processed: ${transactionId}`);
                // await queryRunner.rollbackTransaction();
                return;
            }

            await this.transactionRepo.update(
                {id: transactionId},
                {
                    status: TransactionStatus.SUCCESS,
                }
            );

            if (payment.type === TransactionType.BOOKING_DEPOSIT) {
                const escrow = payment.escrow!;

                // Update escrow status
                await this.escrowRepo.update(
                    {id: escrow.id},
                    {status: EscrowStatus.PAID}
                );

                // Fetch wallet of professional
                const wallet = await this.walletRepo.findOne({
                    where: {professionalId: escrow.booking.professionalId},
                });

                if (wallet) {
                    const newPendingAmount = wallet.pendingAmount + Number(escrow.amount);
                    const newTotalBalance = wallet.balance + newPendingAmount;

                    await this.walletRepo.update(
                        {id: wallet.id},
                        {
                            pendingAmount: newPendingAmount,
                            totalBalance: newTotalBalance,
                        }
                    );
                }
            }

            logger.info(`🤑 Payment was successful for transaction:${transactionId}`);
        } catch (error) {
            logger.error(error);
            return this.handleTypeormError(error);
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

        // Handle events
        switch (event.event) {
            case 'charge.success':
                console.log(event)
                // const name = `charge-successful-${Date.now()}`;
                //
                // await bree.add({
                //     name: name,
                //     path: './src/jobs/charge-successful.js',
                //     worker: {
                //         workerData: { data }
                //     }
                // });
                //
                // // Run job once
                // await bree.start(name);
                await this.successfulCharge(data);
                break;
            case 'charge.failed':
                console.log('Payment failed:', event.data.reference);
                break;
            case 'refund.processed':
                console.log('Refund Successful:', event.data.reference);
                break;
            case 'refund.failed':
                console.log('Refund failed:', event.data.reference);
                break;
            case 'subscription.create':
            case 'invoice.payment_failed':
                // Handle recurring payments
                break;

            default:
                console.log('Unhandled event:', event.event);
        }

        // Always respond 200 quickly
        return this.responseData(200, false, null);
    }

    // public async refundTransaction(bookingId, userId) {
    //     try {
    //         const payment = await PaymentModel.findOne({bookingId, userId});
    //         if (!payment) return this.responseData(404, true, "Payment was not found");
    //
    //         if (payment && payment.status == "success") return this.responseData(400, true, "Invalid Refund");
    //
    //         const response = await axios.post(
    //             'https://api.paystack.co/refund',
    //             {
    //                 transaction: transactionId,
    //                 amount // optional, in kobo
    //             },
    //             {
    //                 headers: {
    //                     Authorization: `Bearer ${this.PAYSTACK_SECRET_KEY}`,
    //                     'Content-Type': 'application/json'
    //                 }
    //             }
    //         );
    //
    //         console.log(response.data);
    //         return this.responseData(200, false, "Refund was initiated successfully", response.data);
    //     } catch (error) {
    //         logger.error(error);
    //         return this.handleTypeormError(error);
    //     }
    // }

    // async verifyBookingTransaction(bookingId: string, userId: string) {
    //     try {
    //         const payment = await PaymentModel.findOne({ bookingId, userId }).lean();
    //         if (!payment) return this.responseData(404, true, "Payment was not found");
    //
    //         // Verify the transaction
    //         const response = await axios.get(
    //             `https://api.paystack.co/transaction/verify/${payment.paystackReference}`,
    //             {
    //                 headers: {
    //                     Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`
    //                 }
    //             }
    //         );
    //
    //         const { data } = response.data;
    //         return this.responseData(200, false, "message", { status: data.status });
    //     } catch (error) {
    //         logger.error(error);
    //         const { statusCode, message } = this.handleMongoError(error);
    //         return this.responseData(statusCode, true, message);
    //     }
    // }


}