import {Request, Response} from "express";
import Controller from "./Controller";
import Service from "../services/Review";

export default class Review {

    private static service = new Service();

    public static async create(req: Request, res: Response) {
        const {id: userId} = res.locals.data;
        const {rating, text, professionalId} = req.body;

        const serviceResult = await Review.service.createReview(userId, professionalId, parseInt(rating), text);

        Controller.response(res, serviceResult);
    }

    public static async review(req: Request, res: Response) {
        const {id: userId} = res.locals.data;
        const {professionalId, id} = req.params;

        const serviceResult = await Review.service.review(professionalId!, id!);

        Controller.response(res, serviceResult);
    }

    public static async reviews(req: Request, res: Response) {
        const {id: userId} = res.locals.data;
        let {page, limit} = req.query;
        const {professionalId} = req.params;

        const parsedPage = parseInt(page as string) || 1;
        const parsedLimit = parseInt(limit as string) || 10;


        const serviceResult = await Review.service.reviews(professionalId!, parsedPage, parsedLimit);

        Controller.response(res, serviceResult);
    }
}