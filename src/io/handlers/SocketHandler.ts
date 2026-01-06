import {Server} from "socket.io";
import {ISocket} from "../../types";
import logger from "../../config/logger";
import {Events, QueueEvents, QueueNames, UserType} from "../../types/constants";
import Handler from "./Handler";
import User from "../../services/User";
import Professional from "../../services/Professional";
import {AppDataSource} from "../../data-source";
import ChatParticipant from "../../entities/ChatParticipant";
import Message from "../../entities/MessageEntity";
import {RabbitMQ} from "../../services/RabbitMQ";
import OfflineNotification from "../../services/OfflineNotification";
import Inbox from "../../services/Inbox";


interface SendMessagePayload {
    receiverId: string;
    receiverType: UserType;
    content: string;
}


export default class SocketHandler {

    private static readonly userService = new User();
    private static readonly proService = new Professional();
    private static readonly chatParticipantsRepo = AppDataSource.getRepository(ChatParticipant);
    private static readonly messageRepo = AppDataSource.getRepository(Message);


    public static async onConnection(io: Server, socket: ISocket) {
        try {
            const socketId = socket.id;
            const userId = socket.locals.data.id;
            const userType = socket.locals.data.userType;

            const wasSet = userType == UserType.PROFESSIONAL ? await SocketHandler.proService.setSocketId(userId, socketId) : await SocketHandler.userService.setSocketId(userId, socketId);
            if (!wasSet) socket.emit("appError", Handler.responseData(true, "An internal error occurred"));

            const offline = new OfflineNotification();
            await offline.deliverOfflineNotifications(userId, userType);

            const inbox = new Inbox();
            await inbox.deliverInbox(userId, userType);

            logger.info(`🤝 ${userType}:${userId} with the socket id - ${socketId} has connected.`);
        } catch (error) {
            console.error("Failed to connect: ", error);
        }
    }

    public static async sendMessage(io: Server, socket: ISocket, data: SendMessagePayload) {
        const socketId = socket.id;
        const senderId = socket.locals.data.id;
        const senderType = socket.locals.data.userType;

        logger.info(`📨 ${senderType}:${senderId} sending a message.`);

        if (!data?.receiverId || !data?.receiverType || !data?.content?.trim()) {
            return socket.emit(
                "appError",
                Handler.responseData(true, "Invalid message payload")
            );
        }

        if (!Object.values(UserType).includes(data.receiverType)) {
            return socket.emit(
                "appError",
                Handler.responseData(true, "Invalid receiver type")
            );
        }


        const {receiverId, receiverType, content} = data;

        try {
            let where = {}

            if (receiverType == UserType.PROFESSIONAL) where = {professional: {id: receiverId}, user: {id: senderId}};
            if (receiverType == UserType.USER) where = {user: {id: receiverId}, professional: {id: senderId}};

            const chatParticipant = await SocketHandler.chatParticipantsRepo.findOne({where, relations: ["chat"],});

            if (!chatParticipant) {
                socket.emit("appError", Handler.responseData(true, "Chat does not exist,create a chat first"));
                return;
            }

            const newMessage = SocketHandler.messageRepo.create({
                chat: chatParticipant.chat,
                senderId,
                senderType,
                receiverType,
                receiverId,
                content
            });

            const created = await SocketHandler.messageRepo.save(newMessage);

            socket.emit("message-sent", newMessage);
            logger.info(`📩 ${senderType}:${senderId} sent a message to ${receiverType}:${receiverId} successfully.`);

            if (created) {
                await RabbitMQ.publishToExchange(QueueNames.CHAT, QueueEvents.CHAT_SEND_MESSAGE, {
                    eventType: QueueEvents.CHAT_SEND_MESSAGE,
                    payload: {newMessage, receiverId, receiverType, senderId},
                });
            }
        } catch (error) {
            console.error("sendMessage error:", error);

            socket.emit(
                "appError",
                Handler.responseData(true, "Failed to send message")
            );
        }
    }

    public static async markAsRead(io: Server, socket: ISocket, data: any) {
        const socketId = socket.id;
        const userId = socket.locals.data.id;
        const userType = socket.locals.data.userType;

        const {messageIds} = data;

        try {
            if (!messageIds || !messageIds.length) {
                socket.emit("appError", Handler.responseData(true, "Invalid message payload"));
                return;
            }

            const chunkSize = 100;
            for (let i = 0; i < messageIds.length; i += chunkSize) {
                const chunk = messageIds.slice(i, i + chunkSize);

                await RabbitMQ.publishToExchange(QueueNames.CHAT, QueueEvents.CHAT_MARK_AS_READ, {
                    eventType: QueueEvents.CHAT_MARK_AS_READ,
                    payload: {chunk, userId, userType},
                });
            }

        } catch (error) {
            console.error("markAsRead error:", error);

            socket.emit(
                "appError",
                Handler.responseData(true, "Something went wrong")
            );
        }
    }

    public static async editMessage(io: Server, socket: ISocket, data: any) {
        const socketId = socket.id;
        const userId = socket.locals.data.id;
        const userType = socket.locals.data.userType;

        if (!data?.messageId || !data?.content?.trim()) {
            return socket.emit(
                "appError",
                Handler.responseData(true, "Invalid edit payload")
            );
        }

        const {messageId, content} = data;

        try {
            const message = await SocketHandler.messageRepo.findOne({
                where: {
                    senderId: userId,
                    senderType: userType,
                    id: messageId
                }
            });


            if (!message) {
                return socket.emit(
                    "appError",
                    Handler.responseData(true, "Message not found")
                );
            }

            message.content = content;
            await SocketHandler.messageRepo.save(message);

            socket.emit("message-edited", message);
        } catch (error) {
            console.error("editMessage error:", error);
            socket.emit(
                "appError",
                Handler.responseData(true, "Something went wrong")
            );
        }
    }

    public static async deleteMessages(io: Server, socket: ISocket, data: any) {
        const socketId = socket.id;
        const userId = socket.locals.data.id;
        const userType = socket.locals.data.userType;

        const {messageIds} = data;

        try {
            if (!messageIds || !messageIds.length) {
                socket.emit("appError", Handler.responseData(true, "Invalid deleteMessages payload"));
                return;
            }

            const chunkSize = 100;
            for (let i = 0; i < messageIds.length; i += chunkSize) {
                const chunk = messageIds.slice(i, i + chunkSize);

                await RabbitMQ.publishToExchange(QueueNames.CHAT, QueueEvents.CHAT_DELETE_MESSAGES, {
                    eventType: QueueEvents.CHAT_DELETE_MESSAGES,
                    payload: {chunk, userId, userType},
                });
            }

        } catch (error) {
            console.error("deleteMessages error:", error);

            socket.emit(
                "appError",
                Handler.responseData(true, "Something went wrong")
            );
        }
    }

    public static async disconnect(io: Server, socket: ISocket, data: any) {
        try {
            const userId = socket.locals.data.id;
            const userType = socket.locals.data.userType;
            const wasDeleted = userType == UserType.PROFESSIONAL ? await SocketHandler.proService.deleteSocketId(userId) : await SocketHandler.userService.deleteSocketId(userId);
            if (!wasDeleted) socket.emit("appError", Handler.responseData(true, "An internal error occurred"));
            logger.info(`👋 ${userType}:${userId} with the socket id - ${socket.id} has disconnected.`);
        } catch (error) {
            console.error("❌ Error in disconnect:", error);
        }
    }
}