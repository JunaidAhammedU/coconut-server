const { default: mongoose } = require("mongoose");

const dbConnect = async () => {
  try {
    const connect = await mongoose.connect("mongodb+srv://junaidahammed15:ilKZTtrlZT68Bpzu@cluster0.7vkcbji.mongodb.net/?retryWrites=true&w=majority");
    console.log("DB connected Successfully");
  } catch (error) {
    console.log("DB not connected", error);
  }
};

module.exports = dbConnect;
