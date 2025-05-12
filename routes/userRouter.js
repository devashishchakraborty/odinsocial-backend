import { Router } from "express";
import userController from "../controllers/userController.js";

const userRouter = Router();

userRouter.get("/", userController.getUsers);
userRouter.get("/:userId", userController.getUserById);

export default userRouter;
