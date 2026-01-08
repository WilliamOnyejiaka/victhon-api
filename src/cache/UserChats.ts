import redisClient from "../config/redis";
import logger from "../config/logger";
import {UserType} from "../types/constants";

export default class UserChats {
    protected readonly preKey: string;
    protected readonly expirationTime: number;

    constructor(userType: UserType, expirationTime: number = 1800) {
        this.preKey = `${userType}`;
        this.expirationTime = expirationTime;
    }

    protected key(userId: string) {
        return `${this.preKey}:${userId}:chat`;
    }

    /** Add a chatId to the user's chat set */
    public async add(userId: string, chatId: string): Promise<boolean> {
        const key = this.key(userId);
        try {
            const added = await redisClient.sadd(key, chatId);
            if (added) {
                logger.info(`✅🤝 Cached chat:${chatId} for key:${key}`);
            } else {
                logger.info(`ℹ️ chat:${chatId} already exists in key:${key}`);
            }

            return true;
        } catch (error) {
            console.error(`🛑 Failed to cache chat:${chatId} for key:${key}: `, error);
            return false;
        }
    }

    /** Remove a chatId from the set */
    public async remove(userId: string, chatId: string): Promise<boolean> {
        const key = this.key(userId);
        try {
            const removed = await redisClient.srem(key, chatId);
            if (removed) {
                logger.info(`✅🤝 Removed chat:${chatId} from key:${key}`);
            } else {
                logger.warn(`⚠️ chat:${chatId} not found in key:${key}`);
            }
            return removed > 0;
        } catch (error) {
            logger.error(`🛑 Failed to remove chat:${chatId} from key:${key}: `, error);
            return false;
        }
    }

    /** Check if a chatId exists in the set */
    public async present(userId: string, chatId: string): Promise<boolean> {
        const key = this.key(userId);
        try {
            const exists = await redisClient.sismember(key, chatId);
            return exists === 1;
        } catch (error) {
            logger.error(`🛑 Failed to check chat:${chatId} in key:${key}: `, error);
            return false;
        }
    }

    /** Delete the entire set */
    public async delete(userId: string): Promise<boolean> {
        const key = this.key(userId);
        try {
            const result = await redisClient.del(key);
            if (result > 0) {
                logger.info(`🗑️ Deleted entire chat set for key:${key}`);
            } else {
                logger.warn(`⚠️ No set found to delete for key:${key}`);
            }
            return result > 0;
        } catch (error) {
            logger.error(`🛑 Failed to delete set for key:${key}: `, error);
            return false;
        }
    }

    /** List all chatIds in the set */
    public async list(userId: string): Promise<string[]> {
        const key = this.key(userId);
        try {
            return await redisClient.smembers(key);
        } catch (error) {
            logger.error(`🛑 Failed to list chats for key:${key}: `, error);
            return [];
        }
    }
}
