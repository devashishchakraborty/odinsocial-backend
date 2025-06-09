import { Router } from "express";
import userController from "../controllers/userController.js";

const userRouter = Router();

userRouter.get("/:userId", userController.getUserById);
userRouter.get("/:userId/followers", userController.getFollowers);
userRouter.get("/:userId/following", userController.getFollowing);
userRouter.get("/", userController.getUsers);
userRouter.put("/", userController.editProfile);
userRouter.put("/:userId/toggle-follow", userController.toggleFollow);

export default userRouter;
