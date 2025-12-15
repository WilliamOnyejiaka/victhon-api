// @ts-ignore
import { body, param } from 'express-validator';
import { handleValidationErrors } from "../validators";
import { ResourceType, UserType } from "../../types/constants";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { createStore } from "../../config/redis";
import uploads, { mediaUpload } from '../multer';
import verifyJWT from '../verifyJWT';

export const add = [
    verifyJWT([UserType.PROFESSIONAL]),
    body('name')
        .isString()
        .withMessage('name must be a string')
        .isLength({ max: 50 })
        .withMessage('name must be at most 50 characters'),

    body('description')
        .isString()
        .withMessage('description must be a string')
        .isLength({ max: 100 })
        .withMessage('description must be at most 100 characters'),

    body('type')
        .isString()
        .withMessage('type must be a string'),

    body('price')
        .isFloat({ min: 1 })
        .withMessage('price must be a number greater than 1')
        .toInt(),

    // ✅ Validate addOns
    body("addOns")
        .optional()
        .isArray().withMessage("addOns must be an array"),

    body("addOns.*.name")
        .optional()
        .isString().withMessage("each addOn must have a name string")
        .notEmpty().withMessage("addOn name cannot be empty"),

    body("addOns.*.price")
        .optional()
        .isNumeric().withMessage("each addOn must have a numeric price"),
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