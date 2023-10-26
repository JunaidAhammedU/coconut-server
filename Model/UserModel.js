const mongoose = require("mongoose");

var userSchema = new mongoose.Schema({
    
  name: {
    type: String,
    required: true,
  },
  phone:{
    type: String,
    required:true
  },
  email: {
    type: String,   
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  is_admin: {
    type: Boolean,
    required: true,
    default: false,
  },
  is_verified: {
    type: Boolean,
    default: false,
  },
  is_blocked: {
    type: Boolean,
    required: true,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model("User", userSchema);
