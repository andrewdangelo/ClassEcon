// src/auth.ts
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import type { Response } from "express";
import { env } from "./config";

export type JWTPayload = { sub: string; role: "TEACHER" | "STUDENT" | "PARENT" };

export async function hashPassword(plain: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(plain, salt);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function signAccessToken(userId: string, role: JWTPayload["role"]): string {
  return jwt.sign({ sub: userId, role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as jwt.SignOptions);
}

export function signRefreshToken(userId: string, role: JWTPayload["role"]): string {
  return jwt.sign({ sub: userId, role }, env.REFRESH_JWT_SECRET, {
    expiresIn: env.REFRESH_JWT_EXPIRES_IN,
  } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): JWTPayload {
  return jwt.verify(token, env.JWT_SECRET) as JWTPayload;
}

export function verifyRefreshToken(token: string): JWTPayload {
  return jwt.verify(token, env.REFRESH_JWT_SECRET) as JWTPayload;
}

export function setRefreshCookie(res: Response, token: string): void {
  res.cookie("refresh_token", token, {
    httpOnly: true,
    secure: false, // true in prod with HTTPS
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export function clearRefreshCookie(res: Response): void {
  res.clearCookie("refresh_token", { path: "/" });
}
