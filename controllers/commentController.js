import { PrismaClient } from "../generated/prisma/index.js";

const prisma = new PrismaClient();

const getCommentsByPostId = async (req, res) => {
  const { postId } = req.params;
  const comments = await prisma.comment.findMany({
    where: {
      postId: parseInt(postId),
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

export default { getCommentsByPostId, getRepliesByCommentId };
