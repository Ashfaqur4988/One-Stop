import express from "express";
import { protectedRoute } from "../middleware/auth.middleware.js";
import {
  addToCart,
  getCartProducts,
  removeAllFromCart,
  updateQuantity,
} from "../controller/cart.controller.js";
const router = express.Router();

router.get("/", protectedRoute, getCartProducts);
router.post("/", protectedRoute, addToCart);
router.delete("/", protectedRoute, removeAllFromCart);
router.put("/:id", protectedRoute, updateQuantity);

export default router;
