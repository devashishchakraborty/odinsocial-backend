import { PrismaClient } from "../generated/prisma/index.js";
import expressAsyncHandler from "express-async-handler";

const prisma = new PrismaClient();

const getUsers = expressAsyncHandler(async (req, res) => {
  const users = await prisma.user.findMany();
  if (!users) return res.sendStatus(500);
  res.send(users);
});

const getUserById = expressAsyncHandler(async (req, res) => {
  const { userId } = req.params;
  const user = await prisma.user.findUnique({
    where: {
      id: parseInt(userId),
    },
    select: {
      id: true,
      createdAt: true,
      name: true,
      email: true,
      posts: true,
      profile: true,
      _count: {
        select: {
          followers: true,
          following: true,
        },
      },
    },
  });

  if (!user) {
    return res.sendStatus(500);
  }

  res.send(user);
});

export default {
  getUsers,
  getUserById,
};
