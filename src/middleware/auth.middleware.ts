import { Request, Response, NextFunction } from "express";
import * as authService from "../services/auth.service.js";
import { JwtPayload } from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: JwtPayload & { id: string; role: string };
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.cookies.accessToken; // <-- read from cookie
  if (!token) return res.status(401).json({ error: "Missing access token" });

  try {
    const decoded = authService.verifyAccessToken(token) as JwtPayload & { id: string; role: string };
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function authorize(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
}
