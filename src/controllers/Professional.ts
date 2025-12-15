import { Request, Response } from "express";
import Controller from "./Controller";
import Service from "../services/Professional";
import { EditProfessionalDto } from "../types";


export default class Professional {

    private static service = new Service();

    public static async profile(req: Request, res: Response) {
        const { id: userId } = res.locals.data;

        const serviceResult = await Professional.service.profile(userId);
        Controller.response(res, serviceResult);
    }

    public static async editProfessionalProfile(req: Request, res: Response) {
        let editData: EditProfessionalDto = req.body;
        editData.file = req.file;
        const { id: userId } = res.locals.data;

        const serviceResult = await Professional.service.editProfessionalProfile(userId, editData);
        Controller.response(res, serviceResult);
    }
}