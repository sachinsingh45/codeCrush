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

const onlineUsers = new Map();

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
    // Track userId for this socket
    let currentUserId = null;

    // Emit the current list of online users to the newly connected client
    socket.emit("onlineUsers", Array.from(onlineUsers.keys()));

    // Handle userConnected event for global online status
    socket.on("userConnected", ({ userId }) => {
      if (userId) {
        currentUserId = userId;
        onlineUsers.set(userId, socket.id);
        io.emit("userOnline", { userId });
      }
    });

    socket.on("joinChat", async ({ firstName, userId, targetUserId }) => {
      const roomId = getSecretRoomId(userId, targetUserId);
      socket.join(roomId);
      currentUserId = userId;
      // Mark user as online
      onlineUsers.set(userId, socket.id);
      // Broadcast online status to all participants
      io.emit("userOnline", { userId });
    });

    socket.on(
      "sendMessage",
      async ({ firstName, lastName, userId, targetUserId, text }) => {
        try {
          const roomId = getSecretRoomId(userId, targetUserId);
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
            seenBy: [userId], // Only sender has seen it
          });
          await chat.save();
          const lastMsg = chat.messages[chat.messages.length - 1];
          io.to(roomId).emit("messageReceived", { firstName, lastName, text, updatedAt: lastMsg.createdAt });
          // Emit unseen count to target user
          emitUnseenCount(io, targetUserId);
        } catch (err) {
          console.log(err);
        }
      }
    );

    // Mark all messages as seen in a chat
    socket.on("markAsSeen", async ({ userId, targetUserId }) => {
      try {
        const chat = await Chat.findOne({ participants: { $all: [userId, targetUserId] } });
        if (chat) {
          let updated = false;
          chat.messages.forEach(msg => {
            if (!msg.seenBy.includes(userId)) {
              msg.seenBy.push(userId);
              updated = true;
            }
          });
          if (updated) await chat.save();
        }
        emitUnseenCount(io, userId);
      } catch (err) {
        console.log(err);
      }
    });

    socket.on("disconnect", (reason) => {
      if (currentUserId) {
        onlineUsers.delete(currentUserId);
        io.emit("userOffline", { userId: currentUserId });
      }
      console.log('Client disconnected:', socket.id, 'Reason:', reason);
    });
    
    socket.on("error", (error) => {
      console.error('Socket error:', error);
    });
  });
};

// Helper to emit unseen message count for all chats of a user
async function emitUnseenCount(io, userId) {
  const chats = await Chat.find({ participants: userId });
  const unseenCounts = {};
  chats.forEach(chat => {
    const otherId = chat.participants.find(id => id.toString() !== userId);
    const unseen = chat.messages.filter(msg => !msg.seenBy.includes(userId)).length;
    unseenCounts[otherId] = unseen;
  });
  io.to(onlineUsers.get(userId)).emit("unseenCounts", unseenCounts);
}

module.exports = initializeSocket;