import { Router, Request, Response } from 'express';
import asyncHandler from "express-async-handler";
import Controller from "../controllers/Notification";
import {
    users,
    professionals,
} from '../middlewares/routes/notification';
import { UserType } from '../types/constants';
import verifyJWT from '../middlewares/verifyJWT';

const notification = Router();

notification.get("/users/:id", verifyJWT([UserType.USER]), asyncHandler(Controller.notification(UserType.USER)));
notification.get("/professionals/:id", verifyJWT([UserType.PROFESSIONAL]), asyncHandler(Controller.notification(UserType.PROFESSIONAL)));

notification.get("/professionals", professionals, asyncHandler(Controller.notifications(UserType.PROFESSIONAL)));
notification.get("/users", users, asyncHandler(Controller.notifications(UserType.USER)));

export default notification;