const express = require("express");
const userRouter = express.Router();

const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");
const { getConnectionStatus } = require('../utils/connectionStatus');

const USER_SAFE_DATA = "firstName lastName photoUrl age gender about skills linkedin github";

// Get all the pending connection request for the loggedIn user
userRouter.get("/user/requests/received", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequests = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: "pending",
    }).populate("fromUserId", USER_SAFE_DATA);

    res.json({
      message: "Data fetched successfully",
      data: connectionRequests,
    });
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequests = await ConnectionRequest.find({
      $or: [
        { toUserId: loggedInUser._id, status: "connected" },
        { fromUserId: loggedInUser._id, status: "connected" },
      ],
    })
      .populate("fromUserId", USER_SAFE_DATA)
      .populate("toUserId", USER_SAFE_DATA);

    const data = connectionRequests.map((row) => {
      if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
        return row.toUserId;
      }
      return row.fromUserId;
    });

    res.json({ data });
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

userRouter.get("/feed", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    limit = limit > 50 ? 50 : limit;
    const skip = (page - 1) * limit;

    // Only exclude users with 'pending' or 'connected' requests in either direction
    const connectionRequests = await ConnectionRequest.find({
      $or: [
        { fromUserId: loggedInUser._id },
        { toUserId: loggedInUser._id }
      ],
      status: { $in: ["pending", "connected"] }
    }).select("fromUserId toUserId");

    const hideUsersFromFeed = new Set();
    connectionRequests.forEach((req) => {
      hideUsersFromFeed.add(req.fromUserId.toString());
      hideUsersFromFeed.add(req.toUserId.toString());
    });

    // Always hide the logged-in user
    hideUsersFromFeed.add(loggedInUser._id.toString());

    const users = await User.find({
      _id: { $nin: Array.from(hideUsersFromFeed) }
    })
      .select(USER_SAFE_DATA)
      .skip(skip)
      .limit(limit);

    res.json({ data: users });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get public user details by ID
userRouter.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(USER_SAFE_DATA);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ data: user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Endpoint to get relationship status between logged-in user and another user
userRouter.get("/user/relationship/:otherUserId", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user._id;
    const otherUserId = req.params.otherUserId;
    const status = await getConnectionStatus(loggedInUser, otherUserId);
    res.json({ status });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = userRouter;