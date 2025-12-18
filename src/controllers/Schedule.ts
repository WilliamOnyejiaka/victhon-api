import { Request, Response } from "express";
import Controller from "./Controller";
import Service from "../services/Schedule";


export default class Schedule {

    private static service = new Service();

    public static async createSchedule(req: Request, res: Response) {
        const { id: userId } = res.locals.data;
        const { dayOfWeek, startTime, endTime, isActive, validFrom, validUntil } = req.body;


        const serviceResult = await Schedule.service.createSchedule(userId, dayOfWeek, startTime, endTime, isActive, validFrom, validUntil);
        Controller.response(res, serviceResult);
    }

    public static async schedule(req: Request, res: Response) {
        const { id, professionalId } = req.params;


        const serviceResult = await Schedule.service.schedule(professionalId!, id!);
        Controller.response(res, serviceResult);
    }

    public static async schedules(req: Request, res: Response) {
        let { page, limit } = req.query;
        const { professionalId } = req.params;

        const parsedPage = parseInt(page as string) || 1;
        const parsedLimit = parseInt(limit as string) || 10;


        const serviceResult = await Schedule.service.schedules(professionalId!, parsedPage, parsedLimit);

        Controller.response(res, serviceResult);
    }

    public static async update(req: Request, res: Response) {
        const { id: professionalId } = res.locals.data;
        const { id } = req.params;
        const { dayOfWeek, startTime, endTime, isActive, validFrom, validUntil } = req.body;

        const serviceResult = await Schedule.service.update(professionalId, id!, dayOfWeek, startTime, endTime, isActive, validFrom, validUntil);

        Controller.response(res, serviceResult);
    }

    public static async delete(req: Request, res: Response) {
        const { id: professionalId } = res.locals.data;
        const { id } = req.params;

        const serviceResult = await Schedule.service.delete(professionalId, id!);

        Controller.response(res, serviceResult);
    }
}