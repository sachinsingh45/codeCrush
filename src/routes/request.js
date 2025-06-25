const express = require("express");
const requestRouter = express.Router();

const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");


requestRouter.post(
  "/request/send/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const toUserId = req.params.toUserId;
      const status = "pending";

      const toUser = await User.findById(toUserId);
      if (!toUser) {
        return res.status(404).json({ message: "User not found!" });
      }

      // Only block if there is a 'pending' or 'connected' request in either direction
      const existingConnectionRequest = await ConnectionRequest.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
        status: { $in: ["pending", "connected"] }
      });
      if (existingConnectionRequest) {
        return res
          .status(400)
          .send({ message: "Connection Request Already Exists!!" });
      }

      const connectionRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });

      const data = await connectionRequest.save();

      res.json({
        message: `You have sent a connection request to ${toUser.firstName}`,
        data,
      });
    } catch (err) {
      res.status(400).json({ message: err.message || 'Unknown error' });
    }
  }
);

// Accept or reject a request
requestRouter.post(
  "/request/review/:action/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const loggedInUser = req.user;
      const { action, requestId } = req.params;

      if (!['accept', 'reject'].includes(action)) {
        return res.status(400).json({ message: "Action not allowed!" });
      }

      const connectionRequest = await ConnectionRequest.findOne({
        _id: requestId,
        toUserId: loggedInUser._id,
        status: "pending",
      });
      if (!connectionRequest) {
        return res
          .status(404)
          .json({ message: "Connection request not found" });
      }

      if (action === 'accept') {
        connectionRequest.status = 'connected';
        const data = await connectionRequest.save();
        return res.json({ message: "Connection request accepted", data });
      } else if (action === 'reject') {
        await connectionRequest.deleteOne();
        return res.json({ message: "Connection request rejected and deleted" });
      }
    } catch (err) {
      res.status(400).json({ message: err.message || 'Unknown error' });
    }
  }
);

// Cancel a sent connection request (only if status is 'pending' and user is sender)
requestRouter.delete(
  "/request/cancel/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const toUserId = req.params.toUserId;
      const deleted = await ConnectionRequest.findOneAndDelete({
        fromUserId,
        toUserId,
        status: "pending"
      });
      if (!deleted) {
        return res.status(404).json({ message: "No pending request to cancel." });
      }
      res.json({ message: "Connection request canceled." });
    } catch (err) {
      res.status(400).json({ message: err.message || 'Unknown error' });
    }
  }
);

module.exports = requestRouter;