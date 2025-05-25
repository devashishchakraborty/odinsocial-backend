import { PrismaClient } from "../generated/prisma/index.js";

const prisma = new PrismaClient();

const getPosts = async (req, res) => {
  const { following, userId } = req.query;
  const filter = {};

  if (userId) filter.authorId = parseInt(userId);
  else if (following === "true") {
    filter.author = {
      followers: {
        some: {
          followerId: req.user.id,
        },
      },
    };
  }

  const posts = await prisma.post.findMany({
    where: filter,
    include: {
      likedBy: {
        select: {
          id: true,
        },
      },
      bookmarkedBy: {
        select: {
          id: true,
        },
      },
      comments: {
        select: {
          id: true,
        },
      },

      author: {
        select: {
          id: true,
          name: true,
          email: true,
          profile: {
            select: {
              imageUrl: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!posts) {
    return res.sendStatus(500);
  }

  res.send(posts);
};

const updatePost = async (req, res) => {
  const { postId } = req.params;
  const { userId, isLiked, isBookmarked } = req.body;
  let action = {};

  if (isLiked) {
    action.likedBy =
      isLiked === "true"
        ? { connect: { id: parseInt(userId) } }
        : { disconnect: { id: parseInt(userId) } };
  }

  if (isBookmarked) {
    action.bookmarkedBy =
      isBookmarked === "true"
        ? { connect: { id: parseInt(userId) } }
        : { disconnect: { id: parseInt(userId) } };
  }

  const post = await prisma.post.update({
    where: {
      id: parseInt(postId),
    },
    data: {
      ...action,
    },
    select: {
      id: true,
      likedBy: {
        select: {
          id: true,
        },
      },
      bookmarkedBy: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!post) return res.sendStatus(500);

  res.send(post);
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
  const { content } = req.body;
  const post = await prisma.post.create({
    data: {
      content: content,
      authorId: req.user.id,
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
  updatePost,
  deletePost,
};
