import { Router, Request, Response, NextFunction } from 'express';
import asyncHandler from "express-async-handler";
import Setting from '../controllers/Setting';
import { updateSettingValidator } from '../middlewares/routes/setting';

const router = Router();

router.post("/settings", asyncHandler(Setting.create));
router.get("/settings", asyncHandler(Setting.get));
router.put("/settings", updateSettingValidator, asyncHandler(Setting.update));
router.delete("/settings", asyncHandler(Setting.delete));

export default router;