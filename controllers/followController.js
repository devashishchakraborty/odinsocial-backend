import { PrismaClient } from "../generated/prisma/index.js";

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
  const users = followers.map(f => f.follower);
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
  
  const users = following.map(f => f.following);
  res.send(users);
};

export default {
  getFollowers,
  getFollowing,
};
