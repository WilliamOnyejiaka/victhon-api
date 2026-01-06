import logger from "../config/logger";
import {Notification, NotificationStatus} from "../entities/Notification";
import BaseService from "./Service";
import {Queues} from "../config/bullMQ";
import User from "./User";
import {AppDataSource} from "../data-source";
import {UserType} from "../types/constants";
import Professional from "./Professional";

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

export default class OfflineNotification extends BaseService {

    private readonly userService = new User();
    private readonly proService = new Professional();


    private async* idBatchGenerator(userId: string, userType: UserType, batchSize: number) {
        let offset = 0;

        const user = userType == UserType.PROFESSIONAL ? {professionalId: userId} : {userId: userId};

        while (true) {
            const batch = await AppDataSource.getRepository(Notification).find({
                where: {...user, status: NotificationStatus.PENDING},
                select: ["id"],
                order: {createdAt: "ASC"},
                skip: offset,
                take: batchSize,
            });

            if (batch.length === 0) break;

            yield batch.map(n => n.id);
            offset += batch.length;
        }
    }

    private async getPendingCount(userId: string, userType: UserType): Promise<number> {
        const user = userType == UserType.PROFESSIONAL ? {professionalId: userId} : {userId: userId};

        return await AppDataSource.getRepository(Notification).count({
            where: {...user, status: NotificationStatus.PENDING}
        });
    }

    private async updatePending(ids: string[]) {
        if (ids.length === 0) return;
        await AppDataSource.getRepository(Notification).update(
            ids,
            {status: NotificationStatus.SENT}
        );
    }

    public async deliverOfflineNotifications(userId: string, userType: UserType) {
        try {
            const total = await this.getPendingCount(userId, userType);
            if (total === 0) {
                logger.info(`🙅 no pending notifications for ${userType}:${userId}`);
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

                await this.updatePending(idBatch);

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

    public async notify(ids: string[], userId: string, userType: UserType, delay: number) {
        await Queues.offlineNotification.add('offline', {data: {ids, userId, userType}}, {
            jobId: `offline-${userId}-${Date.now()}-${Math.random()}`,
            priority: 1,
            delay: delay
        });
    }
}
