import express from "express";

import { checkAdminAuth } from "../middleware/checkAdminAuth.js";
import {
  closeChat,
  sendMessage,
  startChat,
} from "../controllers/chatContoller.js";
// import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Start a new chat
router.post("/startchat", startChat);

// Close a chat
router.post("/closechat/:chatId", checkAdminAuth, closeChat);

// Send a message in a chat
router.post("/messages/:chatId", sendMessage);

export default router;
