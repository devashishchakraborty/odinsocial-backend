import { Router } from "express";
import userController from "../controllers/userController.js";

const userRouter = Router();

userRouter.post("/:userId", userController.getUserById);

export default userRouter;
