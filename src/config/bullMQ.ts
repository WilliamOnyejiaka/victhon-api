import { Queue } from 'bullmq';
import env, { EnvKey } from "./env";
import {JobType} from "../types/constants";

const connection = { url: env(EnvKey.REDIS_URL)! }


export const Queues = {
    offlineNotification: new Queue(JobType.OFFLINE_NOTIFICATION, { connection }),
    inbox: new Queue(JobType.INBOX, { connection }),

    // newBooking: new Queue(QueueType.NEW_BOOKING, { connection }),
    // updateRatingAgg: new Queue(QueueType.UPDATE_RATING_AGG, { connection }),
    // newView: new Queue(QueueType.NEW_VIEW, { connection }),
    // notificationScheduler: new Queue(QueueType.NOTIFICATION_SCHEDULAR, { connection }),
};

