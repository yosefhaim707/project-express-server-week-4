import { Router } from "express";
import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { readUsers, saveUsers } from "../dal/dbReader.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createHttpError } from "../utils/httpError.js";
import { roundMoney } from "../utils/cartUtils.js";

const router = Router();

const getStartingBalance = () => {
  return Number(process.env.STARTING_BALANCE || 500);
};

const getTokenExpirationMinutes = () => {
  return Number(process.env.TOKEN_EXPIRATION_MINUTES || 60);
};

const createTokenExpirationDate = () => {
  const expiresInMilliseconds = getTokenExpirationMinutes() * 60 * 1000;
  return new Date(Date.now() + expiresInMilliseconds).toISOString();
};

const normalizeEmail = (email) => {
  return String(email).trim().toLowerCase();
};

const createPublicUser = (user) => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    balance: user.balance,
  };
};

router.post(
  "/signup",
  asyncHandler(async (request, response) => {
    const name = String(request.body.name || "").trim();
    const email = normalizeEmail(request.body.email || "");
    const password = String(request.body.password || "");

    if (!name || !email || !password) {
      throw createHttpError(400, "Name, email, and password are required.");
    }

    const users = await readUsers();
    const emailAlreadyExists = users.some((user) => user.email === email);

    if (emailAlreadyExists) {
      throw createHttpError(409, "A user with this email already exists.");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const authToken = randomUUID();
    const authTokenExpiresAt = createTokenExpirationDate();

    const user = {
      id: randomUUID(),
      name,
      email,
      passwordHash,
      balance: roundMoney(getStartingBalance()),
      cart: [],
      authToken,
      authTokenExpiresAt,
      createdAt: new Date().toISOString(),
    };

    users.push(user);
    await saveUsers(users);

    response.status(201).json({
      message: "Signup completed successfully.",
      user: createPublicUser(user),
      token: authToken,
      tokenExpiresAt: authTokenExpiresAt,
    });
  })
);

router.post(
  "/login",
  asyncHandler(async (request, response) => {
    const email = normalizeEmail(request.body.email || "");
    const password = String(request.body.password || "");

    if (!email || !password) {
      throw createHttpError(400, "Email and password are required.");
    }

    const users = await readUsers();
    const user = users.find((currentUser) => currentUser.email === email);

    if (!user) {
      throw createHttpError(401, "Email or password is incorrect.");
    }

    const passwordIsCorrect = await bcrypt.compare(password, user.passwordHash);

    if (!passwordIsCorrect) {
      throw createHttpError(401, "Email or password is incorrect.");
    }

    user.authToken = randomUUID();
    user.authTokenExpiresAt = createTokenExpirationDate();
    await saveUsers(users);

    response.json({
      message: "Login completed successfully.",
      user: createPublicUser(user),
      token: user.authToken,
      tokenExpiresAt: user.authTokenExpiresAt,
    });
  })
);

export default router;
