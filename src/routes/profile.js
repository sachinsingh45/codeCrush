const express = require("express");
const profileRouter = express.Router();
const bcrypt = require("bcrypt");
const { userAuth } = require("../middlewares/auth");
const { validateEditProfileData } = require("../utils/validation");

profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const user = req.user;

    res.send(user);
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    if (!validateEditProfileData(req)) {
      throw new Error("Invalid Edit Request");
    }

    const loggedInUser = req.user;

    Object.keys(req.body).forEach((key) => (loggedInUser[key] = req.body[key]));

    await loggedInUser.save();

    res.json({
      message: `${loggedInUser.firstName}, your profile updated successfuly`,
      data: loggedInUser,
    });
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
});
profileRouter.patch("/profile/password", userAuth, async (req, res) => {
    try {
      const { oldPassword, newPassword } = req.body;
  
      if (!oldPassword || !newPassword) {
        throw new Error("Both oldPassword and newPassword are required");
      }
  
      const user = req.user;
  
      // Validate the old password
      const isMatch = await user.validatePassword(oldPassword); 
      if (!isMatch) {
        throw new Error("Old password is incorrect");
      }
  
      const passwordHash = await bcrypt.hash(newPassword, 10);
      user.password = passwordHash;
  
      // Save the user
      await user.save();
  
      res.json({
        message: "Password changed successfully",
      });
    } catch (err) {
      res.status(400).send("ERROR : " + err.message);
    }
});
module.exports = profileRouter;