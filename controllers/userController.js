import { PrismaClient } from "../generated/prisma/index.js";
import expressAsyncHandler from "express-async-handler";

const prisma = new PrismaClient();

const getUsers = expressAsyncHandler(async (req, res) => {
  const { excludeUserId } = req.query;
  let filter = [req.user.id];
  if (excludeUserId) filter.push(parseInt(excludeUserId));
  const users = await prisma.user.findMany({
    where: {
      id: {
        notIn: filter,
      },
      followers: {
        none: {
          id: req.user.id,
        },
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      profile: true,
      followers: {
        select: {
          id: true,
        },
      },
    },
  });
  if (!users) return res.sendStatus(500);
  res.send(users);
});

const getUserById = expressAsyncHandler(async (req, res) => {
  const { userId } = req.params;
  const user = await prisma.user.findUnique({
    where: {
      id: parseInt(userId),
    },
    select: {
      id: true,
      createdAt: true,
      name: true,
      email: true,
      profile: true,
      followers: {
        select: {
          id: true,
        },
      },
      following: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!user) {
    return res.sendStatus(404);
  }

  res.send(user);
});

const toggleFollow = expressAsyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { action } = req.body;

  let following = {};

  if (!["FOLLOW", "UNFOLLOW"].includes(action)) {
    return res.sendStatus(400);
  }

  if (action === "FOLLOW") {
    following = { connect: { id: parseInt(userId) } };
  } else if (action === "UNFOLLOW") {
    following = { disconnect: { id: parseInt(userId) } };
  }

  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: { following },
  });

  if (!user) return res.sendStatus(404);

  return res.sendStatus(204);
});

const editProfile = expressAsyncHandler(async (req, res) => {
  const { name, bio, location } = req.body;

  if (!name && !bio && !location) {
    return res
      .status(400)
      .json({ message: "At least one field must be provided" });
  }
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: {
      ...(name && { name }), // Only update if provided
      profile: {
        update: {
          // Using update instead of direct assignment
          ...(bio && { bio }),
          ...(location && { location }),
        },
      },
    },
    include: {
      profile: true,
    },
  });
  if (!user) return res.sendStatus(404);

  return res.sendStatus(204);
});

const getFollowers = expressAsyncHandler(async (req, res) => {
  const { userId } = req.params;
  const users = await prisma.user.findMany({
    where: {
      following: {
        some: {
          id: parseInt(userId),
        },
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      profile: true,
      followers: {
        select: {
          id: true,
        },
      },
    },
  });
  if (!users) return res.sendStatus(500);
  res.send(users);
});

const getFollowing = expressAsyncHandler(async (req, res) => {
  const { userId } = req.params;
  const users = await prisma.user.findMany({
    where: {
      followers: {
        some: {
          id: parseInt(userId),
        },
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      profile: true,
      followers: {
        select: {
          id: true,
        },
      },
    },
  });
  if (!users) return res.sendStatus(500);
  res.send(users);
});

export default {
  getUsers,
  getUserById,
  toggleFollow,
  getFollowers,
  getFollowing,
  editProfile,
};
