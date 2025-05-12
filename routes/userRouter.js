import { Router } from "express";
import followRouter from "./followRouter.js";
import userController from "../controllers/userController.js";

const userRouter = Router();

userRouter.use("/:userId", followRouter)
userRouter.get("/", userController.getUsers);
userRouter.get("/:userId", userController.getUserById);

export default userRouter;
