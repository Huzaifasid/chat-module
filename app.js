import dotenv from "dotenv";
dotenv.config({ path: "./config.env" });
import express from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import "./db/connect.js";
import authRoutes from "./routes/authRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import { errorHandler } from "./middleware/error.js";
import { chatSocket } from "./sockets/chatSocket.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    store: MongoStore.create({
      mongoUrl: process.env.DATABASE,
      stringify: false,
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 14 * 24 * 60 * 60 * 1000,
    },
  })
);

app.use(cors());
app.use("/auth", authRoutes);
app.use("/chat", chatRoutes);

// Socket.IO integration
io.use((socket, next) => {
  sessionMiddleware(socket.request, socket.request.res, next);
});

chatSocket(io);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
