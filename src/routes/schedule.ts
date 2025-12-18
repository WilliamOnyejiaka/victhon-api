import { Router, Request, Response } from 'express';
import asyncHandler from "express-async-handler";
import Controller from "../controllers/Schedule";
import {
    createScheduleValidator,
    deleteValidator,
    schedulesValidator,
    scheduleValidator,
    updateScheduleValidator
} from '../middlewares/routes/schedule';

const schedule = Router();

schedule.get("/:professionalId", schedulesValidator, asyncHandler(Controller.schedules));
schedule.get("/:professionalId/:id", scheduleValidator, asyncHandler(Controller.schedule));
schedule.put("/:id", updateScheduleValidator, asyncHandler(Controller.update));
schedule.delete("/:id", deleteValidator, asyncHandler(Controller.delete));



schedule.post("/", createScheduleValidator, asyncHandler(Controller.createSchedule));

export default schedule;