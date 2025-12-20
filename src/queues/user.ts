import { Server } from "socket.io";
import RabbitMQRouter from "../utils/RabbitMQRouter";
import notify from "../services/notify";
import BaseService from "../services/Service";
import { QueueEvents, QueueNames } from "../types/constants";
import {exchange} from "../types";
import logger from "../config/logger";
import UserCache from "../cache/UserCache";
import {UserType} from "../types/constants";

const service = new BaseService();

const user = new RabbitMQRouter({
    name: QueueNames.USER,
    durable: true,
    routingKeyPattern: 'user.*',
    exchange: exchange,
    handlers: {}
});

user.route(QueueEvents.USER_VISIT, async (message: any, io: Server) => {
    const { payload: { userId, visitorId } } = message;

    try {
        // let user = await UserModel.findOne({ _id: visitorId }).select("-password -completionPercentage");
        //
        // const visit = await VisitorsHistory.findOneAndUpdate({
        //     userId: userId,
        //     visitorId
        // }, { updatedAt: Date.now() }, { upsert: true, new: true }).lean();
        //
        // logger.info(`👀 User ${visitorId} visited user ${userId}`)
        // await notify({
        //     userId: userId,
        //     type: "visit",
        //     data: { visitor: user }
        // });
    } catch (error) {
        service.handleTypeormError(error);
    }
});


export default user;