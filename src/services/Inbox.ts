import logger from "../config/logger";
import BaseService from "./Service";
import {Queues} from "../config/bullMQ";
import User from "./User";
import {AppDataSource} from "../data-source";
import {UserType} from "../types/constants";
import Professional from "./Professional";
import Message, {MessageStatus} from "../entities/MessageEntity";
import InboxEntity from "./../entities/InboxEntity"
import {In} from "typeorm";

const BATCH_CONFIG = {
    SMALL_THRESHOLD: 50,
    MEDIUM_THRESHOLD: 300,
    MAX_BATCH_SIZE: 50,
    DELAY_SMALL_MS: 550,
    DELAY_MEDIUM_MS: 1100,
    DELAY_LARGE_MS: 1800,
    BATCH_PAUSE_MS: 900,
    HEARTBEAT_INTERVAL_MS: 15_000,
    MAX_CONCURRENT_DELIVERIES: 5_000,
};

export default class Inbox extends BaseService {

    private readonly userService = new User();
    private readonly proService = new Professional();


    private async* idBatchGenerator(userId: string, userType: UserType, batchSize: number) {
        let offset = 0;

        while (true) {
            const batch = await AppDataSource.getRepository(InboxEntity).find({
                where: {receiverId: userId, receiverType: userType},
                select: ["id", "message","createdAt"],
                order: {createdAt: "ASC"},
                skip: offset,
                take: batchSize,
            });

            if (batch.length === 0) break;

            yield batch.map(n => ({id: n.message.id, senderId: n.message.senderId}));
            offset += batch.length;
        }
    }

    private async getPendingCount(userId: string, userType: UserType): Promise<number> {
        return await AppDataSource.getRepository(InboxEntity).count({
            where: {receiverId: userId, receiverType: userType}
        });
    }

    private async updatePending(ids: string[], userId: string, userType: UserType): Promise<void> {
        if (ids.length === 0) return;
        // await AppDataSource.getRepository(Message).update(
        //     {id: In(ids), receiverId: userId, receiverType: userType, status: MessageStatus.PENDING},
        //     {status: MessageStatus.DELIVERED}
        // );

        // Run in a single transaction
        await AppDataSource.transaction(async (manager) => {
            // 1️⃣ Update the messages to DELIVERED
            await manager.update(
                Message,
                { id: In(ids), receiverId: userId, receiverType: userType, status: MessageStatus.PENDING },
                { status: MessageStatus.DELIVERED }
            );

            // 2️⃣ Delete corresponding inbox entries
            await manager.delete(
                InboxEntity,
                { message: { id: In(ids) }, receiverId: userId, receiverType: userType }
            );
        });
    }

    public async deliverInbox(userId: string, userType: UserType) {
        try {
            const total = await this.getPendingCount(userId, userType);
            if (total === 0) {
                logger.info(`🙅 no inbox found for ${userType}:${userId}`);
                return;
            }

            const batchSize = total <= BATCH_CONFIG.SMALL_THRESHOLD
                ? 1
                : total <= BATCH_CONFIG.MEDIUM_THRESHOLD
                    ? 12
                    : BATCH_CONFIG.MAX_BATCH_SIZE;

            for await (const idBatch of this.idBatchGenerator(userId, userType, batchSize)) {
                const socketId = userType == UserType.PROFESSIONAL ? await this.proService.getSocketId(userId) : await this.userService.getSocketId(userId);
                if (!socketId) break;

                if (idBatch.length === 0) continue;
                const ids = idBatch.map(element => element.id);

                await this.updatePending(ids, userId, userType);

                const delay = total <= BATCH_CONFIG.SMALL_THRESHOLD
                    ? BATCH_CONFIG.DELAY_SMALL_MS
                    : total <= BATCH_CONFIG.MEDIUM_THRESHOLD
                        ? BATCH_CONFIG.DELAY_MEDIUM_MS
                        : BATCH_CONFIG.DELAY_LARGE_MS;

                await this.notify(idBatch, userId, userType, delay);
            }
        } catch (error) {
            console.error(error);
            this.handleTypeormError(error);
        }
    }

    public async notify(ids: { id: string; senderId: string; }[], userId: string, userType: UserType, delay: number) {
        await Queues.inbox.add('offline', {data: {ids, userId, userType}}, {
            jobId: `offline-${userId}-${Date.now()}-${Math.random()}`,
            priority: 1,
            delay: delay
        });
    }
}
