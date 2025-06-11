import { Router } from "express";
import cors from "cors";
import userController from "../controllers/userController.js";

const userRouter = Router();

userRouter.post("/image-upload", userController.uploadImage)
userRouter.get("/:userId", userController.getUserById);
userRouter.get("/:userId/followers", userController.getFollowers);
userRouter.get("/:userId/following", userController.getFollowing);
userRouter.get("/", userController.getUsers);
userRouter.put("/", userController.editProfile);
userRouter.put("/:userId/toggle-follow", userController.toggleFollow);

export default userRouter;
