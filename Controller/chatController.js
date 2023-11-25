const CHAT_DB = require("../Model/ChatModel");
const MSSG_DB = require("../Model/MessageModel");
//-----------------------------------------------

const chat = async (req, res) => {
  try {
    const { loggedUserId, userId } = req.params;
    const user1 = loggedUserId;
    const user2 = userId;
    const response = {};

    if (user1 && user2) {
      const chatData = await CHAT_DB.find({
        $or: [
          { $and: [{ user1: user1 }, { user2: user2 }] },
          { $and: [{ user1: user2 }, { user2: user1 }] },
        ],
      });

      if (chatData.length === 0) {
        const newRoom = new CHAT_DB({
          user1: user1,
          user2: user2,
        });

        const savedRoom = await newRoom.save();

        response.status = true;
        response.chatData = savedRoom;
      } else {
        response.status = true;
        response.chatData = chatData;
      }
    } else {
      response.status = false;
      response.message = "Invalid user IDs provided.";
    }

    return res.status(200).json(response);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: "Server Error" });
  }
};

// new Message
const newMessage = async (message) => {
  try {
    const { text, senderId, chatId, time } = message;

    const newMessage = new MSSG_DB({
      text,
      senderId,
      chatId,
      time,
    });

    const savedMessage = await newMessage.save();

    if (savedMessage) {
      response.status = true;
    } else {
      response.status = false;
    }
    return response;
  } catch (error) {
    return error;
  }
};

// fetch all chats
const getChatHistory = async (req, res) => {
  try {
    const { user1, user2 } = req.params;

    const chatHistory = await CHAT_DB.findOne({
      $or: [
        { $and: [{ user1 }, { user2 }] },
        { $and: [{ user1: user2 }, { user2: user1 }] },
      ],
    }).populate("messages.user");

    if (!chatHistory) {
      return res.status(404).json({ message: "Chat history not found" });
    }

    res.status(200).json(chatHistory);
  } catch (error) {
    res.status(500).json({ message: "Error fetching chat history" });
  }
};

module.exports = {
  chat,
  getChatHistory,
  newMessage,
};
