import Chat from "../models/Chat.js";
import User from "../models/User.js";

export const startChat = async (req, res) => {
  try {
    const { title, description, receiverId } = req.body;
    const createdBy = req.session.user;

    // Check if the receiver user exists
    const receiverUser = await User.findById(receiverId);
    if (!receiverUser) {
      return res.status(404).json({ error: "Receiver user not found" });
    }

    // Check if a chat already exists between the users
    const existingChat = await Chat.findOne({
      users: { $all: [createdBy, receiverUser._id] },
    });

    if (existingChat) {
      if (existingChat.closed) {
        return res.status(403).json({ error: "Chat is closed by admin" });
      } else {
        return res.status(200).json({
          success: true,
          message: "Chat already started",
          chat: existingChat,
        });
      }
    }

    // Create a new chat
    const newChat = new Chat({
      title,
      description,
      users: [createdBy, receiverUser._id],
      createdBy,
    });

    // Save the chat to the database
    await newChat.save();

    res.status(201).json({
      success: true,
      message: "Chat started successfully",
      chat: newChat,
    });
  } catch (error) {
    console.error("Error starting chat:", error);
    res.status(500).json({ error: "Chat start failed" });
  }
};

// export const closeChat = async (req, res) => {
//   try {
//     const { chatId } = req.params;
//     const userId = req.session.user;

//     // Check if the chat exists
//     const chat = await Chat.findById(chatId);
//     if (!chat) {
//       return res.status(404).json({ error: "Chat not found" });
//     }

//     // Check if the user is a participant in the chat
//     if (!chat.users.includes(userId)) {
//       return res.status(403).json({ error: "Unauthorized" });
//     }

//     // Close the chat
//     chat.closed = true;
//     await chat.save();

//     res.status(200).json({ message: "Chat closed successfully" });
//   } catch (error) {
//     console.error("Error closing chat:", error);
//     res.status(500).json({ error: "Chat close failed" });
//   }
// };

export const closeChat = async (req, res) => {
  try {
    const { chatId } = req.params;

    // Check if the chat exists
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    // Close the chat
    chat.closed = true;
    await chat.save();

    res.status(200).json({ message: "Chat closed successfully" });
  } catch (error) {
    console.error("Error closing chat:", error);
    res.status(500).json({ error: "Chat close failed" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content, image } = req.body;
    const userId = req.session.user;

    // Check if the chat exists
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    // Check if the chat is closed
    if (chat.closed) {
      return res.status(403).json({ error: "Chat is closed by admin" });
    }

    // Check if the user is a participant in the chat
    if (!chat.users.includes(userId)) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Create a new message
    const newMessage = {
      user: userId,
      content,
      image,
    };

    // Add the message to the chat's messages array
    chat.messages.push(newMessage);
    await chat.save();

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      chat: chat,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Message sending failed" });
  }
};
