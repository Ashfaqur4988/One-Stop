import jwt from "jsonwebtoken";
import User from "../model/user.model.js";

export const protectedRoute = (req, res, next) => {
  const accessToken = req.cookies.accessToken;

  try {
    if (!accessToken) {
      return res.status(401).send("No access token provided");
    }

    jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
      if (err) {
        return res.status(401).send("Invalid access token");
      }

      req.userId = payload.userId;
      next();
    });
  } catch (error) {
    console.log("error in protectedRoute middleware:", error.message);
    res.status(500).json({ message: "Unable to authenticate user" });
  }
};

export const adminRoute = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (user && user.role === "admin") {
      next();
    } else {
      return res.status(401).json({ message: "Unauthorized - admin only" });
    }
  } catch (error) {
    console.log("error in adminRoute middleware:", error.message);
    res.status(500).json({ message: "Unable to authenticate user" });
  }
};
