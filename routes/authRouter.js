import { Router } from "express";
import authController from "../controllers/authController.js";

const authRouter = Router();

authRouter.post("/sign-up", authController.userSignUp);
authRouter.post("/login", authController.userLogin);
authRouter.post("/refresh", authController.refreshToken);
authRouter.post("/logout", authController.userLogout)

export default authRouter;
