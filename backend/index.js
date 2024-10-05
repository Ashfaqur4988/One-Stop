import express from "express";
import dotenv from "dotenv";
import authRoute from "./routes/auth.route.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

app.use("/api/auth", authRoute);

app.get("/", (req, res) => {
  res.send("Home");
});

app.listen(port, () => {
  console.log("server started");
});
