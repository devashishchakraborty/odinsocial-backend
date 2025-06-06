import { Router } from "express";
import postController from "../controllers/postController.js";
import commentController from "../controllers/commentController.js";
const postRouter = Router();

postRouter.get("/", postController.getPosts);
postRouter.get("/:postId", postController.getPostById);
postRouter.get("/:postId/comments", commentController.getCommentsByPostId);

postRouter.post("/", postController.createPost);
postRouter.post("/:postId/comments", commentController.createComment);

postRouter.put("/:postId", postController.updatePost);
postRouter.delete("/delete/:postId", postController.deletePost);

export default postRouter;
