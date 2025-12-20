import { Router, Request, Response } from 'express';
import asyncHandler from "express-async-handler";
import Controller from "../controllers/ProfessionalService";
import { add, deleteValidator, packagesValidator, packageValidator, updatePackageValidator } from '../middlewares/routes/service';

const packageRoute = Router();

packageRoute.post("/", add,asyncHandler(Controller.add));
packageRoute.get("/:professionalId", packagesValidator, asyncHandler(Controller.packages));
packageRoute.get("/:professionalId/:id", packageValidator, asyncHandler(Controller.package));
packageRoute.put("/:id", updatePackageValidator, asyncHandler(Controller.update));
packageRoute.delete("/:id", deleteValidator, asyncHandler(Controller.delete));



export default packageRoute;