import { Request, Response, NextFunction } from "express";
import * as authService from "../services/auth.service.js";

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Missing token" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = authService.verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (err: unknown) {
    res.status(401).json({ error: "Invalid token" });
  }
}

export function authorize(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || (typeof req.user !== "object") || !roles.includes((req.user as any).role)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
}
