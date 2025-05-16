import { body, validationResult } from "express-validator";
import asyncHandler from "express-async-handler";
import { PrismaClient } from "../generated/prisma/index.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import "dotenv/config";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/tokenUtils.js";
import redisClient from "../config/redisClient.js";

const prisma = new PrismaClient();
const validateSignUp = [
  body("email")
    .toLowerCase()
    .trim()
    .custom(async (value) => {
      const user = await prisma.user.findUnique({
        where: {
          email: value,
        },
      });
      if (user) {
        throw new Error("Email already exists! Try a different one.");
      }
    }),
  body("name").trim(),
];

const userSignUp = [
  validateSignUp,
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(409).send({ errors: errors.array() });
    }
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        profile: {
          create: {},
        },
      },
      include: {
        profile: true,
      },
    });
    res.sendStatus(200);
  }),
];

const userLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({
    where: {
      email: email.trim().toLowerCase(),
    },
    include: {
      profile: true,
    },
  });

  if (!user) return res.status(400).send({ error: "Email not found!" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).send({ error: "Wrong Password!" });

  const payload = {
    id: user.id,
    email: user.email,
    name: user.name,
    profile: user.profile,
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  await redisClient.set(`refreshToken:${user.id}`, refreshToken, {
    EX: 30 * 24 * 60 * 60, // 30 days in seconds
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 7 days
  });

  return res.send({ accessToken });
});

const refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.sendStatus(401);

  const storedToken = await redisClient.get(`refreshToken:${req.user.id}`);
  if (!storedToken || storedToken !== refreshToken) return res.sendStatus(403);

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    const accessToken = generateAccessToken(user);
    res.json({ accessToken });
  });
};

const userLogout = async (req, res) => {
  await redisClient.del(`refreshToken:${req.user.id}`);
  res.clearCookie("refreshToken");
  res.sendStatus(204);
};

export default {
  userLogin,
  userSignUp,
  refreshToken,
  userLogout,
};
