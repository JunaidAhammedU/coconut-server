const mongoose = require("mongoose");

var categorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
      default: true,
    },
    status: {
      type: Boolean,
      default: true,
    },
    image: {
      type: String,
      required: true,
    },
    recipes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Recipe",
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Category", categorySchema);
