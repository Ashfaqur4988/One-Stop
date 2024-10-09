import jwt from "jsonwebtoken";
import User from "../model/user.model.js";

export const protectedRoute = async (req, res, next) => {
  const accessToken = req.cookies.accessToken;

  try {
    if (!accessToken) {
      return res.status(401).send("No access token provided");
    }

    const decode = await jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET
    );
    const user = await User.findById(decode.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("error in protectedRoute middleware:", error.message);
    res.status(500).json({ message: "Unable to authenticate user" });
  }
};

export const adminRoute = async (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(401).json({ message: "Unauthorized - admin only" });
  }
};
