const UDB = require("../Model/UserModel");
const jwt = require("jsonwebtoken");
require("dotenv").config();
//-----------------------------------------

// Middleware if user is loging or checking is user blocked!
const verifyAuth = async (req, res, next) => {
  try {
    const token = req.headers["authorization"];
    const response = {};
    if (token?.split(".")[1] == null) {
      response.status = false;
      response.message = "You are not Autherized";
    } else {
      const tokenPart = token.split(".")[1];
      if (!tokenPart) {
        response.status = false;
        response.message = "You are not Autherized";
        console.log("You are not Autherized");
      } else {
        next();
      }
    }
  } catch (error) {
    res.json(error);
  }
};

module.exports = {
  verifyAuth,
};
