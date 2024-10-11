import express from "express";
import { adminRoute, protectedRoute } from "../middleware/auth.middleware.js";
import {
  getAnalyticsData,
  getDailySales,
} from "../controller/analytics.controller.js";

const router = express.Router();

router.get("/", protectedRoute, adminRoute, async (req, res) => {
  try {
    // console.log("inside analytics route js");
    const analytics = await getAnalyticsData();

    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago

    const dailySales = await getDailySales(startDate, endDate);
    res.status(200).json({ analytics, dailySales });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Unable to get analytics" });
  }
});

export default router;
