import { PrismaClient } from "../generated/prisma/index.js";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

const configureSocket = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("Authentication error: token missing"));
    }

    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error("Authentication error: token invalid"));
    }
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.user.id);

    // Join a room (e.g., private chat between two users)
    socket.on("join room", ({ senderId, receiverId }) => {
      const roomId = [senderId, receiverId].sort().join("-");
      console.log("Joined Room:", roomId);
      socket.join(roomId);
    });

    socket.on("send message", async (data) => {
      console.log(`User ${socket.user.id} sent:`, data.text);
      const { text, authorId, receiverId } = data;
      const roomId = [authorId, receiverId].sort().join("-");

      const message = await prisma.message.create({
        data: {
          text,
          authorId: authorId,
          receiverId: receiverId,
        },
      });

      io.to(roomId).emit("receive message", message);
    });

    socket.on("disconnect", () => {
      console.log("User Disconnected: " + socket.user.id);
    });
  });
};

export default configureSocket;
