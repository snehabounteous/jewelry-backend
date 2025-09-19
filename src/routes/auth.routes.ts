import express from "express";
import { register, login, refreshToken, getCurrentUser } from "../controller/auth.controller.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh-token", refreshToken);
router.get("/me", getCurrentUser);

export default router;
