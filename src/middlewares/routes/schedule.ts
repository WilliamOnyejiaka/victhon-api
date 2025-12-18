import { body, param } from "express-validator";
import { handleValidationErrors } from "../validators";
import { UserType } from "../../types/constants";
import verifyJWT from "../verifyJWT";
import { DayOfWeek } from "../../entities/ProfessionalSchedule";

const dayOfWeekValues: DayOfWeek[] = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday'
];

export const createScheduleValidator = [
    verifyJWT([UserType.PROFESSIONAL]),

    body("dayOfWeek")
        .isIn([
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
            "sunday",
        ])
        .withMessage("dayOfWeek must be a valid weekday"),

    body("startTime")
        .matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
        .withMessage("startTime must be in HH:MM:SS format"),

    body("endTime")
        .matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
        .withMessage("endTime must be in HH:MM:SS format"),

    body("isActive")
        .isBoolean()
        .withMessage("isActive must be a boolean")
        .toBoolean(),

    // Optional date range
    body("validFrom")
        .optional()
        .isISO8601()
        .withMessage("validFrom must be a valid date (YYYY-MM-DD)"),

    body("validUntil")
        .optional()
        .isISO8601()
        .withMessage("validUntil must be a valid date (YYYY-MM-DD)"),

    // Custom cross-field validation: endTime > startTime
    body()
        .custom((value, { req }) => {
            const { startTime, endTime, validFrom, validUntil } = req.body;

            if (startTime && endTime && startTime >= endTime) {
                throw new Error("endTime must be later than startTime");
            }

            if (validFrom && validUntil && validFrom > validUntil) {
                throw new Error("validUntil must be after validFrom");
            }

            return true;
        }),

    handleValidationErrors
];

export const scheduleValidator = [
    param("professionalId")
        .isUUID()
        .withMessage("Invalid professional Id (must be a UUID)"),

    param("id")
        .isUUID()
        .withMessage("Invalid schedule Id (must be a UUID)"),

    handleValidationErrors
];

export const schedulesValidator = [
    param("professionalId")
        .isUUID()
        .withMessage("Invalid professional Id (must be a UUID)"),
    handleValidationErrors
];

export const deleteValidator = [
    verifyJWT([UserType.PROFESSIONAL]),
    param("id")
        .isUUID()
        .withMessage("Invalid schedule id (must be a UUID)"),
    handleValidationErrors
];

export const updateScheduleValidator = [
    verifyJWT([UserType.PROFESSIONAL]),

    param("id")
        .isUUID()
        .withMessage("Invalid schedule id (must be a UUID)"),

    body("dayOfWeek")
        .optional({ nullable: true })
        .isIn(dayOfWeekValues)
        .withMessage(`dayOfWeek must be one of ${dayOfWeekValues.join(", ")}`),

    body("startTime")
        .optional({ nullable: true })
        .matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
        .withMessage("startTime must be in HH:mm:ss format"),

    body("endTime")
        .optional({ nullable: true })
        .matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
        .withMessage("endTime must be in HH:mm:ss format"),

    body("isActive")
        .optional({ nullable: true })
        .isBoolean()
        .withMessage("isActive must be a boolean"),

    body("validFrom")
        .optional({ nullable: true })
        .isISO8601()
        .withMessage("validFrom must be a valid date"),

    body("validUntil")
        .optional({ nullable: true })
        .isISO8601()
        .withMessage("validUntil must be a valid date"),

    // Custom cross-field validation: endTime > startTime
    body()
        .custom((value, { req }) => {
            const { startTime, endTime, validFrom, validUntil } = req.body;

            if (startTime && endTime && startTime >= endTime) {
                throw new Error("endTime must be later than startTime");
            }

            if (validFrom && validUntil && validFrom > validUntil) {
                throw new Error("validUntil must be after validFrom");
            }

            return true;
        }),

    handleValidationErrors
];
