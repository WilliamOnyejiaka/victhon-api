import { Queue } from 'bullmq';
import env, { EnvKey } from "./env";
import { QueueType } from "../types/constants";

const connection = { url: env(EnvKey.REDIS_URL)! };

export const Queues = {
    notification: new Queue(QueueType.NOTIFICATION, { connection }),
    newBooking: new Queue(QueueType.NEW_BOOKING, { connection }),
    updateRatingAgg: new Queue(QueueType.UPDATE_RATING_AGG, { connection }),
    newView: new Queue(QueueType.NEW_VIEW, { connection }),
    notificationScheduler: new Queue(QueueType.NOTIFICATION_SCHEDULAR, { connection }),
};

