const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const adminRouter = require("./Routes/Admin");
const userRouter = require("./Routes/User");
const dbConnect = require("./Config/dbConnection");
const { Server } = require("socket.io");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const multer = require("multer");
//-------------------------------------------------------

// Database Connections
dbConnect();

// Server Configurations
const server = app.listen(process.env.PORT, () =>
  console.log("server started")
);

// Multer configuration with increased field size limits
const upload = multer({
  limits: {
    fieldNameSize: 100,
    fieldSize: 1024 * 1024 * 10,
    fileSize: 1024 * 1024 * 5,
  },
});

// Middleware
app.use(cors({
  origin: 'https://coconut-client.vercel.app',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(upload.any());

//Socket io
const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: process.env.origin,
    methods: ["GET", "POST"],
  },
});

// socken connection logic
io.on("connection", (socket) => {
  socket.on("setup", (userId) => {
    console.log("connected");
    socket.join(userId);
    socket.emit("connected");
  });

  // creating a room of socket io
  socket.on("join_room", (room) => {
    socket.join(room);
    console.log("Room joined:", room);
  });

  // sending new messsage through socket io
  socket.on("new message", async (data) => {
    const { chatId } = data;
    if (data && chatId) {
      console.log(data);
      socket.to(chatId).emit("message recieved", data);
    } else {
      console.log("Something went wrong!");
    }
  });

  // handling disconnect function
  socket.on("disconnect", () => {
    console.log("Disconnected:", socket.id);
  });
});

app.use("/", userRouter);
app.use("/admin", adminRouter);
