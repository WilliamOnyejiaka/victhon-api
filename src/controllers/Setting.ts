import { Request, Response } from "express";
import Controller from "./Controller";
import SettingService from "../services/Setting";

export default class Setting {

    private static service = new SettingService();

    public static async create(req: Request, res: Response) {
        const { id: professionalId } = res.locals.data;

        const serviceResult =
            await Setting.service.create(professionalId);

        Controller.response(res, serviceResult);
    }

    public static async get(req: Request, res: Response) {
        const { id: professionalId } = res.locals.data;

        const serviceResult =
            await Setting.service.get(professionalId);

        Controller.response(res, serviceResult);
    }

    public static async update(req: Request, res: Response) {
        const { id: professionalId } = res.locals.data;

        const {
            bookingRequestsEnabled,
            newMessagesEnabled,
            paymentReceivedEnabled,
            customerReviewsEnabled,
        } = req.body;

        const serviceResult =
            await Setting.service.update(professionalId, {
                bookingRequestsEnabled,
                newMessagesEnabled,
                paymentReceivedEnabled,
                customerReviewsEnabled,
            });

        Controller.response(res, serviceResult);
    }

    public static async delete(req: Request, res: Response) {
        const { id: professionalId } = res.locals.data;

        const serviceResult =
            await Setting.service.delete(professionalId);

        Controller.response(res, serviceResult);
    }
}
