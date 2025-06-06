import { Router } from "express";
import commentController from "../controllers/commentController.js";
const commentRouter = Router();

commentRouter.get(
  "/:commentId/replies",
  commentController.getRepliesByCommentId
);
commentRouter.post("/:commentId/replies", commentController.createReply);
commentRouter.put("/:commentId", commentController.updateComment);
commentRouter.put("/replies/:replyId", commentController.updateReply);

export default commentRouter;
