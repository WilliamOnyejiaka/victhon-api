// @ts-ignore
import {body, param} from 'express-validator';
import {handleValidationErrors} from "../validators";
import {ResourceType, UserType} from "../../types/constants";
import uploads from '../multer';
import verifyJWT from '../verifyJWT';

export const add = [
    verifyJWT([UserType.PROFESSIONAL]),
    uploads(ResourceType.IMAGE).array('images', 5),
    body("name")
        .isString()
        .isLength({min: 1, max: 50})
        .withMessage("Name must be a string and max 50 characters"),

    body("category")
        .isString()
        .isLength({min: 1, max: 80})
        .withMessage("Category must be a string and max 80 characters"),

    body("description")
        .isString()
        .isLength({min: 1, max: 80})
        .withMessage("Description must be a string and max 80 characters"),

    body("price")
        .isNumeric()
        .toFloat()
        .withMessage("Price must be a valid decimal")
        .toFloat(),

    body("hourlyPrice")
        .optional()
        .isNumeric()
        .toFloat()
        .withMessage("Hourly price must be a valid decimal"),

    body("address")
        .optional()
        .isString()
        .isLength({max: 100})
        .withMessage("Address must be a string and max 100 characters"),

    body("remoteLocationService")
        .isBoolean()
        .withMessage("remoteLocationService must be boolean")
        .toBoolean(),


    body("onsiteLocationService")
        .isBoolean()
        .withMessage("onsiteLocationService must be boolean")
        .toBoolean(),

    body("storeLocationService")
        .isBoolean()
        .withMessage("storeLocationService must be boolean")
        .toBoolean(),
    handleValidationErrors
];


export const packageValidator = [
    verifyJWT([UserType.PROFESSIONAL, UserType.USER]),

    param("professionalId")
        .isUUID()
        .withMessage("Invalid professional Id (must be a UUID)"),

    param("id")
        .isUUID()
        .withMessage("Invalid package Id (must be a UUID)"),

    handleValidationErrors
];

export const packagesValidator = [
    verifyJWT([UserType.PROFESSIONAL, UserType.USER]),
    param("professionalId")
        .isUUID()
        .withMessage("Invalid professional Id (must be a UUID)"),
    handleValidationErrors
];

export const deleteValidator = [
    verifyJWT([UserType.PROFESSIONAL]),
    param("id")
        .isUUID()
        .withMessage("Invalid package id (must be a UUID)"),
    handleValidationErrors
];

export const updateServiceValidator = [
    verifyJWT([UserType.PROFESSIONAL]),

    // identifiers
    param("id")
        .isUUID()
        .withMessage("Service id must be a valid UUID"),

    // fields being updated (all optional)
    body("name")
        .optional()
        .isString()
        .isLength({min: 2, max: 100})
        .withMessage("Name must be between 2 and 100 characters"),

    body("description")
        .optional()
        .isString()
        .isLength({min: 5, max: 1000})
        .withMessage("Description must be between 5 and 1000 characters"),

    body("category")
        .optional()
        .isString()
        .withMessage("Category must be a string"),

    body("price")
        .optional()
        .isFloat({min: 0})
        .withMessage("Price must be a positive number"),

    body("hourlyPrice")
        .optional()
        .isFloat({min: 0})
        .withMessage("Hourly price must be a positive number"),

    body("address")
        .optional()
        .isString()
        .isLength({min: 3, max: 255})
        .withMessage("Address must be valid"),

    body("remoteLocationService")
        .optional()
        .isBoolean()
        .withMessage("remoteLocationService must be boolean"),

    body("onsiteLocationService")
        .optional()
        .isBoolean()
        .withMessage("onsiteLocationService must be boolean"),

    body("storeLocationService")
        .optional()
        .isBoolean()
        .withMessage("storeLocationService must be boolean"),
    handleValidationErrors
];