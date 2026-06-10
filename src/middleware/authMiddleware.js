import { readUsers, saveUsers } from "../dal/dbReader.js";
import { createHttpError } from "../utils/httpError.js";

const getTokenFromHeader = (authorizationHeader) => {
  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    return null;
  }

  return authorizationHeader.slice("Bearer ".length);
};

export const requireAuth = async (request, response, next) => {
  try {
    const token = getTokenFromHeader(request.headers.authorization);

    if (!token) {
      throw createHttpError(401, "Missing auth token.");
    }

    const users = await readUsers();
    const user = users.find((currentUser) => currentUser.authToken === token);

    if (!user) {
      throw createHttpError(401, "Invalid auth token.");
    }

    const expiresAt = new Date(user.authTokenExpiresAt).getTime();

    if (Number.isNaN(expiresAt) || expiresAt <= Date.now()) {
      user.authToken = null;
      user.authTokenExpiresAt = null;
      await saveUsers(users);

      throw createHttpError(401, "Auth token expired. Please log in again.");
    }

    request.user = user;
    request.users = users;
    next();
  } catch (error) {
    next(error);
  }
};
