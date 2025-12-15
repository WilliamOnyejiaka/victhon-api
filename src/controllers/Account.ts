import { Request, Response } from "express";
import Controller from "./Controller";
import Service from "../services/Account";
import { EditProfessionalDto } from "../types";


export default class Account {

    private static service = new Service();

    public static async create(req: Request, res: Response) {
        const { id: userId } = res.locals.data;
        const { name, accountNumber, bankName } = req.body;

        const serviceResult = await Account.service.createAccount(userId, name, accountNumber, bankName);
        Controller.response(res, serviceResult);
    }
}