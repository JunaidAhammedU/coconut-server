const { default: mongoose } = require("mongoose");

const dbConnect = () => {
  try {
    const connect = mongoose.connect("mongodb://127.0.0.1:27017/COCONUT");
    console.log("DB connected Successfully");
  } catch (error) {
    console.log("DB not connected");
  }
};

module.exports = dbConnect;
