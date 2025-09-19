// routes/productRoutes.ts
import express from "express";
import { injectUserId } from "../middleware/injectUserId";
import {
  createProduct,
  getProducts,
  getProductById,
  getMyProducts,
  updateProduct,
  deleteProduct,
  replaceProductImages,
} from "../controllers/productsController";

const router = express.Router();

// public
router.get("/", getProducts);
router.get("/:id", getProductById);

// auth-needed but role checks done inside controllers
router.get("/mine/list", injectUserId, getMyProducts);
router.post("/", injectUserId, createProduct);
router.put("/:id", injectUserId, updateProduct);
router.delete("/:id", injectUserId, deleteProduct);
router.put("/:id/images", injectUserId, replaceProductImages);

export default router;
