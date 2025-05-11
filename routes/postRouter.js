import { Router } from "express";
import postController from "../controllers/postController.js";

const postRouter = Router();

postRouter.get("/", postController.getPosts);
postRouter.get("/:postId", postController.getPostById)
postRouter.post("/", postController.createPost);
postRouter.delete("/delete/:postId", postController.deletePost)

export default postRouter;
