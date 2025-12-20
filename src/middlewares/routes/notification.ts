import { body, param, query } from "express-validator";
import { handleValidationErrors } from "../validators";
import verifyJWT from "../verifyJWT";
import { UserType } from "../../types/constants";

export const pagination = [
    query('page').optional().isInt({ min: 1 }).withMessage("page must be an integer"),
    query('limit').optional().isInt({ min: 1 }).withMessage("limit must be an integer"),
    handleValidationErrors
];


export const users = [
    verifyJWT([UserType.USER]),
    ...pagination
];

export const professionals = [
    verifyJWT([UserType.PROFESSIONAL]),
    ...pagination
];