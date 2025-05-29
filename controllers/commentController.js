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
          id: true
        }
      }
    },
  });

  if (!comments) {
    return res.sendStatus(500);
  }

  res.send(comments);
};

const getRepliesByCommentId = async (req, res) => {
  const { commentId } = req.params;
  const replies = await prisma.reply.findMany({
    where: {
      commentId: parseInt(commentId),
    },
  });

  if (!replies) {
    return res.sendStatus(500);
  }

  res.send(replies);
};

export default { getCommentsByPostId, getRepliesByCommentId, createComment };
