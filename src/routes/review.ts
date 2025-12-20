import { Router, Request, Response } from 'express';
import asyncHandler from "express-async-handler";
import Controller from "../controllers/Review";
import {
    create,
    reviews,
} from '../middlewares/routes/review';

const review = Router();

review.post("/", create, asyncHandler(Controller.create));
review.get("/:professionalId", reviews, asyncHandler(Controller.reviews));


export default review;