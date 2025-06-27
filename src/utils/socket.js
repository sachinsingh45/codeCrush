const socket = require("socket.io");
const crypto = require("crypto");
const { Chat } = require("../models/chat");
const ConnectionRequest = require("../models/connectionRequest");

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

  console.log('Socket.io server initialized with CORS origins:', io.engine.opts.cors.origin);

  io.on("connection", (socket) => {
    console.log('Client connected:', socket.id, 'from:', socket.handshake.headers.origin);
    
    socket.on("joinChat", ({ firstName, userId, targetUserId }) => {
      const roomId = getSecretRoomId(userId, targetUserId);
      console.log(firstName + " joined Room : " + roomId);
      socket.join(roomId);
    });

    socket.on(
      "sendMessage",
      async ({ firstName, lastName, userId, targetUserId, text }) => {
        // Save messages to the database
        try {
          const roomId = getSecretRoomId(userId, targetUserId);
          console.log(firstName + " " + text);

          // TODO: Check if userId & targetUserId are friends

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
          io.to(roomId).emit("messageReceived", { firstName, lastName, text });
        } catch (err) {
          console.log(err);
        }
      }
    );

    socket.on("disconnect", (reason) => {
      console.log('Client disconnected:', socket.id, 'Reason:', reason);
    });
    
    socket.on("error", (error) => {
      console.error('Socket error:', error);
    });
  });
};

module.exports = initializeSocket;