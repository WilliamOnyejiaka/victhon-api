import {Server} from "socket.io";
import RabbitMQRouter from "../utils/RabbitMQRouter";
import notify from "../services/notify";
import BaseService from "../services/Service";
import {QueueEvents, QueueNames} from "../types/constants";
import {exchange} from "../types";
import logger from "../config/logger";
import UserCache from "../cache/UserCache";
import {UserType} from "../types/constants";
import Payment from "../services/Payment";
import {NotificationType} from "../entities/Notification";
import {AppDataSource} from "../data-source";
import {Transaction, TransactionStatus, TransactionType} from "../entities/Transaction";
import {Booking, BookingStatus} from "../entities/Booking";
import {In, LessThanOrEqual, MoreThanOrEqual, Not} from "typeorm";
import {Wallet} from "../entities/Wallet";
import {Escrow} from "../entities/Escrow";

const service = new BaseService();

const wallet = new RabbitMQRouter({
    name: QueueNames.WALLET,
    durable: true,
    routingKeyPattern: 'wallet.*',
    exchange: exchange,
    handlers: {}
});

wallet.route(QueueEvents.WALLET_ESCROW_RELEASE, async (message: any) => {
    const {escrowId, professionalId, walletId} = message.payload;

    try {
        const result = await AppDataSource.transaction(async manager => {
            const escrow = await manager.findOne(Escrow, {
                where: {id: escrowId},
            });

            if (!escrow) {
                throw new Error("Escrow not found");
            }

            // 🔒 lock wallet
            const wallet = await manager.findOne(Wallet, {
                where: {id: walletId},
                lock: {mode: "pessimistic_write"},
            });

            if (!wallet) {
                throw new Error("Wallet not found");
            }

            // 🧱 idempotency guard
            const existingTx = await manager.findOne(Transaction, {
                where: {
                    escrowId,
                    type: TransactionType.ESCROW_RELEASE,
                },
            });

            if (existingTx) {
                return;
            }

            if (wallet.pendingAmount < escrow.amount) {
                throw new Error("Insufficient pending balance");
            }

            const newPending = Number(wallet.pendingAmount) - Number(escrow.amount);
            const newBalance = Number(wallet.balance) + Number(escrow.amount);

            await manager.update(
                Wallet,
                {id: wallet.id},
                {
                    pendingAmount: newPending,
                    balance: newBalance,
                    totalBalance: Number(newPending) + Number(newBalance),
                }
            );

            const tx = manager.create(Transaction, {
                professionalId,
                type: TransactionType.ESCROW_RELEASE,
                amount: escrow.amount,
                escrow: escrow,
                wallet: wallet,
                status: TransactionStatus.SUCCESS,
            });

            return await manager.save(tx);
        });

        await notify({
            userId: professionalId,
            userType: UserType.PROFESSIONAL,
            type: NotificationType.ESCROW_RELEASE,
            data: result
        });

        logger.info(`✅ Escrow released for escrow ${escrowId}`);
    } catch (error) {
        console.error(error);
    }
});


// wallet.route(QueueEvents.WALLET_ESCROW_RELEASE, async (message: any, io: Server) => {
//     const {payload: {escrowId, professionalId,walletId}} = message;
//
//     try {
//         const data = await AppDataSource.transaction(async (manager) => {
//             const lockedWallet = await manager.findOne(Wallet, {
//                 where: { id: walletId },
//                 lock: { mode: "pessimistic_write" },
//             });
//
//             if (!lockedWallet) {
//                 throw new Error("Wallet not found");
//             }
//
//             if (lockedWallet.pendingAmount < escrow.amount) {
//                 throw new Error("Insufficient pending balance");
//             }
//
//             // 1️⃣ Update wallet balances
//             const newPendingAmount =
//                 Number(lockedWallet.pendingAmount) - Number(escrow.amount);
//
//             const newBalance =
//                 Number(lockedWallet.balance) + Number(escrow.amount);
//
//             const newTotalBalance = newBalance + newPendingAmount;
//
//             await manager.update(
//                 Wallet,
//                 { id: lockedWallet.id },
//                 {
//                     pendingAmount: newPendingAmount,
//                     balance: newBalance,
//                     totalBalance: newTotalBalance,
//                 }
//             );
//
//             // 2️⃣ Record transaction
//             const transaction = manager.create(Transaction, {
//                 professionalId,
//                 type: TransactionType.ESCROW_RELEASE,
//                 amount: escrow.amount,
//                 escrow: { id: escrow.id },
//                 wallet: { id: lockedWallet.id },
//                 status: TransactionStatus.SUCCESS,
//             });
//
//             return await manager.save(transaction);
//         });
//
//
//         await notify({
//             userId: professionalId,
//             userType: UserType.PROFESSIONAL,
//             type: NotificationType.ESCROW_RELEASE,
//             data: data
//         });
//
//         logger.info(`e👌 Escrow release was completed for transaction:${data.id}`);
//     } catch (error) {
//         service.handleTypeormError(error);
//     }
//
// });


export default wallet;