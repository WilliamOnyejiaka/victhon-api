import {Server} from "socket.io";
import {ISocket} from "../../types";
import logger from "../../config/logger";
import {Events, UserType} from "../../types/constants";
import Handler from "./Handler";
import User from "../../services/User";
import Professional from "../../services/Professional";


export default class SocketHandler {

    private static readonly userService = new User();
    private static readonly proService = new Professional();

    public static async onConnection(io: Server, socket: ISocket) {
        const socketId = socket.id;
        const userId = socket.locals.data.id;
        const userType = socket.locals.data.userType;

        const wasSet = userType == UserType.PROFESSIONAL ? await SocketHandler.proService.setSocketId(userId,socketId) : await SocketHandler.userService.setSocketId(userId,socketId);
        if (!wasSet) socket.emit("appError", Handler.responseData(true, "An internal error occurred"));

        logger.info(`🤝 ${userType}:${userId} with the socket id - ${socketId} has connected.`);

    }

    public static async disconnect(io: Server, socket: ISocket, data: any) {
        try {
            const userId = socket.locals.data.id;
            const userType = socket.locals.data.userType;
            const wasDeleted = userType == UserType.PROFESSIONAL ? await SocketHandler.proService.deleteSocketId(userId): await SocketHandler.userService.deleteSocketId(userId);
            if (!wasDeleted) socket.emit("appError", Handler.responseData(true, "An internal error occurred"));
            logger.info(`👋 ${userType}:${userId} with the socket id - ${socket.id} has disconnected.`);
        } catch (error) {
            console.error("❌ Error in disconnect:", error);
        }
    }
}