import Chat from "../models/Chat.js";

export const chatSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("New socket connection: " + socket.id);

    socket.on("chat:message", async (data) => {
      try {
        const { chatId, content } = data;
        const userId = socket.request.session.user; // Assuming user ID is stored in socket.request.session.user

        // Find the chat by ID
        const chat = await Chat.findById(chatId);
        if (!chat) {
          console.log("Chat not found");
          return;
        }

        // Add the new message to the chat's messages array
        chat.messages.push({
          user: userId,
          content,
        });

        // Save the updated chat to the database
        await chat.save();

        // Emit the new message to all connected sockets in the chat room
        io.to(chatId).emit("chat:message", {
          chatId,
          message: chat.messages[chat.messages.length - 1],
        });
      } catch (error) {
        console.error("Error sending chat message:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected: " + socket.id);
    });
  });
};
