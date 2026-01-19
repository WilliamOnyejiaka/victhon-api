import { Request, Response } from "express";
import Controller from "./Controller";
import Service from "../services/Account";
import { EditProfessionalDto } from "../types";


export default class Account {

    private static service = new Service();

    public static async create(req: Request, res: Response) {
        const { id: userId } = res.locals.data;
        const { name, accountNumber, bankName, bankCode } = req.body;

        const serviceResult = await Account.service.createAccount(userId, name, accountNumber, bankName, bankCode);
        Controller.response(res, serviceResult);
    }

    public static async banks(req: Request, res: Response) {
        const serviceResult = await Account.service.banks();
        Controller.response(res, serviceResult);
    }

    public static async getAll(req: Request, res: Response) {
        const { id: userId } = res.locals.data;

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;

        const serviceResult = await Account.service.getAccounts(userId, page, limit);

        Controller.response(res, serviceResult);
    }

    public static async getOne(req: Request, res: Response) {
        const { id: userId } = res.locals.data;
        const { accountId } = req.params;

        const serviceResult =
            await Account.service.getAccount(accountId!, userId);

        Controller.response(res, serviceResult);
    }

    public static async update(req: Request, res: Response) {
        const { id: userId } = res.locals.data;
        const { accountId } = req.params;

        const { name, accountNumber, bankName, bankCode } = req.body;

        const serviceResult =
            await Account.service.updateAccount(accountId!, userId, {
                name,
                accountNumber,
                bankName,
                bankCode,
            });

        Controller.response(res, serviceResult);
    }

    /* ================= DELETE ================= */
    public static async delete(req: Request, res: Response) {
        const { id: userId } = res.locals.data;
        const { accountId } = req.params;

        const serviceResult =
            await Account.service.deleteAccount(accountId!, userId);

        Controller.response(res, serviceResult);
    }
}