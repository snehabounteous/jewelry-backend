// src/routes/product.routes.ts
import { Router } from "express";
import { ProductController } from "../controller/product.controller.js";

const router = Router();

router.post("/", ProductController.createProduct);
router.get("/", ProductController.getAllProducts);
router.get("/:id", ProductController.getProductById);
router.put("/:id", ProductController.updateProduct);
router.delete("/:id", ProductController.deleteProduct);
<<<<<<< HEAD
router.get("/detailed/all", ProductController.getAllProductsWithImagesAndReviews);
=======
router.get("/category/:categoryId", ProductController.getProductsByCategory);
>>>>>>> fd6864b85aa4f937ebfad3fda233276d625a2807

export default router;
