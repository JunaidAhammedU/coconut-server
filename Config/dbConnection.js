const { default: mongoose } = require("mongoose");

const dbConnect = async () => {  
  try {
    const connect = await mongoose.connect("mongodb://127.0.0.1:27017/COCONUT");
    console.log("DB connected Successfully");
  } catch (error) {
    console.log("DB not connected", error);
  }
};

module.exports = dbConnect;
