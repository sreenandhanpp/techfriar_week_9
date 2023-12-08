// socket.js
const socketIo = require("socket.io");
const userHelper = require("../helpers/userHelper");
const dotenv = require("dotenv");
dotenv.config();

// Helper function to get online users
const getOnlineUsers = (connectedUsers) => {
  return Array.from(connectedUsers.keys());
};

const setupSocket = (server) => {
  const io = socketIo(server, {
    cors: {
      origin: process.env.ORIGIN_URL,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Maintain a map of connected users and their socket IDs
  const connectedUsers = new Map();

  io.on("connection", async (socket) => {
    // Access the user ID from the query parameter
    const userId = socket.handshake.query.userId;

    // Add the user to the connectedUsers map
    connectedUsers.set(userId, socket.id);

    await userHelper.updateUserStatus(userId, true);

    // Emit updated online users to all clients
    io.emit("onlineUsers", getOnlineUsers(connectedUsers));

    socket.on("updateUserStatus", async () => {
      await userHelper.updateUserStatus(userId, true);
      io.emit("onlineUsers", getOnlineUsers(connectedUsers));
    });

    // Add your Socket.IO event handling logic here
    // For example, handling messages
    socket.on("message", async (data) => {
      userHelper
        .saveMessage(data)
        .then((savedMessage) => {
          console.log("true");
          const senderSocketId = connectedUsers.get(data.senderId);
          const receiverSocketId = connectedUsers.get(data.receiverId);

          io.to(senderSocketId).emit("message", {
            ...savedMessage._doc,
            readStatus: false, // Sender's read status is always false
          });

          io.to(receiverSocketId).emit("message", {
            ...savedMessage._doc,
            readStatus: false, // Receiver's read status is initially false
          });
        })
        .catch((err) => {
          console.log("err");

          socket.emit("messageError");
        });
    });

    // Handle messageRead events
    socket.on("messageRead", async ({ receiverId }) => {
      try {
        const senderId = socket.handshake.query.userId;

        await userHelper.updateMsgStatus({
          senderId,
          receiverId,
        });

        const senderSocketId = connectedUsers.get(receiverId);
        io.to(senderSocketId).emit("messageReadConfirmation");
      } catch (error) {
        console.error("Error handling messageRead event:", error);
      }
    });

    socket.on("deleteMessage", async ({ messageId }) => {
      await userHelper.deleteMsg(messageId);
      // along with the deleted message's ID
      io.emit("messageDeleted", { messageId });
    });

    // Handle disconnection
    socket.on("disconnect", async () => {
      connectedUsers.delete(userId);
      await userHelper.updateUserStatus(userId, false);
      // Emit updated online users to all clients
      io.emit("onlineUsers", getOnlineUsers(connectedUsers));
    });
  });
};

module.exports = setupSocket;
