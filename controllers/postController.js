import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const getPosts = async (req, res) => {
  const posts = await prisma.post.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!posts) {
    return res.sendStatus(500);
  }

  res.send(posts);
};

