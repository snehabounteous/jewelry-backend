import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import { db } from "../config/db.js";
import { users } from "../models/users.model.js";
import dotenv from "dotenv";

dotenv.config();

const ACCESS_SECRET: string = process.env.JWT_ACCESS_SECRET!;
const REFRESH_SECRET: string = process.env.JWT_REFRESH_SECRET!;
const ACCESS_EXPIRES = process.env.ACCESS_TOKEN_EXPIRES_IN || "15m";
const REFRESH_EXPIRES = process.env.REFRESH_TOKEN_EXPIRES_IN || "7d";

export async function registerUser(name: string, email: string, password: string) {
  const hashed = await bcrypt.hash(password, 10);
  const result = await db.insert(users).values({
    name,
    email,
    password_hash: hashed,
  }).returning();
  return result[0];
}

export async function loginUser(email: string, password: string) {
  const usersFound = await db.select().from(users).where(eq(users.email, email));
  const user = usersFound[0];
  if (!user) throw new Error("User not found");

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw new Error("Invalid password");

  const accessToken = jwt.sign(
    { id: user.id, role: user.role },
    ACCESS_SECRET,
    { expiresIn: ACCESS_EXPIRES } as SignOptions
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    REFRESH_SECRET,
    { expiresIn: REFRESH_EXPIRES } as SignOptions
  );

  return { user, accessToken, refreshToken };
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, ACCESS_SECRET);
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, REFRESH_SECRET);
}
