import { body } from "express-validator";
import { handleValidationErrors } from "../validators";

export const validatePhotoField = [

    body("url")
        // .exists().withMessage("url is required")
        .isString().withMessage("url must be a string")
        .isURL().withMessage("url must be a valid URL"),

    body("publicId")
        // .exists().withMessage("publicId is required")
        .isString().withMessage("publicId must be a string"),
    handleValidationErrors
];