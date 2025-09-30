const express = require("express");
const authRouter = express.Router();

const { validateSignUpData } = require("../utils/validation");
const User = require("../models/user");
const bcrypt = require("bcrypt");

// Cookie configuration helper
const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProduction, // true in production (HTTPS required)
    sameSite: isProduction ? 'none' : 'lax', // 'none' for cross-origin in production
    maxAge: 8 * 3600000, // 8 hours
  };
};

authRouter.post("/signup", async (req, res) => {
  try {
    // Validation of data
    validateSignUpData(req);

    const { firstName, lastName, emailId, password } = req.body;

    // Encrypt the password
    const passwordHash = await bcrypt.hash(password, 10);

    // Creating a new instance of the User model
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
    });

    const savedUser = await user.save();
    const token = await savedUser.getJWT();

    res.cookie("token", token, getCookieOptions());

    res.json({ message: "User Added successfully!", data: savedUser });
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    const user = await User.findOne({ emailId: emailId });
    if (!user) {
      throw new Error("Invalid credentials");
    }
    const isPasswordValid = await user.validatePassword(password);

    if (isPasswordValid) {
      const token = await user.getJWT();

      res.cookie("token", token, getCookieOptions());
      res.send(user);
    } else {
      throw new Error("Invalid credentials");
    }
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
});

authRouter.post("/logout", async (req, res) => {
  res.clearCookie("token", getCookieOptions());
  res.send("Logout Successful!!");
});

// Debug endpoint to check cookie and environment configuration
authRouter.get("/auth/debug", (req, res) => {
  const hasToken = !!req.cookies.token;
  const isProduction = process.env.NODE_ENV === 'production';
  
  res.json({
    environment: process.env.NODE_ENV || 'not set',
    isProduction,
    cookieSettings: getCookieOptions(),
    hasToken,
    timestamp: new Date().toISOString()
  });
});

module.exports = authRouter;