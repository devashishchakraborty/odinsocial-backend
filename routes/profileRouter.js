import { Router } from "express";
import profileController from "../controllers/profileController.js";

const profileRouter = Router();

profileRouter.post("/:userId", profileController.getUserById);

export default profileRouter;
