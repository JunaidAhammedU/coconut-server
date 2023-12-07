const CHAT_DB = require("../Model/ChatModel");
const MSSG_DB = require("../Model/MessageModel");
const UDB = require("../Model/UserModel");
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
        // const
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
    const pushToChat = await CHAT_DB.findByIdAndUpdate(chatId, {
      $push: { messages: savedMessage._id },
    });

    if (savedMessage && pushToChat) {
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
    const { room } = req.query;
    const response = {};
    const chatHistory = await CHAT_DB.findOne({ _id: room }).populate(
      "messages"
    );
    if (chatHistory) {
      response.status = true;
      response.message = "All chat fetched";
      response.data = chatHistory.messages;
    } else {
      response.status = false;
      response.message = "No previous chats.";
    }

    return res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: "Error fetching chat history" });
  }
};
//==============================================================================================================================================
//==============================================================================================================================================
//==============================================================================================================================================
//==============================================================================================================================================

// const getAllfollowers = async (req, res) => {
//   try {
//     const keyword = req.query.search
//       ? {
//           $or: [
//             { UserName: { $regex: req.query.search, $options: "i" } },
//             { email: { $regex: req.query.search, $options: "i" } },
//           ],
//         }
//       : {};
//     const result = await UDB.find({ ...keyword, _id: { $ne: req.query.user } });

//     return res.status(200).json(result);
//   } catch (error) {
//     console.log(error);
//     res.status(500).send("An error occurred");
//   }
// };

const accessChat = async (req, res) => {
  try {
    const { userId } = req.body;
    const response = {};

    if (!userId) {
      console.log("User ID is missing");
      return res.status(400).send("Missing userId");
    }

    const isChat = await CHAT_DB.findOne({
      $and: [
        { users: { $elemMatch: { $eq: req.query.user } } },
        { users: { $elemMatch: { $eq: userId } } },
      ],
    })
      .populate("users", "-password")
      .populate("latestMessage")
      .populate("messages");

    if (!isChat) {
      const chatData = {
        chatName: "sender",
        users: [req.query.user, userId],
      };

      const createChat = await CHAT_DB.create(chatData);
      const fullChat = await CHAT_DB.findById(createChat._id).populate(
        "users",
        "-password"
      );
      response.data = fullChat;
    } else {
      response.data = isChat;
    }

    return res.status(200).json(response);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
};

// const fetchAllChats = async (req, res) => {
//   try {
//     CHAT_DB.find({ users: { $elemMatch: { $eq: req.query.user } } })
//       .populate("users", "-password")
//       .populate("latestMessage")
//       .sort({ updatedAt: -1 })
//       .then(async (result) => {
//         result = await UDB.populate(result, {
//           path: "latestMessage.sender",
//           select: "name email",
//         });
//         res.send(result);
//       });
//   } catch (error) {
//     console.log(error);
//   }
// };

// const allMessages = async (req, res) => {
//   try {
//     const messages = await MSSG_DB.find({ chat: req.params.chatId })
//       .populate("sender", "UserName email")
//       .populate("chatId");
//     return res.json(messages);
//   } catch (error) {
//     res.status(400);
//     throw new Error(error.message);
//   }
// };

// const sendMessage = async (req, res) => {
//   try {
//     const { senderId, text, chatId } = req.body;
//     const response = {};

//     if (!text || !chatId) {
//       response.status = false;
//       response.message = "Invalid data passed into request";
//     } else {
//       const newMessage = {
//         senderId: senderId,
//         text: text,
//         chatId: chatId,
//       };

//       const message = await MSSG_DB.create(newMessage);

//       await CHAT_DB.findByIdAndUpdate(chatId, {
//         latestMessage: message,
//         $push: { messages: message._id },
//       });

//       response.status = true;
//       response.message = "new message sended";
//     }

//     return res.status(200).json(response);
//   } catch (error) {
//     res.status(400);
//     throw new Error(error.message);
//   }
// };

// sendMessage function
const sendMessage = async (req, res) => {
  try {
    const { senderId, text, chatId } = req.body;

    if (!text || !chatId) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid data passed into request" });
    }

    // Check if the message already exists in the chat
    const existingMessage = await MSSG_DB.findOne({
      senderId,
      text,
      chatId,
    });

    if (existingMessage) {
      return res
        .status(200)
        .json({ status: true, message: "Message already exists" });
    }

    const newMessage = {
      senderId,
      text,
      chatId,
    };

    const message = await MSSG_DB.create(newMessage);

    await CHAT_DB.findByIdAndUpdate(chatId, {
      latestMessage: message,
      $push: { messages: message._id },
    });

    return res.status(200).json({ status: true, message: "New message sent" });
  } catch (error) {
    return res.status(400).json({ status: false, message: error.message });
  }
};

module.exports = {
  chat,
  getChatHistory,
  newMessage,
  accessChat,
  // fetchAllChats,
  // getAllfollowers,
  // allMessages,
  sendMessage,
};
