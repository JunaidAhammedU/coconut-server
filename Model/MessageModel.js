const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
    {
      text: {
        type: String,
        trim: true,
        required: true,
      },
      senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      chatId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat",
      },
      time: {
        type: String,
      }
    },
    {
      timestamps: true,
    }
  );
  

module.exports = mongoose.model("Message", messageSchema);
