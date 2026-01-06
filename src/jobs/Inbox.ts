import {Server} from "socket.io";
import {Job} from "bullmq";
import {WorkerConfig, IWorker} from "../types";
import Service from "../services/Service";
import logger from "../config/logger";
import {Namespaces, UserType} from "../types/constants";
import {JobType} from "../types/constants";
import User from "../services/User";
import InboxEntity from "../entities/InboxEntity";
import {AppDataSource} from "../data-source";
import {In} from "typeorm";
import Professional from "../services/Professional";
import Message from "../entities/MessageEntity";

const service = new Service();

export class Inbox implements IWorker<any> {

    private io: Server;
    public config: WorkerConfig;
    public queueName = JobType.INBOX;

    public constructor(config: WorkerConfig, io: Server) {
        this.io = io;
        this.config = config
    }

    public async process(job: Job<any>) {
        const {data} = job.data;
        try {
            logger.info(`🏃 Notifying ${data.userType}${data.userId} of inboxes`);

            const userService = new User();
            const proService = new Professional();

            const socketId = data.userType == UserType.PROFESSIONAL ? await proService.getSocketId(data.userId) : await userService.getSocketId(data.userId);
            if (socketId) {

                const idBatch = data.ids.map((element: { id: string; senderId: string; }) => element.id);

                const results = await AppDataSource.getRepository(Message)
                    .find({
                        where: {id: In(idBatch), receiverId: data.userId, receiverType: data.userType},
                        order: {createdAt: "ASC"} // TypeORM ordering
                    });

                if (results.length === 0) {
                    logger.info("notification: no pending results found for ids", {jobId: job.id});
                    return;
                }

                const socketNamespace = this.io.of(Namespaces.BASE);
                socketNamespace.to(socketId).emit("offline-messages", {
                    data: results
                });

                const messagesBySender: Record<string, string[]> = {};
                for (const msg of data.ids) {
                    if (!messagesBySender[msg.senderId]) messagesBySender[msg.senderId] = [];
                    messagesBySender[msg.senderId]!.push(msg.id);
                }

                await Promise.all(Object.entries(messagesBySender).map(async ([senderId, messageIds]) => {
                    const socketId = data.userType === UserType.USER
                        ? await proService.getSocketId(senderId)
                        : await userService.getSocketId(senderId);

                    if (socketId) {
                        socketNamespace.to(socketId).emit("messages-read", {
                            readerId: data.userId,
                            messageIds, // only messages this sender sent
                        });
                    }
                }));
            }
        } catch (error) {
            console.error(error);
            service.handleTypeormError(error)
        }
        return;
    }
}