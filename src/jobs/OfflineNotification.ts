import {Server} from "socket.io";
import {Job} from "bullmq";
import {WorkerConfig, IWorker} from "../types";
import Service from "../services/Service";
import logger from "../config/logger";
import {Namespaces, UserType} from "../types/constants";
import {JobType} from "../types/constants";
import User from "../services/User";
import {Notification} from "../entities/Notification";
import {AppDataSource} from "../data-source";
import {In} from "typeorm";
import Professional from "../services/Professional";

const service = new Service();

export class OfflineNotification implements IWorker<any> {

    private io: Server;
    public config: WorkerConfig;
    public queueName = JobType.OFFLINE_NOTIFICATION;

    public constructor(config: WorkerConfig, io: Server) {
        this.io = io;
        this.config = config
    }

    public async process(job: Job<any>) {
        const {data} = job.data;
        try {
            logger.info(`🏃 Notifying ${data.userType}${data.userId} of offline notifications`);

            const userService = new User();
            const proService = new Professional();

            const socketId = data.userType == UserType.PROFESSIONAL ? await proService.getSocketId(data.userId) : await userService.getSocketId(data.userId);
            if (socketId) {
                const idBatch = data.ids;
                const user = data.userType == UserType.PROFESSIONAL ? {professionalId: data.userId} : {userId: data.userId};

                const results = await AppDataSource.getRepository(Notification)
                    .find({
                        where: {id: In(idBatch), ...user}, order: {createdAt: "ASC"} // TypeORM ordering
                    });

                if (results.length === 0) {
                    logger.info("notification: no pending results found for ids", {jobId: job.id});
                    return;
                }

                const socketNamespace = this.io.of(Namespaces.BASE);
                socketNamespace.to(socketId).emit("offline-notifications", {
                    data: results
                });
            }
        } catch (error) {
            console.error(error);
            service.handleTypeormError(error)
        }
        return;
    }
}