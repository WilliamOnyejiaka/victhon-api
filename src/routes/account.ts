import { Router, Request, Response } from 'express';
import asyncHandler from "express-async-handler";
import Controller from "../controllers/Account";
import { accountValidator } from '../middlewares/routes/account';

const account = Router();

account.post("/", accountValidator, asyncHandler(Controller.create));
account.get("/", asyncHandler(Controller.getAll));
account.get("/:accountId", asyncHandler(Controller.getOne));
account.put("/:accountId", accountValidator, asyncHandler(Controller.update));
account.delete("/:accountId", asyncHandler(Controller.delete));
account.get("/banks", asyncHandler(Controller.banks));


export default account;