import { PrismaClient } from "../generated/prisma/index.js";

const prisma = new PrismaClient();

const getUserById = async (req, res) => {
  const { userId } = req.params;
  const user = await prisma.user.findUnique({
    where: {
      id: parseInt(userId),
    },
    select: {
      id: true,
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
};

export default {
  getUserById,
};
