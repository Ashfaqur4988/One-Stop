import express from "express";
import dotenv from "dotenv";
import authRoute from "./routes/auth.route.js";
import productRoute from "./routes/product.route.js";
import cartRoute from "./routes/cart.route.js";
import couponRoute from "./routes/coupon.route.js";
import analyticsRoute from "./routes/analytics.route.js";
import { connectDb } from "./utils/db.js";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoute);
app.use("/api/products", productRoute);
app.use("/api/cart", cartRoute);
app.use("/api/coupons", couponRoute);
app.use("/api/analytics", analyticsRoute);

app.get("/", (req, res) => {
  res.send("Home");
});

app.listen(port, () => {
  console.log("server started");
  connectDb();
});
