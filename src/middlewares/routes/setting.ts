import { body } from "express-validator";
import { handleValidationErrors } from "../validators";

export const createSettingValidator = [];

export const updateSettingValidator = [
    body("bookingRequestsEnabled")
        .optional()
        .isBoolean()
        .withMessage("bookingRequestsEnabled must be a boolean"),

    body("newMessagesEnabled")
        .optional()
        .isBoolean()
        .withMessage("newMessagesEnabled must be a boolean"),

    body("paymentReceivedEnabled")
        .optional()
        .isBoolean()
        .withMessage("paymentReceivedEnabled must be a boolean"),

    body("customerReviewsEnabled")
        .optional()
        .isBoolean()
        .withMessage("customerReviewsEnabled must be a boolean"),
    handleValidationErrors
];
