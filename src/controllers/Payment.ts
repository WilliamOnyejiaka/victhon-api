import {Request, Response} from "express";
import Service from "../services/Payment";
import {UserType} from "../types/constants";
import Controller from "./Controller";

export default class Payment {

    private static service: Service = new Service();

    public static async initializeBookingPayment(req: Request, res: Response) {
        const {id: userId} = res.locals.data;

        const {bookingId} = req.params;

        const serviceResult = await Payment.service.initializeBookingPayment(bookingId!, userId);
        Controller.response(res, serviceResult);
    }

    public static async bookingRefund(req: Request, res: Response) {
        const {id: userId} = res.locals.data;

        const {bookingId} = req.params;

        const serviceResult = await Payment.service.refundBooking(bookingId!, userId);
        Controller.response(res, serviceResult);
    }

    public static  async verifyPaystackTransaction(req: Request, res: Response) {
        const {id: userId} = res.locals.data;
        const {reference} = req.params;
        const result = await Payment.service.verifyPaystackTransaction(reference!);
        res.status(200).send(result);
    }


    public static async webhook(req: Request, res: Response) {

        const signature = req.headers['x-paystack-signature'];

        const serviceResult = await Payment.service.webhook((req as any).rawBody, signature);
        res.status(serviceResult.statusCode).send(serviceResult.json.message);
        return;
    }
}