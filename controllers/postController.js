import { PrismaClient } from "../generated/prisma/index.js";

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

const getPostById = async (req, res) => {
  const { postId } = req.params;
  const post = await prisma.post.findUnique({
    where: {
      id: parseInt(postId),
    },
  });

  if (!post) return res.sendStatus(500);

  res.send(post);
};

const createPost = async (req, res) => {
  const { content, parentPostId = null } = req.body;
  const post = await prisma.post.create({
    data: {
      content: content,
      authorId: req.user.id,
      parentPostId: parseInt(parentPostId),
    },
  });

  if (!post) {
    return res.sendStatus(500);
  }

  res.send(post);
};

const deletePost = async (req, res) => {
  const { postId } = res.params;
  const post = await prisma.post.delete({
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
  getPostById,
  createPost,
  deletePost,
};
