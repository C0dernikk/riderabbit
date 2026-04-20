import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import { errorHandler } from "./error.js";
import { sanitizeUser } from "./auth.js";

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(errorHandler(401, "No access token provided"));
  }

  const accessToken = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded.id;
    req.auth = decoded;
    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(errorHandler(401, "Access token expired"));
    }

    return next(errorHandler(403, "Invalid token"));
  }
};

export const loadCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user);

    if (!user) {
      return next(errorHandler(404, "User not found"));
    }

    req.currentUser = user;
    req.safeUser = sanitizeUser(user);
    return next();
  } catch (error) {
    return next(error);
  }
};

export const authorizeRoles =
  (...allowedRoles) =>
  async (req, res, next) => {
    try {
      if (!req.currentUser) {
        const user = await User.findById(req.user);

        if (!user) {
          return next(errorHandler(404, "User not found"));
        }

        req.currentUser = user;
        req.safeUser = sanitizeUser(user);
      }

      if (!req.currentUser) {
        return;
      }

      if (!allowedRoles.includes(req.currentUser.role)) {
        return next(errorHandler(403, "You are not authorized for this action"));
      }

      return next();
    } catch (error) {
      return next(error);
    }
  };
