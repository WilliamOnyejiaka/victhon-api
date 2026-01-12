import {Router, Request, Response} from 'express';
import asyncHandler from "express-async-handler";
import Controller from "../controllers/ProfessionalService";
import {
    add,
    allServices,
    deleteValidator,
    packagesValidator,
    packageValidator,
    updateServiceImagesValidator,
    updateServiceValidator,
    validateServiceSearch
} from '../middlewares/routes/service';

const packageRoute = Router();

packageRoute.post("/", add, asyncHandler(Controller.add));
packageRoute.get("/", allServices, asyncHandler(Controller.allServices));
packageRoute.get("/search", validateServiceSearch, asyncHandler(Controller.searchServices));
packageRoute.get("/nearBy", allServices, asyncHandler(Controller.nearByProfessionals));
packageRoute.get("/:professionalId", packagesValidator, asyncHandler(Controller.packages));
packageRoute.get("/:professionalId/:id", packageValidator, asyncHandler(Controller.package));
packageRoute.put("/:id", updateServiceValidator, asyncHandler(Controller.update));
packageRoute.patch("/images/:id", updateServiceImagesValidator, asyncHandler(Controller.updateServiceImages));
packageRoute.delete("/:id", deleteValidator, asyncHandler(Controller.delete));

export default packageRoute;