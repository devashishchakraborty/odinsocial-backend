import express from "express";
import path from "path";
import cors from "cors";
import cookieParser from "cookie-parser";
import authenticateJWT from "./middlewares/authenticateJWT.js";
import routes from "./routes/index.js";
import { Server } from "socket.io";
import { createServer } from "http";
import configureSocket from "./config/socket.js";
import "dotenv/config";

const app = express();
const server = createServer(app);
const port = process.env.PORT || 3000;
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true
  },
});

configureSocket(io);
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(import.meta.dirname, "public")));
app.use(
  cors({
    origin: process.env.CLIENT_URL, // Explicit origin
    credentials: true, // Allow credentials
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use(routes.authRouter);
app.use("/posts", authenticateJWT, routes.postRouter);
app.use("/users", authenticateJWT, routes.userRouter);
app.use("/comments", authenticateJWT, routes.commentRouter);
app.use("/messages", authenticateJWT, routes.messageRouter);

app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message || "Internal Server Error",
  });
});

server.listen(port, () => {
  console.log(`OdinSocial Backend and Socket.IO server listening on port ${port}`);
});
