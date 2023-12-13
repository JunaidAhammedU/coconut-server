const nodemailer = require("nodemailer");
const UserVerification = require("../Model/UserVerification");
require("dotenv").config();
//-----------------------------------------------------------

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS,
  },
});

const registerOtp = async (email) => {
  try {    
    const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "coconut Signup OTP Verification",
      text: `Your OTP is ${otp}. Please enter this OTP to verify your account.`,
    };
    await transporter.sendMail(mailOptions);
    console.log(otp);
    console.log("Email sent to user");
    const verificationData = new UserVerification({
      otp,
      email,
    });
    await verificationData.save();
    return otp;
  } catch (error) {
    console.log(error);
  }
};

module.exports = { registerOtp };
