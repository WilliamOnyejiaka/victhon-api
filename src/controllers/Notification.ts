
import { Request, Response } from "express";
import Controller from "./Controller";
import Service from "../services/Notification";
import { UserType } from "../types/constants";

export default class Notification {

    private static service = new Service();

    public static notification(userType: UserType) {
        return async (req: Request, res: Response) => {
            const { id: userId } = res.locals.data;
            const { id } = req.params;

            const serviceResult = await Notification.service.notification(id!, userId, userType);

            Controller.response(res, serviceResult);
        }
    }

    public static notifications(userType: UserType) {
        return async (req: Request, res: Response) => {
            const { id: userId } = res.locals.data;
            let { page, limit } = req.query;

            const parsedPage = parseInt(page as string) || 1;
            const parsedLimit = parseInt(limit as string) || 10;


            const serviceResult = await Notification.service.notifications(userId!, userType, parsedPage, parsedLimit);

            Controller.response(res, serviceResult);
        }
    }
}
