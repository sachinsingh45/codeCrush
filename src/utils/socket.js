const socket = require("socket.io");
const crypto = require("crypto");
const { Chat } = require("../models/chat");

const getSecretRoomId = (userId, targetUserId) => {
  return crypto
    .createHash("sha256")
    .update([userId, targetUserId].sort().join("$"))
    .digest("hex");
};

const initializeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: [
        "http://localhost:5173",
        "https://code-crush-frontend-psi.vercel.app", 
        "https://code-crush-frontend-git-main-sachin-singhs-projects-a8578191.vercel.app",
        "https://code-crush-frontend-i990ukqz7-sachin-singhs-projects-a8578191.vercel.app"
      ],
      credentials: true,
      methods: ["GET", "POST"]
    },
  });

  io.on("connection", (socket) => {
    socket.on("joinChat", ({ userId, targetUserId }) => {
      const roomId = getSecretRoomId(userId, targetUserId);
      socket.join(roomId);
    });

    socket.on("sendMessage", async ({ firstName, lastName, userId, targetUserId, text }) => {
      try {
        const roomId = getSecretRoomId(userId, targetUserId);
        
        // Ensure sender joins the room (for share-to-chat scenarios)
        socket.join(roomId);
        
        let chat = await Chat.findOne({
          participants: { $all: [userId, targetUserId] },
        });
        
        if (!chat) {
          chat = new Chat({
            participants: [userId, targetUserId],
            messages: [],
          });
        }
        
        chat.messages.push({
          senderId: userId,
          text,
        });
        
        await chat.save();
        const lastMsg = chat.messages[chat.messages.length - 1];
        
        io.to(roomId).emit("messageReceived", {
          firstName,
          lastName,
          text,
          createdAt: lastMsg.createdAt,
          updatedAt: lastMsg.updatedAt
        });
      } catch (err) {
        // Silent error handling for production
      }
    });

    socket.on("disconnect", (reason) => {
      // Client disconnected
    });
    
    socket.on("error", (error) => {
      // Socket error occurred
    });
  });
};

module.exports = initializeSocket;