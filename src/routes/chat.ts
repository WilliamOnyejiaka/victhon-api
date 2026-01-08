import { Router, Request, Response } from 'express';
import asyncHandler from "express-async-handler";
import Controller from "../controllers/Chat";
import {
    createChat, getMessages, sendMessageValidator
} from '../middlewares/routes/chat';
import verifyJWT from "../middlewares/verifyJWT";
import {UserType} from "../types/constants";

const chat = Router();

chat.post("/", createChat, asyncHandler(Controller.create));
chat.get("/", verifyJWT([UserType.USER, UserType.PROFESSIONAL]), asyncHandler(Controller.getChats));
chat.get("/:chatId", verifyJWT([UserType.USER, UserType.PROFESSIONAL]), asyncHandler(Controller.getChat));

chat.post("/messages/attachments/:chatId", sendMessageValidator, asyncHandler(Controller.sendAttachment));
chat.get("/messages/:chatId", getMessages, asyncHandler(Controller.getMessages));

export default chat;