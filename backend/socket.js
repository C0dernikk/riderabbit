import { Server } from "socket.io";
import Message from "./models/messageModel.js";

let io;

// Map to keep track of connected users: { userId: socketId }
const userSocketMap = new Map();

export const initSocket = (server, allowedOrigins) => {
  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("A user connected to Socket:", socket.id);

    socket.on("register", (userId) => {
      if (userId) {
        userSocketMap.set(userId, socket.id);
      }
    });

    socket.on("sendMessage", async (data) => {
      try {
        const { bookingId, senderId, receiverId, text } = data;

        if (!bookingId || !senderId || !receiverId || !text) return;

        const newMessage = new Message({
          bookingId,
          senderId,
          receiverId,
          text,
        });
        
        await newMessage.save();

        const receiverSocketId = userSocketMap.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("receiveMessage", newMessage);
        }

        const senderSocketId = userSocketMap.get(senderId);
        if (senderSocketId && senderSocketId !== socket.id) {
          io.to(senderSocketId).emit("receiveMessage", newMessage);
        } else {
          socket.emit("receiveMessage", newMessage);
        }

      } catch (error) {
        console.error("Socket Send Message Error:", error);
      }
    });

    socket.on("disconnect", () => {
      for (const [userId, socketId] of userSocketMap.entries()) {
        if (socketId === socket.id) {
          userSocketMap.delete(userId);
          break;
        }
      }
    });
  });

  return io;
};

export const getIo = () => {
  if (!io) {
    throw new Error("Socket.io is not initialized!");
  }
  return io;
};
