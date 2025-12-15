import cron from "node-cron";
import { createClient, RedisClientType } from "redis";
import env, { EnvKey } from "./config/env";
import axios from "axios";
import { AppDataSource } from "./data-source";
import redisClient from "./config/redis";
import createApp from "./config/app";
import { Worker } from "bullmq";
import { IWorker, WorkerConfig } from "./types";
// import { Notification } from "./queues/NotificationQueue";
// import { NewBooking } from "./queues/NewBooking";
// import { UpdateRatingAgg } from "./queues/UpdateRatingAgg";
// import { NewView } from "./queues/NewView";


const PORT = env(EnvKey.PORT)!;

(async () => {

    try {

        redisClient.on("connecting", () => {
            console.log("Redis Connecting...");
        });

        redisClient.on("connect", () => {
            console.log('Redis running on port - ', redisClient.options.port);
        });

        redisClient.on('error', (err) => {
            console.error('Redis connection error:', err);
        });


        // const pubClient: RedisClientType = createClient({ url: env(EnvKey.REDIS_URL)! });
        const pubClient: RedisClientType = createClient({
            url: env(EnvKey.REDIS_URL)!,  // e.g., rediss://...
            socket: { reconnectStrategy: retries => Math.min(retries * 50, 500) }  // Exponential backoff
        });
        pubClient.on("error", (err) => {
            console.error('Redis pubClient connection error:', err);
        });

        const subClient: RedisClientType = pubClient.duplicate();
        await Promise.all([pubClient.connect(), subClient.connect()]);

        await AppDataSource.initialize()
            .then(() => console.log("✅ DB has connected successfully"))
            .catch(console.error);

        const { server: app, io } = await createApp(pubClient, subClient);

        // const workerConfig: WorkerConfig = { connection: { url: env(EnvKey.REDIS_URL)! } };

        // const IWorkers: IWorker<any>[] = [
        //     new Notification(workerConfig, io),
        //     new NewBooking(workerConfig, io),
        //     new UpdateRatingAgg(workerConfig, io),
        //     new NewView(workerConfig, io),
        // ];

        // for (const IWorker of IWorkers) {
        //     const worker = new Worker(IWorker.queueName, IWorker.process.bind(IWorker), IWorker.config);
        //     if (IWorker.completed) worker.on('completed', IWorker.completed);
        //     if (IWorker.failed) worker.on('failed', IWorker.failed);
        //     if (IWorker.drained) worker.on('drained', IWorker.drained);
        // }

        app.listen(PORT, () => console.log(`Server running on port - ${PORT}\n`));
    } catch (error) {
        console.error("Some error happened: ", error)
    }

})();

// cron.schedule('*/10 * * * *', async () => {
//     // const response = await axios.get(`${env(EnvKey.MAIN_API)}/ping`);
//     // console.log(response.data);
// });