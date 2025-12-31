import {Request, Response} from "express";
import Controller from "./Controller";
import Service from "../services/Wallet";


export default class Wallet {

    private static service = new Service();


    public static async wallet(req: Request, res: Response) {
        const {id: professionalId} = res.locals.data;

        const serviceResult = await Wallet.service.wallet(professionalId);

        Controller.response(res, serviceResult);
    }

    public static async transaction(req: Request, res: Response) {
        const {id: professionalId} = res.locals.data;
        const {transactionId} = req.params

        const serviceResult = await Wallet.service.transaction(professionalId, transactionId!);

        Controller.response(res, serviceResult);
    }

    public static async history(req: Request, res: Response) {
        const {id: professionalId} = res.locals.data;
        let {page, limit} = req.query;

        const parsedPage = parseInt(page as string) || 1;
        const parsedLimit = parseInt(limit as string) || 10;

        const serviceResult = await Wallet.service.history(professionalId, parsedPage, parsedLimit);

        Controller.response(res, serviceResult);
    }
}