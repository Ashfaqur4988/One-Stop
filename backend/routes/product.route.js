import express from "express";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProductsByCategory,
  getRecommendedProducts,
  toggleFeaturedProduct,
} from "../controller/product.controller.js";
import { adminRoute, protectedRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protectedRoute, adminRoute, getAllProducts);
router.get("/featured", protectedRoute, getAllProducts);
router.get("/recommendations", getRecommendedProducts);
router.get("/category/:category", protectedRoute, getProductsByCategory);
router.post("/create-product", protectedRoute, adminRoute, createProduct);
router.patch("/:id", protectedRoute, adminRoute, toggleFeaturedProduct);
router.delete("/:id", protectedRoute, adminRoute, deleteProduct);

export default router;
