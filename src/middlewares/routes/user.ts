import {body} from "express-validator";
import {handleValidationErrors} from "../validators";
import uploads from "../multer";
import {ResourceType} from "../../types/constants";

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


export const editUserValidator = [
    uploads(ResourceType.IMAGE).single('image'),
    body("email")
        .optional()
        .isEmail()
        .withMessage("Email must be a valid email address"),

    body("phone")
        .optional()
        .isString()
        .isLength({min: 7, max: 20})
        .withMessage("Phone number must be between 7 and 20 characters"),

    body("firstName")
        .optional()
        .isString()
        .isLength({min: 1})
        .withMessage("First name cannot be empty"),

    body("lastName")
        .optional()
        .isString()
        .isLength({min: 1})
        .withMessage("Last name cannot be empty"),

    body("isActive")
        .optional()
        .isBoolean()
        .withMessage("isActive must be a boolean"),
    handleValidationErrors
];