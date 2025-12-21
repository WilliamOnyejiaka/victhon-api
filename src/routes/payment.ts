import express, { Router } from 'express';
import asyncHandler from "express-async-handler";
import Controller  from '../controllers/Payment';
import { initializeValidator } from "./../middlewares/routes/payment";

const paymentRouter = Router();

paymentRouter.get('/initialize/booking/:bookingId', initializeValidator, asyncHandler(Controller.initializeBookingPayment));
// paymentRouter.get('/booking/verify/:bookingId', initializeValidator, asyncHandler(verifyBookingTransaction));
paymentRouter.post('/webhook', express.raw({ type: 'application/json' }), asyncHandler(Controller.webhook));

export default paymentRouter;