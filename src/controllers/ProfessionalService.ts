import { Request, Response } from "express";
import Controller from "./Controller";
import Service from "../services/ProfessionalService";


export default class Package {

    private static service = new Service();

    public static async add(req: Request, res: Response) {
        const { id: userId } = res.locals.data;
        const payload = {
            ...req.body,
            userId
        };

        const serviceResult = await Package.service.add(payload);

        Controller.response(res, serviceResult);
    }

    public static async package(req: Request, res: Response) {
        const { id, professionalId } = req.params;

        const serviceResult = await Package.service.package(professionalId!, id!);
        Controller.response(res, serviceResult);
    }

    public static async packages(req: Request, res: Response) {
        let { page, limit } = req.query;
        const { professionalId } = req.params;

        const parsedPage = parseInt(page as string) || 1;
        const parsedLimit = parseInt(limit as string) || 10;

        const serviceResult = await Package.service.packages(professionalId!, parsedPage, parsedLimit);

        Controller.response(res, serviceResult);
    }

    public static async update(req: Request, res: Response) {
        const { id: professionalId } = res.locals.data;
        const { id } = req.params;
        const { name, description, price, type, addOns } = req.body;

        const serviceResult = await Package.service.update(id!, name, professionalId, description, price, type, addOns);

        Controller.response(res, serviceResult);
    }

    public static async delete(req: Request, res: Response) {
        const { id: professionalId } = res.locals.data;
        const { id } = req.params;

        const serviceResult = await Package.service.delete(professionalId, id!);

        Controller.response(res, serviceResult);
    }
}