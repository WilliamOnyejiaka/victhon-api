import { Router, Request, Response } from 'express';
import asyncHandler from "express-async-handler";
import Controller from "../controllers/Review";
import {
    create,
    deleteValidator,
    reviews, reviewValidator,
    updateValidator,
} from '../middlewares/routes/review';

const review = Router();

review.post("/", create, asyncHandler(Controller.create));
review.get("/:professionalId", reviews, asyncHandler(Controller.reviews));
review.get("/:professionalId/:id", reviewValidator, asyncHandler(Controller.review));
review.put("/:reviewId", updateValidator, asyncHandler(Controller.update));
review.delete("/:reviewId", deleteValidator, asyncHandler(Controller.delete));


export default review;