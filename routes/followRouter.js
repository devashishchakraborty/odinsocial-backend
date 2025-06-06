import { Router } from "express";
import followController from "../controllers/followController.js";

const followRouter = Router();

followRouter.get("/followers", followController.getFollowers);
followRouter.get("/following", followController.getFollowing);
followRouter.post("/toggle-follow", followController.toggleFollow);

export default followRouter;
