import { Router } from "express";
import messageController from "../controllers/messageController.js";

const messageRouter = Router();

messageRouter.get("/texter/:texterId", messageController.getMessages);
messageRouter.post("/texter/:texterId", messageController.createMessage);
messageRouter.delete("/:messageId", messageController.deleteMessage);

export default messageRouter;