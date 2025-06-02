import { PrismaClient } from "../generated/prisma/index.js";

const prisma = new PrismaClient();

const createComment = async (req, res) => {
  const { postId } = req.params;
  const { newComment } = req.body;
  const comment = await prisma.comment.create({
    data: {
      text: newComment,
      postId: parseInt(postId),
      authorId: req.user.id,
    },
    include: {
      author: {
        include: {
          profile: true,
        },
      },
      likedBy: {
        select: {
          id: true,
        },
      },
      replies: true,
    },
  });
  if (!comment) {
    return res.sendStatus(500);
  }

  res.send(comment);
};

const getCommentsByPostId = async (req, res) => {
  const { postId } = req.params;
  const comments = await prisma.comment.findMany({
    where: {
      postId: parseInt(postId),
    },
    include: {
      author: {
        include: {
          profile: true,
        },
      },
      likedBy: {
        select: {
          id: true,
        },
      },
      replies: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!comments) {
    return res.sendStatus(500);
  }

  res.status(201).send(comments);
};

const createReply = async (req, res) => {
  const { commentId } = req.params;
  const { newReply } = req.body;
  
  const reply = await prisma.reply.create({
    data: {
      text: newReply,
      commentId: parseInt(commentId),
      authorId: req.user.id,
    },
    include: {
      author: {
        include: {
          profile: true,
        },
      },
      likedBy: {
        select: {
          id: true,
        },
      },
    },
  });
  if (!reply) {
    return res.sendStatus(500);
  }

  res.status(201).send(reply);
};

const getRepliesByCommentId = async (req, res) => {
  const { commentId } = req.params;
  const replies = await prisma.reply.findMany({
    where: {
      commentId: parseInt(commentId),
    },
    include: {
      author: {
        include: {
          profile: true,
        },
      },
      likedBy: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!replies) {
    return res.sendStatus(500);
  }

  res.send(replies);
};

const updateComment = async (req, res) => {
  const { commentId } = req.params;
  const { isLiked } = req.body;
  let action = {};

  if (isLiked) {
    action.likedBy =
      isLiked === "true"
        ? { connect: { id: req.user.id } }
        : { disconnect: { id: req.user.id } };
  }

  const comment = await prisma.comment.update({
    where: { id: parseInt(commentId) },
    data: action,
  });

  if (!comment) return res.sendStatus(500);

  res.send(comment);
};

export default {
  getCommentsByPostId,
  createReply,
  getRepliesByCommentId,
  createComment,
  updateComment,
};
