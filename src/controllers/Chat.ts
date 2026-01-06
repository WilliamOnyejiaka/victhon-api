import {Request, Response} from "express";
import Controller from "./Controller";
import Service from "../services/Chat";


export default class Chat {

    private static service = new Service();


    public static async create(req: Request, res: Response) {
        const {professionalId, userId} = req.body;

        const serviceResult = await Chat.service.createChat(userId, professionalId);

        Controller.response(res, serviceResult);
    }

    public static async sendAttachment(req: Request, res: Response) {

        // if(req.files && req.files?.length <= 0){
        //
        // }
        const {senderId, senderType, receiverId, receiverType, content} = req.body;

        const serviceResult = await Chat.service.sendAttachment(
            senderId,
            senderType,
            receiverId,
            receiverType,
            content ?? null,
            req.files as Express.Multer.File[]);

        Controller.response(res, serviceResult);
    }

    public static async getMessages(req: Request, res: Response) {
        const {id: userId, userType} = res.locals.data;
        let {page, limit} = req.query;
        const {chatId} = req.params;

        const parsedPage = parseInt(page as string) || 1;
        const parsedLimit = parseInt(limit as string) || 10;


        const serviceResult = await Chat.service.getMessages(userId, userType, chatId!, parsedPage, parsedLimit);

        Controller.response(res, serviceResult);
    }

    public static async getChat(req: Request, res: Response) {
        const {id: userId, userType} = res.locals.data;
        const {chatId} = req.params;

        const serviceResult = await Chat.service.getChat(userId, userType, chatId!);

        Controller.response(res, serviceResult);
    }

    public static async getChats(req: Request, res: Response) {
        const {id: userId, userType} = res.locals.data;
        let {page, limit} = req.query;

        const parsedPage = parseInt(page as string) || 1;
        const parsedLimit = parseInt(limit as string) || 10;


        const serviceResult = await Chat.service.getChats(userId, userType, parsedPage, parsedLimit);

        Controller.response(res, serviceResult);
    }

}