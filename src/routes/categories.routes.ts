// categories.routes.ts
import { Router } from "express";
import { CategoriesController } from "../controller/categories.controller.js";

const router = Router();
const controller = new CategoriesController();

// Routes
router.get("/", (req, res) => controller.getAll(req, res));
router.get("/:id", (req, res) => controller.getById(req, res));
router.post("/", (req, res) => controller.create(req, res));
router.put("/:id", (req, res) => controller.update(req, res));
router.delete("/:id", (req, res) => controller.delete(req, res));

export default router;
