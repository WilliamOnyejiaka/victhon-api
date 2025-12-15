import { Request, Response } from "express";
import Controller from "./Controller";
import Service from "../services/User";


export default class User {

    private static service = new Service();

    public static async profile(req: Request, res: Response) {
        const { id: userId } = res.locals.data;

        const serviceResult = await User.service.profile(userId);
        Controller.response(res, serviceResult);
    }

    public static async uploadProfilePicture(req: Request, res: Response) {
        const { id: userId } = res.locals.data;
        const { publicId, url } = req.body;

        const serviceResult = await User.service.uploadProfilePicture(userId, publicId, url);
        Controller.response(res, serviceResult);
    }
}