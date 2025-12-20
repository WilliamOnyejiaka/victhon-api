import { Router, Request, Response } from 'express';
import asyncHandler from "express-async-handler";
import Controller from "../controllers/Booking";
import {
    acceptBooking,
    bookings,
    createBooking,
    getProBooking,
    getUserBooking,
    proBookings,
    rejectBooking,
    userBookings
} from '../middlewares/routes/booking';

const booking = Router();

booking.get("/professionals/:bookingId", getProBooking, asyncHandler(Controller.getProBooking));
booking.get("/users/:bookingId", getUserBooking, asyncHandler(Controller.getUserBooking));
booking.get("/professionals", proBookings, asyncHandler(Controller.getProBookings));
booking.get("/users", userBookings, asyncHandler(Controller.getUserBookings));

booking.get("/schedules/:professionalId", bookings, asyncHandler(Controller.bookings));




booking.post("/", createBooking, asyncHandler(Controller.book));
booking.patch("/accept/:bookingId", acceptBooking, asyncHandler(Controller.acceptBooking));
booking.patch("/reject/:bookingId", rejectBooking, asyncHandler(Controller.rejectBooking));


// booking.post("/schedule", asyncHandler(Controller.createSchedule));


export default booking;