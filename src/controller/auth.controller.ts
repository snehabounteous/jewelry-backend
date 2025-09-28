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

// --- Login: sets both tokens in httpOnly cookies
export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await authService.loginUser(email, password);

    // set both access and refresh tokens as httpOnly cookies
    res
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000, // 15 min
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
      .json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(401).json({ error: err.message });
    } else {
      res.status(401).json({ error: "Unknown error" });
    }
  }
}

// --- Refresh access token using httpOnly refreshToken cookie
export async function refreshToken(req: Request, res: Response) {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(400).json({ error: "Refresh token required" });

    const decoded: any = authService.verifyRefreshToken(token);

    const [user] = await db.select().from(users).where(eq(users.id, decoded.id));
    if (!user) return res.status(401).json({ error: "User not found" });

    const accessToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_ACCESS_SECRET!,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN } as SignOptions
    );

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 min
    });

    res.json({ message: "Access token refreshed" });
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(401).json({ error: err.message });
    } else {
      res.status(401).json({ error: "Invalid refresh token" });
    }
  }
}

// --- Get current user using accessToken from cookie
export async function getCurrentUser(req: Request, res: Response) {
  try {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json({ error: "No access token provided" });

    const decoded: any = authService.verifyAccessToken(token);
    const userId = decoded.id;

    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err: unknown) {
    if (err instanceof Error) return res.status(401).json({ error: err.message });
    return res.status(401).json({ error: "Invalid token" });
  }
}

// --- Logout: clear both cookies
export async function logout(req: Request, res: Response) {
  try {
    res
      .clearCookie("accessToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      })
      .clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

    res.json({ message: "Logged out successfully" });
  } catch (err: unknown) {
    if (err instanceof Error) res.status(500).json({ error: err.message });
    else res.status(500).json({ error: "Unknown error" });
  }
}
