import { body, param, query } from "express-validator";
import { handleValidationErrors } from "../validators";
import verifyJWT from "../verifyJWT";
import { UserType } from "../../types/constants";
import { Review } from "../../entities/Review";
import { AppDataSource } from "../../data-source";


export const create = [
    verifyJWT([UserType.USER]),
    body("text")
        .isString().withMessage("Text must be a string")
        .notEmpty().withMessage("Text is required"),

    body("rating")
        .isInt({ min: 1, max: 5 })
        .withMessage("Rating must be an integer between 1 and 5"),

    body("professionalId")
        .isUUID()
        .withMessage("Invalid professionalId format"),

    body().custom(async (value) => {
        const { userId, professionalId } = value;
        if (!userId || !professionalId) return true;

        const reviewRepo = AppDataSource.getRepository(Review);
        const existing = await reviewRepo.findOne({
            where: { userId, professionalId },
        });

        if (existing) {
            throw new Error("You have already reviewed this professional");
        }

        return true;
    }),
    handleValidationErrors
];

export const reviews = [
    verifyJWT([UserType.PROFESSIONAL, UserType.USER]),
    query('page').optional().isInt({ min: 1 }).withMessage("page must be an integer"),
    query('limit').optional().isInt({ min: 1 }).withMessage("limit must be an integer"),
    param("professionalId")
        .isUUID()
        .withMessage("Invalid professionalId format"),
    handleValidationErrors
];