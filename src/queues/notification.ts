import {Server} from "socket.io";
import RabbitMQRouter from "../utils/RabbitMQRouter";
import {Namespaces, QueueEvents, QueueNames, UserType} from "../types/constants";
import {Notification, NotificationStatus} from "../entities/Notification";
import BaseService from "../services/Service";
import logger from "../config/logger";
import User from "../services/User";
import {exchange} from "../types";
import {AppDataSource} from "../data-source";
import Professional from "../services/Professional";


const notification = new RabbitMQRouter({
    name: QueueNames.NOTIFICATION,
    durable: true,
    routingKeyPattern: 'notification.*',
    exchange: exchange,
    handlers: {}
});

const service = new BaseService();

notification.route(QueueEvents.NOTIFICATION_NOTIFY, async (message: any, io: Server) => {
    const {payload: {provider, data}} = message;

    try {

        if (provider == "socket") {

            const userService = new User();
            const proService = new Professional();

            const socketId = data.userType == UserType.PROFESSIONAL ? await proService.getSocketId(data.userId) : await userService.getSocketId(data.userId);
            const repo = AppDataSource.getRepository(Notification);

            const userId = data.userType == UserType.PROFESSIONAL ? {professionalId: data.userId} : {userId: data.userId};
            const newNotification = repo.create({
                ...userId,
                type: data.type,
                data: data.data,
                userType: data.userType,
                status: socketId ? NotificationStatus.SENT : NotificationStatus.PENDING
            });

            const notification = await repo.save(newNotification);

            if (socketId) {
                logger.info(`🏃 Notifying user:${data.userId}, type:${data.type}`)

                const notificationNamespace = io.of(Namespaces.BASE);
                notificationNamespace.to(socketId).emit("notification", {notification});
            } else {
                logger.info(`📴 user:${data.userId} is offline`)
            }
        }
    } catch (error) {
        service.handleTypeormError(error);
    }
});


notification.route(QueueEvents.NOTIFICATION_OFFLINE, async (message: any, io: Server) => {
    const {payload: {provider, data}} = message;

    try {

        if (provider == "socket") {

            const userService = new User();
            const socketId = await userService.getSocketId(data.userId);

            if (socketId) {
                logger.info(`🏃 Notifying user:${data.userId}, type:${data.type}`)

                const notificationNamespace = io.of(Namespaces.BASE);
                notificationNamespace.to(socketId).emit("notification", {
                    notification
                });
            } else {
                logger.info(`📴 user:${data.userId} is offline`)
            }
        }
    } catch (error) {
        service.handleTypeormError(error);
    }
});

// notification.route(QueueEvents.MASS_EMAIL, async (message: any, io: Server) => {
//     const { payload: { emails, subject, html } } = message;
//
//     try {
//         const email = new Email();
//         await email.sendMassEmail(emails, subject, html);
//         logger.info(`📧 Mass sending emails`)
//     } catch (error) {
//         service.handleMongoError(error);
//     }
// });
//
// notification.route(QueueEvents.SIGN_UP_EMAIL, async (message: any, io: Server) => {
//     const { payload: { to, name } } = message;
//
//     try {
//         const email = new Email();
//         const html = await email.getEmailTemplate({ name }, path.join(__dirname, './../views', "welcome.ejs")) as string;
//         await email.sendEmail(to, "Welcome to boomger", html);
//         logger.info(`📧 Sending welcome email to ${to}`)
//     } catch (error) {
//         service.handleMongoError(error);
//     }
// });


export default notification;