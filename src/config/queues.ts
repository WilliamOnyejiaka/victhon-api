import { Server } from 'socket.io';
import user from '../queues/user';
import notification from '../queues/notification';
import { exchange, QueueConfig } from '../types';
import payment from "../queues/payment";

export const QUEUES: Record<string, QueueConfig> = {
    [user.config.name]: user.config,
    [notification.config.name]: notification.config,
    [payment.config.name]: payment.config,
};

export type QueueName = keyof typeof QUEUES;