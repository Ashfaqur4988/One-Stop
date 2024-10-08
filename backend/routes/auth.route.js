import express from "express";
import {
  getProfile,
  login,
  logout,
  refreshToken,
  signup,
} from "../controller/auth.controller.js";
import { adminRoute, protectedRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh-token", refreshToken);
router.get("/get-profile", protectedRoute, getProfile);

export default router;
