import { PrismaClient } from "../generated/prisma/index.js";

const prisma = new PrismaClient();

// Getting messages between user and texter
const getMessages = async (req, res) => {
  const { texterId } = req.params;
  const messages = await prisma.message.findMany({
    where: {
      OR: [
        {
          authorId: req.user.id,
          receiverId: parseInt(texterId),
        },
        {
          authorId: parseInt(texterId),
          receiverId: req.user.id,
        },
      ],
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!messages) {
    return res.sendStatus(500);
  }

  res.send(messages);
};

const createMessage = async (req, res) => {
  const { text } = req.body;
  const { texterId } = req.params;
  const message = await prisma.message.create({
    data: {
      text: text,
      receiverId: parseInt(texterId),
      authorId: req.user.id,
    },
  });
  if (!message) {
    return res.sendStatus(500);
  }

  res.send(message);
};

const deleteMessage = async (req, res) => {
  const { messageId } = res.params;
  const message = await prisma.message.delete({
    where: {
      id: parseInt(messageId),
      authorId: parseInt(req.user.id),
    },
  });

  if (!message) return res.sendStatus(500);
  res.send(message);
};

export default {
  getMessages,
  createMessage,
  deleteMessage,
};