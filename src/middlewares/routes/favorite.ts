import { body, param } from "express-validator";
import { UserType } from "../../types/constants";
import { handleValidationErrors } from "../validators";
import verifyJWT from "../verifyJWT";


export const addValidator = [
    body("professionalId")
        .isUUID()
        .withMessage("Invalid professional Id (must be a UUID)"),
    handleValidationErrors
];
