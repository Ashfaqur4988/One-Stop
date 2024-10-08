import express from "express";
import { protectedRoute } from "../middleware/auth.middleware.js";
import {
  checkoutSuccess,
  createCheckOutSession,
} from "../controller/payment.controller.js";

const router = express.Router();

router.post("/create-checkout-session", protectedRoute, createCheckOutSession);
router.post("/checkout-success", protectedRoute, checkoutSuccess);

export default router;
