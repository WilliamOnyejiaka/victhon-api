// @ts-ignore
import { body, param, query } from "express-validator";
import { handleValidationErrors } from "../validators";
import { UserType } from "../../types/constants";
import verifyJWT from "../verifyJWT";


export const nearbyProfessionals = [
    query('page').optional().isInt({ min: 1 }).withMessage("page must be an integer"),
    query('limit').optional().isInt({ min: 1 }).withMessage("limit must be an integer"),
    query('radius').optional().isInt({ min: 1 }).withMessage("radius must be an integer"),
    param('longitude')
        .isFloat({ min: -180, max: 180 })
        .withMessage('Longitude must be a number between -180 and 180')
        .toFloat(),
    param('latitude')
        .isFloat({ min: -90, max: 90 })
        .withMessage('Latitude must be a number between -90 and 90')
        .toFloat(),
    handleValidationErrors
];

export const searchProfessionalValidator = [
    query("latitude")
        .optional()
        .isFloat({ min: -90, max: 90 })
        .withMessage("Latitude must be a valid number between -90 and 90"),

    query("longitude")
        .optional()
        .isFloat({ min: -180, max: 180 })
        .withMessage("Longitude must be a valid number between -180 and 180"),

    query("radius")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Radius must be a positive integer (in meters)"),

    // 🕒 Day of week filter
    query("dayOfWeek")
        .optional()
        .toLowerCase()
        .isIn([
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
            "sunday",
        ])
        .withMessage("dayOfWeek must be a valid weekday name"),

    // 🧠 Skills (array or comma-separated string)
    query("skills")
        .optional()
        .customSanitizer((value) => {
            if (typeof value === "string") return value.split(",").map((s) => s.trim());
            return Array.isArray(value) ? value : [];
        })
        .isArray({ min: 1 })
        .withMessage("Skills must be an array or comma-separated string"),

    // 💰 Price range
    query("minPrice")
        .optional()
        .isInt({ min: 0 })
        .toInt()
        .withMessage("minPrice must be a positive integer"),

    query("maxPrice")
        .optional()
        .isInt({ min: 0 })
        .toInt()
        .withMessage("maxPrice must be a positive integer"),

    // 🧾 Pagination
    query("limit")
        .optional()
        .isInt({ min: 1, })
        .toInt()
        .withMessage("limit must be greater than 0"),

    query("page")
        .optional()
        .isInt({ min: 1 })
        .toInt()
        .withMessage("page must be 1 or greater"),

    // ⚙️ Ensure that if one of lat/lon/radius is provided, all must be
    query()
        .custom((_, { req }) => {
            const q = req.query as Record<string, any>;
            const { latitude, longitude, radius } = q;
            const geoFields = [latitude, longitude, radius];
            const hasSome = geoFields.some((v) => v !== undefined);
            const hasAll = geoFields.every((v) => v !== undefined);
            if (hasSome && !hasAll)
                throw new Error("latitude, longitude, and radius must all be provided together");
            return true;
        }),
    handleValidationErrors
];

export const viewValidator = [
    verifyJWT([UserType.USER]),
    param("professionalId")
        .isUUID()
        .withMessage("Invalid professional Id (must be a UUID)"),
    handleValidationErrors
];
