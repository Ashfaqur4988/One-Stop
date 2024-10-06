export const setCookie = (res, accessToken, refreshToken) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true, // to prevent XSS attacks, cross site scripting
    secure: process.env.NODE_ENV !== "development", // cookie only works in https
    sameSite: "strict", // csrf prevention, cross site request forgery
    maxAge: 1000 * 60 * 15, // 15 minutes
  });

  if (refreshToken) {
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "strict",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });
  }
};
