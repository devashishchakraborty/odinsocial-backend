import { PrismaClient } from "../generated/prisma/index.js";
import expressAsyncHandler from "express-async-handler";

const prisma = new PrismaClient();

const getFollowers = async (req, res) => {
  const { userId } = req.params;
  const followers = await prisma.follow.findMany({
    where: {
      followingId: parseInt(userId),
    },
    select: {
      follower: {
        select: {
          id: true,
          email: true,
          name: true,
          profile: true,
        },
      },
    },
  });

  if (!followers) {
    return res.sendStatus(500);
  }
  const users = followers.map((f) => f.follower);
  res.send(users);
};

const getFollowing = async (req, res) => {
  const { userId } = req.params;
  const following = await prisma.follow.findMany({
    where: {
      followerId: parseInt(userId),
    },
    select: {
      following: {
        select: {
          id: true,
          email: true,
          name: true,
          profile: true,
        },
      },
    },
  });

  if (!following) {
    return res.sendStatus(500);
  }

  const users = following.map((f) => f.following);
  res.send(users);
};

const toggleFollow = expressAsyncHandler(async (req, res) => {
  const { userId, type } = req.params;
  const followerId = req.user.id;
  const followingId = parseInt(userId);

  if (followerId === followingId) {
    return res.status(400).json({ error: "Cannot follow yourself" });
  }

  if (!["FOLLOW", "UNFOLLOW"].includes(type)) {
    return res.status(400).json({ error: "Invalid action type" });
  }

  let result;
  if (type === "FOLLOW") {
    result = await prisma.follow.create({
      data: {
        followerId,
        followingId,
      },
    });
    return res.status(201).send(result);
  }

  if (type === "UNFOLLOW") {
    result = await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });
    return res.status(200).send(result);
  }
});

export default {
  getFollowers,
  getFollowing,
  toggleFollow
};
