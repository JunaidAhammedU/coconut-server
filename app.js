const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const adminRouter = require("./Routes/Admin");
const userRouter = require("./Routes/User");
const dbConnect = require("./Config/dbConnection");
const { newMessage } = require("./Controller/chatController");
const { Server } = require("socket.io");
const cookieParser = require("cookie-parser");
require("dotenv").config();
//-------------------------------------------------------

// Database Connections
dbConnect();

// Server Configurations
const server = app.listen(process.env.PORT, () =>
  console.log("server started")
);

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: [process.env.origin],
    methods: ["GET", "POST"],
    credentials: true,
  })
);

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
  // creating a room of socket io
  socket.on("join_room", (room) => {
    socket.join(room);
    console.log("Room joined:", room);
  });

  // sending new messsage through socket io
  socket.on("send_message", (data) => {
    const { chatId } = data;
    if (data) {
      socket.to(chatId).emit("receive_message", data);
      newMessage(data);
    } else {
      console.log("Something went wrong!");
    }
  });

  // handling disconnect function
  socket.on("disconnect", () => {
    // Clean up logic if necessary
  });
});

app.use("/", userRouter);
app.use("/admin", adminRouter);
