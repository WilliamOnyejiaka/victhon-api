import {Server} from "socket.io";
import RabbitMQRouter from "../utils/RabbitMQRouter";
import {Namespaces, QueueEvents, QueueNames, UserType} from "../types/constants";
import BaseService from "../services/Service";
import logger from "../config/logger";
import User from "../services/User";
import {exchange} from "../types";
import {AppDataSource} from "../data-source";
import Professional from "../services/Professional";
import Inbox from "../entities/InboxEntity";
import Message, {MessageStatus} from "../entities/MessageEntity";
import {In} from "typeorm";

const chat = new RabbitMQRouter({
    name: QueueNames.CHAT,
    durable: true,
    routingKeyPattern: 'chat.*',
    exchange: exchange,
    handlers: {}
});

const service = new BaseService();

chat.route(QueueEvents.CHAT_SEND_MESSAGE, async (message: any, io: Server) => {
    const {payload: {newMessage, receiverId, receiverType, senderId}} = message;

    try {
        const userService = new User();
        const proService = new Professional();
        const socketId = receiverType == UserType.PROFESSIONAL ? await proService.getSocketId(receiverId) : await userService.getSocketId(receiverId);
        const senderSocketId = receiverType == UserType.USER ? await proService.getSocketId(senderId) : await userService.getSocketId(senderId);


        if (socketId) {
            await AppDataSource.getRepository(Message).update({
                id: newMessage.id,
            }, {status: MessageStatus.DELIVERED});

            const socketNamespace = io.of(Namespaces.BASE);
            socketNamespace.to(socketId).emit("receive-message", newMessage);
            if (senderSocketId) socketNamespace.to(senderSocketId).emit("message-delivered", {messageId: newMessage.id});

            logger.info(`📧 New message for ${receiverType}:${receiverId}`);
            return;
        } else {
            logger.info(`📴 ${receiverType}:${receiverId} is offline`);

            await AppDataSource.transaction(async (manager) => {
                // await manager.update(Message, {
                //     id: newMessage.id,
                // }, {status: MessageStatus.DELIVERED});

                const existingInbox = await manager.findOne(Inbox, {
                    where: {
                        receiverId,
                        receiverType,
                        message: {id: newMessage.id},
                    },
                });

                if (!existingInbox) {
                    const newInbox = manager.create(Inbox, {
                        receiverId,
                        receiverType,
                        message: newMessage
                    });

                    await manager.save(newInbox);
                }
            });
            logger.info(`📫 ${receiverType}:${receiverId} message has been added to inbox successfully.`);
        }
    } catch (error) {
        console.error("CHAT_SEND_MESSAGE: ", error);
        service.handleTypeormError(error);
    }
});

chat.route(QueueEvents.CHAT_MARK_AS_READ, async (message: any, io: Server) => {
    const {payload: {chunk, userId, userType}} = message;

    try {
        if (!chunk?.length) return;
        const messageRepo = AppDataSource.getRepository(Message);

        await AppDataSource.getRepository(Message).update(
            {id: In(chunk), receiverId: userId, receiverType: userType, status: MessageStatus.DELIVERED},
            {status: MessageStatus.READ}
        );

        const messages = await messageRepo.find({
            where: {
                id: In(chunk),
                receiverId: userId,
                receiverType: userType
            },
            select: ["id", "senderId"]
        });
        const messagesBySender: Record<string, string[]> = {};
        for (const msg of messages) {
            if (!messagesBySender[msg.senderId]) messagesBySender[msg.senderId] = [];
            messagesBySender[msg.senderId]!.push(msg.id);
        }

        const userService = new User();
        const proService = new Professional();
        const socketNamespace = io.of(Namespaces.BASE);

        await Promise.all(Object.entries(messagesBySender).map(async ([senderId, messageIds]) => {
            const socketId = userType === UserType.USER
                ? await proService.getSocketId(senderId)
                : await userService.getSocketId(senderId);

            if (socketId) {
                socketNamespace.to(socketId).emit("messages-read", {
                    readerId: userId,
                    messageIds, // only messages this sender sent
                });
            }
        }));
    } catch (error) {
        console.error("CHAT_MARK_AS_READ error: ", error);

        service.handleTypeormError(error);
    }
});

chat.route(QueueEvents.CHAT_DELETE_MESSAGES, async (message: any, io: Server) => {
    const {payload: {chunk, userId, userType}} = message;

    try {
        if (!chunk?.length) return;
        const messageRepo = AppDataSource.getRepository(Message);

        await messageRepo.delete({
            id: In(chunk),
            senderId: userId,
            senderType: userType
        });

        const userService = new User();
        const proService = new Professional();
        const socketNamespace = io.of(Namespaces.BASE);

        const socketId = userType === UserType.PROFESSIONAL
            ? await proService.getSocketId(userId)
            : await userService.getSocketId(userId);

        if (socketId) {
            socketNamespace.to(socketId).emit("messages-deleted", {
                messageIds: chunk
            });
        }
    } catch (error) {
        console.error("CHAT_MARK_AS_READ error: ", error);
        service.handleTypeormError(error);
    }
});


chat.route(QueueEvents.CHAT_SEND_ATTACHMENT, async (message: any, io: Server) => {
    const {payload: {newMessage, receiverId, receiverType, senderId}} = message;

    try {
        const userService = new User();
        const proService = new Professional();
        const socketId = receiverType == UserType.PROFESSIONAL ? await proService.getSocketId(receiverId) : await userService.getSocketId(receiverId);
        const senderSocketId = receiverType == UserType.USER ? await proService.getSocketId(senderId) : await userService.getSocketId(senderId);
        const socketNamespace = io.of(Namespaces.BASE);

        if (senderSocketId) socketNamespace.to(senderSocketId).emit("attachment-sent", newMessage);

        if (socketId) {
            await AppDataSource.getRepository(Message).update({
                id: newMessage.id,
            }, {status: MessageStatus.DELIVERED});

            socketNamespace.to(socketId).emit("receive-attachment", newMessage);
            if (senderSocketId) socketNamespace.to(senderSocketId).emit("attachment-delivered", {messageId: newMessage.id});

            logger.info(`📧 New attachment message for ${receiverType}:${receiverId}`);
            return;
        } else {
            logger.info(`📴 ${receiverType}:${receiverId} is offline`);

            await AppDataSource.transaction(async (manager) => {

                const existingInbox = await manager.findOne(Inbox, {
                    where: {
                        receiverId,
                        receiverType,
                        message: {id: newMessage.id},
                    },
                });

                if (!existingInbox) {
                    const newInbox = manager.create(Inbox, {
                        receiverId,
                        receiverType,
                        message: newMessage
                    });

                    await manager.save(newInbox);
                }
            });
            logger.info(`📫 ${receiverType}:${receiverId} attachment message has been added to inbox successfully.`);
        }
    } catch (error) {
        console.error("CHAT_SEND_ATTACHMENT: ", error);
        service.handleTypeormError(error);
    }
});

export default chat;