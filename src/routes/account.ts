import { Router, Request, Response } from 'express';
import asyncHandler from "express-async-handler";
import Controller from "../controllers/Account";
import { accountValidator } from '../middlewares/routes/account';

const account = Router();

account.post("/", accountValidator, asyncHandler(Controller.create));

// professional.get("/views", asyncHandler(Controller.views));
// professional.patch("/profile-photo", validatePhotoField, asyncHandler(Controller.uploadProfilePicture));

// professional.post("/gallery/", validateWorkGalleryArray, asyncHandler(Controller.uploadGallery));

// professional.post("/schedule", asyncHandler(Controller.createSchedule));


export default account;