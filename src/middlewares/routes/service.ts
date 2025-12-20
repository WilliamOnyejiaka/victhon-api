// @ts-ignore
import {body, param} from 'express-validator';
import {handleValidationErrors} from "../validators";
import {ResourceType, UserType} from "../../types/constants";
import uploads from '../multer';
import verifyJWT from '../verifyJWT';

export const add = [
    verifyJWT([UserType.PROFESSIONAL]),
    uploads(ResourceType.IMAGE).array('images',5),
    body("name")
        .isString()
        .isLength({ min: 1, max: 50 })
        .withMessage("Name must be a string and max 50 characters"),

    body("category")
        .isString()
        .isLength({ min: 1, max: 80 })
        .withMessage("Category must be a string and max 80 characters"),

    body("description")
        .isString()
        .isLength({ min: 1, max: 80 })
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
        .isLength({ max: 100 })
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
    verifyJWT([UserType.PROFESSIONAL,UserType.USER]),
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

export const updatePackageValidator = [
    verifyJWT([UserType.PROFESSIONAL]),
    param('id')
        .exists().withMessage('Package ID is required')
        .isUUID().withMessage('Package ID must be a valid UUID'),

    body('name')
        .optional()
        .isString().withMessage('Name must be a string')
        .isLength({ min: 3 }).withMessage('Name must be at least 3 characters'),

    body('description')
        .optional()
        .isString().withMessage('Description must be a string')
        .isLength({ min: 5 }).withMessage('Description must be at least 5 characters'),

    body('price')
        .optional()
        .isFloat({ gt: 0 }).withMessage('Price must be a positive number'),

    body('type')
        .optional()
        .isIn(['basic', 'premium', 'custom']).withMessage('Type must be one of: basic, premium, custom'),

    body('addOns')
        .optional()
        .isArray().withMessage('addOns must be an array')
        .custom((value) => {
            for (const item of value) {
                if (typeof item.name !== 'string' || typeof item.price !== 'number') {
                    throw new Error('Each addOn must have a name (string) and price (number)');
                }
            }
            return true;
        }),
    handleValidationErrors
];