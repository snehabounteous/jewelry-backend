import { Router } from "express";
import { SearchFilterController } from "../controller/search_filter.controller.js";

const router = Router();
const controller = new SearchFilterController();

// Save filter (optional, for history)
router.post("/", (req, res) => controller.addFilter(req, res));

// Search products
router.get("/", (req, res) => controller.search(req, res));

export default router;
