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

const createPost = async (req, res) => {
  const { content, parentPostId = null } = req.body;
  const post = await prisma.message.create({
    data: {
      content: content,
      author_id: req.user.id,
      parentPostId: parentPostId
    },
  });

  if (!post) {
    return res.sendStatus(500);
  }

  res.send(post);
};

const deletePost = async (req, res) => {
  const { postId } = res.params;
  const post = await prisma.message.delete({
    where: {
      id: parseInt(postId),
      author_id: parseInt(req.user.id),
    },
  });

  if (!post) return res.sendStatus(500);
  res.send(post);
};

export default {
  getPosts,
  createPost,
  deletePost,
};


