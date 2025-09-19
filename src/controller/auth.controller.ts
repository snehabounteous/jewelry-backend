import { Request, Response } from "express";
import * as authService from "../services/auth.service.js";
import { users } from "../models/users.model.js";
import { eq } from "drizzle-orm";
import { db } from "../config/db.js";
import jwt, { SignOptions } from "jsonwebtoken";

export async function register(req: Request, res: Response) {
  try {
    const { name, email, password } = req.body;
    const user = await authService.registerUser(name, email, password);
    res.status(201).json({ message: "User created", user });
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(400).json({ error: err.message });
    } else {
      res.status(400).json({ error: "Unknown error" });
    }
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await authService.loginUser(email, password);
    res.json({ 
      user: { id: user.id, name: user.name, email: user.email, role: user.role }, 
      accessToken, 
      refreshToken 
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(401).json({ error: err.message });
    } else {
      res.status(401).json({ error: "Unknown error" });
    }
  }
}

export async function refreshToken(req: Request, res: Response) {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: "Refresh token required" });

    const decoded: any = authService.verifyRefreshToken(token);

    const [user] = await db.select().from(users).where(eq(users.id, decoded.id));
    if (!user) return res.status(401).json({ error: "User not found" });

    const accessToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_ACCESS_SECRET!,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN } as SignOptions
    );

    res.json({ accessToken });
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(401).json({ error: err.message });
    } else {
      res.status(401).json({ error: "Invalid refresh token" });
    }
  }
}
