const mongoose = require("mongoose");

const userVerificationSchema = new mongoose.Schema({
  otp: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

const UserVerification = mongoose.model(
  "UserVerification",
  userVerificationSchema
);

module.exports = UserVerification;
