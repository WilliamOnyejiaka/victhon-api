import { body } from "express-validator";
import { handleValidationErrors } from "../validators";

export const accountValidator = [
    body("name")
        .isString()
        .withMessage("Account name is required")
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage("Account name must be between 2 and 50 characters"),

    body("accountNumber")
        .isString()
        .trim()
        .isLength({ min: 5, max: 20 })
        .withMessage("Account number must be between 5 and 20 characters"),

    body("bankName")
        .isString()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage("Bank name must be between 2 and 100 characters"),
    handleValidationErrors
];
