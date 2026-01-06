import {body, param, query} from "express-validator";
import {handleValidationErrors} from "../validators";
import verifyJWT from "../verifyJWT";
import {UserType} from "../../types/constants";
import {mediaUpload} from "../multer";

export const pagination = [
    query('page').optional().isInt({min: 1}).withMessage("page must be an integer"),
    query('limit').optional().isInt({min: 1}).withMessage("limit must be an integer"),
    handleValidationErrors
];


export const createChat = [
    verifyJWT([UserType.USER, UserType.PROFESSIONAL]),
    body("professionalId")
        .notEmpty().withMessage("professionalId is required")
        .isUUID().withMessage("professionalId must be a valid UUID"),
    body("userId")
        .notEmpty().withMessage("userId is required")
        .isUUID().withMessage("userId must be a valid UUID"),
    handleValidationErrors
];


export const sendMessageValidator = [
    verifyJWT([UserType.USER, UserType.PROFESSIONAL]),
    mediaUpload(6).array('attachments'),
    body("senderId")
        .isUUID()
        .withMessage("senderId must be a valid UUID"),

    body("senderType")
        .isIn(["user", "professional"])
        .withMessage("senderType must be either 'user' or 'professional'"),

    body("receiverId")
        .isUUID()
        .withMessage("receiverId must be a valid UUID"),

    body("receiverType")
        .isIn(["user", "professional"])
        .withMessage("receiverType must be either 'user' or 'professional'"),

    body("content")
        .isString()
        .trim()
        .notEmpty()
        .withMessage("content is required")
        .isLength({max: 2000})
        .withMessage("content must not exceed 2000 characters"),
    handleValidationErrors
];

export const getMessages = [
    verifyJWT([UserType.USER, UserType.PROFESSIONAL]),
    param("chatId")
        .notEmpty().withMessage("chatId is required")
        .isUUID().withMessage("chatId must be a valid UUID"),
    handleValidationErrors
];

export const professionals = [
    verifyJWT([UserType.PROFESSIONAL]),
    ...pagination
];