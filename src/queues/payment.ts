import {Server} from "socket.io";
import RabbitMQRouter from "../utils/RabbitMQRouter";
import notify from "../services/notify";
import BaseService from "../services/Service";
import {QueueEvents, QueueNames} from "../types/constants";
import {exchange} from "../types";
import logger from "../config/logger";
import {UserType} from "../types/constants";
import Payment from "../services/Payment";
import {NotificationType} from "../entities/Notification";
import {AppDataSource} from "../data-source";
import {Transaction} from "../entities/Transaction";

const service = new BaseService();

const payment = new RabbitMQRouter({
    name: QueueNames.PAYMENT,
    durable: true,
    routingKeyPattern: 'payment.*',
    exchange: exchange,
    handlers: {}
});

payment.route(QueueEvents.PAYMENT_CHARGE_SUCCESSFUL, async (message: any, io: Server) => {
    const {payload: {data}} = message;
    const paymentService = new Payment();
    await paymentService.successfulCharge(data);
    logger.info(`Payment was completed for transaction:${data.metadata.transactionId}`);
});

payment.route(QueueEvents.PAYMENT_REFUND_SUCCESSFUL, async (message: any, io: Server) => {
    const {payload: {reference}} = message;
    const paymentService = new Payment();
    await paymentService.refundSuccessful(reference);
});

payment.route(QueueEvents.PAYMENT_BOOK_SUCCESSFUL, async (message: any, io: Server) => {
    const {payload: {transactionId, professionalId}} = message;

    try {
        const transactionRepo = AppDataSource.getRepository(Transaction);

        const result = await transactionRepo.findOne({where: {id: transactionId}});

        await notify({
            userId: professionalId,
            userType: UserType.PROFESSIONAL,
            type: NotificationType.BOOKING_PAYMENT,
            data: result
        });

        logger.info(`e👌 Booking payment was completed for transaction:${transactionId}`);
    } catch (error) {
        service.handleTypeormError(error);
    }

});


export default payment;