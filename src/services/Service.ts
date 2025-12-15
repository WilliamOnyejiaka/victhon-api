import { QueryFailedError } from "typeorm";
import pagination from "../utils/pagination";


export default class Service {

    public responseData(statusCode: number, error: boolean, message: string | null, data: any = {}) {
        return {
            statusCode: statusCode,
            json: {
                error: error,
                message: message,
                data: data
            }
        };
    }

    public pagination (page: number, limit: number, totalRecords: number){
        return pagination(page,limit, totalRecords);
    }

    public handleTypeormError(error: unknown) {
        let status = 500;
        let message = "An unexpected error occurred";

        // Handle TypeORM Query Failed Errors
        if (error instanceof QueryFailedError) {
            const sqlMessage = (error as any).message || "";

            if (sqlMessage.includes("Duplicate entry")) {
                status = 409;
                message = "Duplicate entry detected";
            }
            else if (sqlMessage.includes("foreign key constraint fails")) {
                status = 400;
                message = "Invalid reference to related data";
            }
            else if (sqlMessage.includes("ER_NO_REFERENCED_ROW")) {
                status = 400;
                message = "Referenced resource does not exist";
            }
            else if (sqlMessage.includes("ER_BAD_FIELD_ERROR")) {
                status = 400;
                message = "Invalid field in database query";
            }
            else {
                status = 400;
                message = "Database query failed";
            }
        }

        // MySQL connection error example
        else if (error instanceof Error && error.message.includes("ECONNREFUSED")) {
            status = 503;
            message = "Failed to connect to the database";
        }

        // Type casting errors / invalid values
        else if (error instanceof TypeError && error.message.includes("toISOString")) {
            status = 400;
            message = "Invalid timestamp value provided";
        }

        // Generic JS error
        else if (error instanceof Error) {
            message = error.message;
        }

        return this.responseData(status, true, message);
    }

}