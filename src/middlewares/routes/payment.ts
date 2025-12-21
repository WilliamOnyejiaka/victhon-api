import { param } from "express-validator";
import {handleValidationErrors} from "../validators";
import {UserType} from "../../types/constants";
import verifyJWT from "../verifyJWT";

export const initializeValidator = [
    verifyJWT([UserType.USER]),
    param('bookingId')
        .exists().withMessage('Booking ID is required')
        .isUUID().withMessage('Booking ID must be a valid id'),
    handleValidationErrors
];