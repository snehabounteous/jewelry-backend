import express from "express";
import { register, login, refreshToken, getCurrentUser, logout } from "../controller/auth.controller.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh-token", refreshToken);
router.get("/me", getCurrentUser);
router.post("/logout", logout);

export default router;
