import {Server} from "socket.io";
import RabbitMQRouter from "../utils/RabbitMQRouter";
import {CdnFolders, Namespaces, QueueEvents, QueueNames, ResourceType, UserType} from "../types/constants";
import BaseService from "../services/Service";
import logger from "../config/logger";
import User from "../services/User";
import {exchange, FailedFiles, UploadedFiles} from "../types";
import {AppDataSource} from "../data-source";
import Professional from "../services/Professional";
import Inbox from "../entities/InboxEntity";
import Message, {MessageStatus, MessageType} from "../entities/MessageEntity";
import {In} from "typeorm";
import Cloudinary from "../services/Cloudinary";
import {RabbitMQ} from "../services/RabbitMQ";
import Handler from "../io/handlers/Handler";
import deleteFiles from "../utils/deleteFiles";
import ChatParticipant from "../entities/ChatParticipant";
import MessageAttachment from "../entities/MessageAttachment";

const chat = new RabbitMQRouter({
    name: QueueNames.CHAT,
    durable: true,
    routingKeyPattern: 'chat.*',
    exchange: exchange,
    handlers: {}
});

const service = new BaseService();

chat.route(QueueEvents.CHAT_RECEIVE_MESSAGE, async (message: any, io: Server) => {
    const {payload: {newMessage, receiverId, receiverType, senderId}} = message;

    try {
        const userService = new User();
        const proService = new Professional();
        const receiverService = receiverType == UserType.PROFESSIONAL ? proService : userService;

        const socketId = receiverType == UserType.PROFESSIONAL ? await proService.getSocketId(receiverId) : await userService.getSocketId(receiverId);
        const senderSocketId = receiverType == UserType.USER ? await proService.getSocketId(senderId) : await userService.getSocketId(senderId);


        if (socketId) {
            const inChat = await receiverService.userChats.present(receiverId, newMessage.chat.id);
            const socketNamespace = io.of(Namespaces.BASE);

            await AppDataSource.transaction(async (manager) => {
                if (inChat) {
                    await manager.update(Message, {
                        id: newMessage.id,
                    }, {status: MessageStatus.READ});

                    if (senderSocketId) socketNamespace.to(senderSocketId).emit("message-read", {messageId: newMessage.id});
                } else {
                    await manager.update(Message, {
                        id: newMessage.id,
                    }, {status: MessageStatus.DELIVERED});

                    await manager.increment(ChatParticipant,
                        {
                            chat: {id: newMessage.chat.id},
                            ...(receiverType === UserType.USER
                                ? {userId: receiverId}
                                : {professionalId: receiverId}),
                        },
                        'unreadCount',
                        1
                    );
                }
            });


            socketNamespace.to(socketId).emit("receive-message", newMessage);
            if (senderSocketId) socketNamespace.to(senderSocketId).emit("message-delivered", {messageId: newMessage.id});

            logger.info(`📧 New message for ${receiverType}:${receiverId}`);
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

                await manager.increment(ChatParticipant,
                    {
                        chat: {id: newMessage.chat.id},
                        ...(receiverType === UserType.USER
                            ? {userId: receiverId}
                            : {professionalId: receiverId}),
                    },
                    'unreadCount',
                    1
                );
            });
            logger.info(`📫 ${receiverType}:${receiverId} message has been added to inbox successfully.`);
        }
    } catch (error) {
        console.error("CHAT_SEND_MESSAGE: ", error);
        service.handleTypeormError(error);
    }
});

chat.route(QueueEvents.CHAT_MARK_AS_READ, async (message: any, io: Server) => {
    const {payload: {chat, userType}} = message;

    try {
        const otherParticipant = chat.participants.find((participant: any) => {
            if (userType === UserType.USER) {
                return participant.professionalId != null;
            }

            if (userType === UserType.PROFESSIONAL) {
                return participant.userId != null;
            }

            return false;
        });

        if (!otherParticipant) {
            logger.error("☠ Other participant not found");
            return;
        }

        let senderId;
        let senderType;

        if (otherParticipant!.userId) {
            senderId = otherParticipant!.userId;
            senderType = UserType.USER;
        } else {
            senderId = otherParticipant!.professionalId!;
            senderType = UserType.PROFESSIONAL;
        }
        const userService = new User();
        const proService = new Professional();

        const senderSocketId = senderType == UserType.PROFESSIONAL ? await proService.getSocketId(senderId!) : await userService.getSocketId(senderId!);
        const socketNamespace = io.of(Namespaces.BASE);


        if (senderSocketId) {
            socketNamespace.to(senderSocketId).emit("messages-read", Handler.responseData(false, "Messages read", {chat}));
            logger.info(
                `✅📩 Messages read event emitted to ${senderType}:${senderId} for chat${chat.id}`
            );
        } else {
            logger.info(
                `❌ Failed to emit messages-read event: senderSocketId not found ${senderType}:${senderId} for chat:${chat.id}`
            );
        }
    } catch (error) {
        console.error("CHAT_MARK_AS_READ error: ", error);

        service.handleTypeormError(error);
    }
});

