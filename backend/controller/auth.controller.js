import bcrypt from "bcryptjs";
import User from "../model/user.model.js";
import { generateToken } from "../utils/generateToken.js";
import { storeRefreshToken } from "../utils/storeRefreshToken.js";
import { setCookie } from "../utils/setCookie.js";
import jwt from "jsonwebtoken";
import { redis } from "../utils/redis.js";

export const signup = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
    const user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "passwords do not match" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    //generate access token and refresh token
    const { accessToken, refreshToken } = generateToken(newUser._id);
    //store refresh token in redis
    await storeRefreshToken(newUser._id, refreshToken);
    //set cookies
    setCookie(res, accessToken, refreshToken);

    res.status(200).json({
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    });
  } catch (error) {
    console.log("error in signup controller:", error.message);

    res.status(500).json({ message: "Unable to create user" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      //generate access token and refresh token
      const { accessToken, refreshToken } = generateToken(user._id);
      //store refresh token in redis
      await storeRefreshToken(user._id, refreshToken);
      //set cookies
      setCookie(res, accessToken, refreshToken);

      return res.status(200).json({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } else {
      return res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.log("error in login controller:", error.message);

    res.status(500).json({ message: "Unable to login" });
  }
};

export const logout = async (req, res) => {
  console.log("from logout");
  try {
    //delete refresh token from redis
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );
      await redis.del(`refresh_token: ${decoded.userId}`);
    }
    //clear cookies
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("error in logout controller:", error.message);
    res.status(500).json({ message: "Unable to logout" });
  }
};

//refresh the access token
export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token provided" });
    }
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const storedToken = await redis.get(`refresh_token: ${decoded.userId}`);

    if (storedToken !== refreshToken) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const { accessToken } = generateToken(decoded.userId);
    setCookie(res, accessToken);
    res.status(200).json({ message: "Token refreshed successfully" });
  } catch (error) {
    console.log("error in refreshToken controller:", error.message);
    res.status(500).json({ message: "Unable to refresh token" });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.log("error in getProfile controller:", error.message);

    res.status(500).json({ message: "Unable to get profile" });
  }
};
