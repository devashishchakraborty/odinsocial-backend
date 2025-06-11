import { PrismaClient } from "../generated/prisma/index.js";
import expressAsyncHandler from "express-async-handler";
import redisClient from "../config/redisClient.js";

const prisma = new PrismaClient();

const getPosts = expressAsyncHandler(async (req, res) => {
  const { following, userId, showBookmarks } = req.query;
  const filter = {};

  if (userId) filter.authorId = parseInt(userId); // Posts by User Id
  else if (following === "true") {
    // To show posts by people the user is following
    filter.author = {
      followers: {
        some: {
          id: req.user.id,
        },
      },
    };
  } else if (showBookmarks === "true") {
    // To show user's bookmarked posts
    filter.bookmarkedBy = {
      some: {
        id: req.user.id,
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

  res.send(posts);
});

const updatePost = expressAsyncHandler(async (req, res) => {
  const { postId } = req.params;
  const { isLiked, isBookmarked } = req.body;
  let action = {};

  if (isLiked) {
    action.likedBy =
      isLiked === "true"
        ? { connect: { id: req.user.id } }
        : { disconnect: { id: req.user.id } };
  }

  if (isBookmarked) {
    action.bookmarkedBy =
      isBookmarked === "true"
        ? { connect: { id: req.user.id } }
        : { disconnect: { id: req.user.id } };
  }

  const post = await prisma.post.update({
    where: { id: parseInt(postId) },
    data: action,
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
  });

  if (!post) return res.sendStatus(404);

  await redisClient.set(`post:${post.id}`, JSON.stringify(post), {
    EX: 24 * 60 * 60, // 1 day in seconds
  });

  return res.sendStatus(204);
});

const getPostById = expressAsyncHandler(async (req, res) => {
  const { postId } = req.params;

  const postCache = await redisClient.get(`post:${postId}`);
  if (postCache) return res.send(JSON.parse(postCache));

  const post = await prisma.post.findUnique({
    where: {
      id: parseInt(postId),
    },
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
  });

  await redisClient.set(`post:${post.id}`, JSON.stringify(post), {
    EX: 24 * 60 * 60, // 1 day in seconds
  });

  if (!post) return res.sendStatus(404);

  res.send(post);
});

const createPost = expressAsyncHandler(async (req, res) => {
  const { content } = req.body;

  if (content.length === 0)
    return res.status(400).send({ message: "Empty post content." });
  const post = await prisma.post.create({
    data: {
      content: content,
      authorId: req.user.id,
    },
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
  });

  if (!post) {
    return res.sendStatus(500);
  }

  res.status(201).send(post);
});

const deletePost = expressAsyncHandler(async (req, res) => {
  const { postId } = res.params;
  const post = await prisma.post.delete({
    where: {
      id: parseInt(postId),
      author_id: parseInt(req.user.id),
    },
  });

  if (!post) return res.sendStatus(500);

  await redisClient.del(`post:${post.id}`);

  res.sendStatus(204);
});

export default {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
};
