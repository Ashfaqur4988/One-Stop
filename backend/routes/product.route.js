import express from "express";
import { getAllProducts } from "../controller/product.controller.js";
import { protectedRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protectedRoute, getAllProducts);

export default router;
