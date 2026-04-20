import "../config/env.js";
import jwt from "jsonwebtoken";

const ACCESS_TOKEN_EXPIRES_IN =
  process.env.ACCESS_TOKEN_EXPIRES_IN || "15m";
const REFRESH_TOKEN_EXPIRES_IN =
  process.env.REFRESH_TOKEN_EXPIRES_IN || "7d";
const IS_PRODUCTION = process.env.NODE_ENV === "production";

export const normalizeEmail = (email = "") =>
  typeof email === "string" ? email.trim().toLowerCase() : "";

export const isValidEmail = (email = "") =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const sanitizeUser = (user) => {
  const userObject = typeof user.toObject === "function" ? user.toObject() : user;
  const { password, refreshToken, ...safeUser } = userObject;
  return safeUser;
};

export const createAccessToken = (user) =>
  jwt.sign(
    {
      id: user._id.toString(),
      role: user.role,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
  );

export const createRefreshToken = (user) =>
  jwt.sign(
    {
      id: user._id.toString(),
      role: user.role,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
  );

export const getRefreshTokenCookieOptions = () => ({
  httpOnly: true,
  secure: IS_PRODUCTION,
  sameSite: IS_PRODUCTION ? "none" : "lax",
  path: "/",
});

export const setRefreshTokenCookie = (res, refreshToken) => {
  res.cookie("refreshToken", refreshToken, getRefreshTokenCookieOptions());
};

export const clearRefreshTokenCookie = (res) => {
  res.clearCookie("refreshToken", getRefreshTokenCookieOptions());
};

export const respondWithAuth = async (res, user, statusCode = 200) => {
  const accessToken = createAccessToken(user);
  const refreshToken = createRefreshToken(user);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  setRefreshTokenCookie(res, refreshToken);

  return res.status(statusCode).json({
    success: true,
    accessToken,
    user: sanitizeUser(user),
  });
};
