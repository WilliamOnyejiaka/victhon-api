import { Server } from 'socket.io';
import user from '../queues/user';
import notification from '../queues/notification';
import { exchange, QueueConfig } from '../types';

export const QUEUES: Record<string, QueueConfig> = {
    [user.config.name]: user.config,
    [notification.config.name]: notification.config
};

export type QueueName = keyof typeof QUEUES;