chat.route(QueueEvents.CHAT_MARK_MESSAGES_AS_READ, async (message: any, io: Server) => {
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
        const cloudinary = new Cloudinary();

        await AppDataSource.transaction(async (manager) => {

            logger.info(`💀 Deleting messages for ${userType}:${userId}...`);

            // const BATCH_SIZE = 1000; // you can adjust based on your DB limits
            // const allAttachments: MessageAttachment[] = [];
            //
            // for (let i = 0; i < chunk.length; i += BATCH_SIZE) {
            //     const batchIds = chunk.slice(i, i + BATCH_SIZE);
            //
            //     const attachments = await manager
            //         .getRepository(MessageAttachment)
            //         .createQueryBuilder("attachment")
            //         .leftJoin("attachment.message", "message")
            //         .where("message.id IN (:...ids)", { ids: batchIds })
            //         .getMany();
            //
            //     allAttachments.push(...attachments);
            // }

            const attachments = await manager
                .getRepository(MessageAttachment)
                .createQueryBuilder("attachment")
                .leftJoin("attachment.message", "message")
                .where("message.id IN (:...ids)", {ids: chunk})
                .getMany();

            const publicIds = attachments.map(attachment => attachment.publicId);
            await cloudinary.deleteFiles(publicIds);
            await manager.delete(Message, {
                id: In(chunk),
                senderId: userId,
                senderType: userType
            });

            logger.info(`💀 Messages for ${userType}:${userId} has been deleted successfully`);
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
    const {payload: {chatId, receiverId, receiverType, senderId, files, content, senderType}} = message;
    const messageRepo = AppDataSource.getRepository(Message);
    let uploadedFiles: UploadedFiles[] = [], publicIds: string[] = [], failedFiles: FailedFiles[] = [];
    const cloudinary = new Cloudinary();

    try {
        let images: {
            url: string,
            publicId: string,
            type: string,
            size: number,
            thumbnail: string | null,
            duration: string | null
        }[] = [];

        const userService = new User();
        const proService = new Professional();
        const receiverSocketId = receiverType == UserType.PROFESSIONAL ? await proService.getSocketId(receiverId) : await userService.getSocketId(receiverId);
        const senderSocketId = senderType == UserType.PROFESSIONAL ? await proService.getSocketId(senderId) : await userService.getSocketId(senderId);
        const socketNamespace = io.of(Namespaces.BASE);

        if (files) {
            ({
                uploadedFiles,
                failedFiles,
                publicIds
            } = await cloudinary.uploadV2(files, ResourceType.IMAGE, CdnFolders.CHAT));
            if (failedFiles?.length > 0 && senderSocketId) {
                socketNamespace.to(senderSocketId).emit(
                    "appError",
                    Handler.responseData(true, "File uploads failed", failedFiles)
                );
            }

            images = uploadedFiles.map((upload) => ({
                url: upload.url,
                publicId: upload.publicId,
                size: Number(upload.size),
                type: upload.mimeType,
                thumbnail: upload.thumbnail,
                duration: upload.duration,
            }));
        }
        const newMessage = messageRepo.create({
            chat: {id: chatId},
            senderId,
            senderType,
            receiverType,
            type: MessageType.FILE,
            receiverId,
            content,
            attachments: images,
        });

        const createdMessage = await messageRepo.save(newMessage);

        if (createdMessage) {
            await RabbitMQ.publishToExchange(QueueNames.CHAT, QueueEvents.CHAT_RECEIVE_ATTACHMENT, {
                eventType: QueueEvents.CHAT_RECEIVE_ATTACHMENT,
                payload: {newMessage, receiverId, receiverType, senderId},
            });
        }
    } catch (error) {
        if (files) {
            await deleteFiles(files);
        }

        if (publicIds.length > 0) {
            await cloudinary.deleteFiles(publicIds);
        }
        console.error("CHAT_SEND_ATTACHMENT: ", error);
        service.handleTypeormError(error);
    }
});

chat.route(QueueEvents.CHAT_RECEIVE_ATTACHMENT, async (message: any, io: Server) => {
    const {payload: {newMessage, receiverId, receiverType, senderId}} = message;

    try {
        const userService = new User();
        const proService = new Professional();
        const socketId = receiverType == UserType.PROFESSIONAL ? await proService.getSocketId(receiverId) : await userService.getSocketId(receiverId);
        const senderSocketId = receiverType == UserType.USER ? await proService.getSocketId(senderId) : await userService.getSocketId(senderId);
        const socketNamespace = io.of(Namespaces.BASE);
        const receiverService = receiverType == UserType.PROFESSIONAL ? proService : userService;

        if (senderSocketId) socketNamespace.to(senderSocketId).emit("attachment-sent", newMessage);

        if (socketId) {
            const inChat = await receiverService.userChats.present(receiverId, newMessage.chat.id);
            const socketNamespace = io.of(Namespaces.BASE);

            await AppDataSource.transaction(async (manager) => {
                if (inChat) {
                    await manager.update(Message, {
                        id: newMessage.id,
                    }, {status: MessageStatus.READ});

                    if (senderSocketId) socketNamespace.to(senderSocketId).emit("message-read", {messageId: newMessage.id});
                } else {
                    await manager.update(Message, {
                        id: newMessage.id,
                    }, {status: MessageStatus.DELIVERED});

                    await manager.increment(ChatParticipant,
                        {
                            chat: {id: newMessage.chat.id},
                            ...(receiverType === UserType.USER
                                ? {userId: receiverId}
                                : {professionalId: receiverId}),
                        },
                        'unreadCount',
                        1
                    );
                }
            });


            socketNamespace.to(socketId).emit("receive-attachment", newMessage);
            if (senderSocketId) socketNamespace.to(senderSocketId).emit("attachment-delivered", {messageId: newMessage.id});

            logger.info(`📧 New message attachment for ${receiverType}:${receiverId}`);
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

                await manager.increment(ChatParticipant,
                    {
                        chat: {id: newMessage.chat.id},
                        ...(receiverType === UserType.USER
                            ? {userId: receiverId}
                            : {professionalId: receiverId}),
                    },
                    'unreadCount',
                    1
                );
            });
            logger.info(`📫 ${receiverType}:${receiverId} message attachment has been added to inbox successfully.`);
        }
    } catch (error) {
        console.error("CHAT_RECEIVE_ATTACHMENT: ", error);
        service.handleTypeormError(error);
    }
});


