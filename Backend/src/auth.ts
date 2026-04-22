// src/auth.ts
import jwt, { type SignOptions } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import type { Response } from "express";
import { env } from "./config";

type JWTPayload = { sub: string; role: "TEACHER" | "STUDENT" | "PARENT" };

export async function hashPassword(plain: string) {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(plain, salt);
}
export async function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}

export function signAccessToken(userId: string, role: JWTPayload["role"]) {
  return jwt.sign(
    { sub: userId, role }, 
    env.JWT_SECRET, 
    { expiresIn: env.JWT_EXPIRES_IN } as SignOptions
  );
}
export function signRefreshToken(userId: string, role: JWTPayload["role"]) {
  return jwt.sign(
    { sub: userId, role }, 
    env.REFRESH_JWT_SECRET, 
    { expiresIn: env.REFRESH_JWT_EXPIRES_IN } as SignOptions
  );
}
export function verifyAccessToken(token: string): JWTPayload {
  return jwt.verify(token, env.JWT_SECRET) as JWTPayload;
}
export function verifyRefreshToken(token: string): JWTPayload {
  return jwt.verify(token, env.REFRESH_JWT_SECRET) as JWTPayload;
}

const isProd = process.env.NODE_ENV === "production";
const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: (isProd ? "none" : "lax") as "none" | "lax",
  path: "/graphql",
} as const;

export function setRefreshCookie(res: Response, token: string) {
  res.cookie("refresh_token", token, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}
export function clearRefreshCookie(res: Response) {
  res.clearCookie("refresh_token", { path: "/graphql" });
}
