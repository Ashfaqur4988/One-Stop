import jwt from "jsonwebtoken";

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