// chat.route(QueueEvents.CHAT_RECEIVE_ATTACHMENT, async (message: any, io: Server) => {
//     const {payload: {newMessage, receiverId, receiverType, senderId}} = message;
//
//     try {
//         const userService = new User();
//         const proService = new Professional();
//         const socketId = receiverType == UserType.PROFESSIONAL ? await proService.getSocketId(receiverId) : await userService.getSocketId(receiverId);
//         const senderSocketId = receiverType == UserType.USER ? await proService.getSocketId(senderId) : await userService.getSocketId(senderId);
//         const socketNamespace = io.of(Namespaces.BASE);
//
//         if (senderSocketId) socketNamespace.to(senderSocketId).emit("attachment-sent", newMessage);
//
//         if (socketId) {
//             await AppDataSource.getRepository(Message).update({
//                 id: newMessage.id,
//             }, {status: MessageStatus.DELIVERED});
//
//             socketNamespace.to(socketId).emit("receive-attachment", newMessage);
//             if (senderSocketId) socketNamespace.to(senderSocketId).emit("attachment-delivered", {messageId: newMessage.id});
//
//             logger.info(`📧 New attachment message for ${receiverType}:${receiverId}`);
//             return;
//         } else {
//             logger.info(`📴 ${receiverType}:${receiverId} is offline`);
//
//             await AppDataSource.transaction(async (manager) => {
//
//                 const existingInbox = await manager.findOne(Inbox, {
//                     where: {
//                         receiverId,
//                         receiverType,
//                         message: {id: newMessage.id},
//                     },
//                 });
//
//                 if (!existingInbox) {
//                     const newInbox = manager.create(Inbox, {
//                         receiverId,
//                         receiverType,
//                         message: newMessage
//                     });
//
//                     await manager.save(newInbox);
//                 }
//             });
//             logger.info(`📫 ${receiverType}:${receiverId} attachment message has been added to inbox successfully.`);
//         }
//     } catch (error) {
//         console.error("CHAT_RECEIVE_ATTACHMENT: ", error);
//         service.handleTypeormError(error);
//     }
// });

export default chat;