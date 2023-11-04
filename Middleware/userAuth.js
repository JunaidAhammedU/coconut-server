const UDB = require("../Model/UserModel");
//--------------------------------------------

// Middleware if user is loging or checking is user blocked!
const isLogin = async (req, res, next) => {
  try {
    const token = req.headers["authorization"];
    console.log(token);
  } catch (error) {}
};

module.exports = {
  isLogin,
};
