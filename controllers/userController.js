import { PrismaClient } from "../generated/prisma/index.js";
import expressAsyncHandler from "express-async-handler";
import upload from "../middlewares/multer.js";
import cloudinary from "../config/cloudinary.js";
import redisClient from "../config/redisClient.js";

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

  const userCache = await redisClient.get(`user:${userId}`);
  if (userCache) return res.send(JSON.parse(userCache));

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

  await redisClient.set(`user:${userId}`, JSON.stringify(user), {
    EX: 24 * 60 * 60, // 1 day in seconds
  });

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

  if (!user) return res.sendStatus(404);

  await redisClient.set(`user:${userId}`, JSON.stringify(user), {
    EX: 24 * 60 * 60, // 1 day in seconds
  });

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
  if (!user) return res.sendStatus(404);

  await redisClient.set(`user:${req.user.id}`, JSON.stringify(user), {
    EX: 24 * 60 * 60, // 1 day in seconds
  });

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

const uploadImage = [
  upload.single("image"),
  async (req, res) => {
    try {
      const result = await cloudinary.uploader
        .upload_stream(
          {
            folder: `odinsocial/user-${req.user.id}`,
            public_id: "image", // ← this sets the file name (without extension)
            overwrite: true, // optional: overwrite if a file with the same name exists
            resource_type: "image", // optional but safe
          },
          (error, result) => {
            if (error) return res.status(500).json({ error: error.message });

            const updateProfilePicture = async () => {
              await prisma.profile.update({
                where: {
                  userId: req.user.id,
                },
                data: {
                  imageUrl: result.secure_url,
                },
              });
              await redisClient.del(`user:${req.user.id}`);
            };

            updateProfilePicture();

            return res.status(200).json({ url: result.secure_url });
          }
        )
        .end(req.file.buffer);
    } catch (err) {
      res.status(500).json({ error: "Upload failed" });
    }
  },
];

export default {
  getUsers,
  getUserById,
  toggleFollow,
  getFollowers,
  getFollowing,
  editProfile,
  uploadImage,
};
