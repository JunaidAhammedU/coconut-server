const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  recipeType: {
    type: String,
    enum: ["veg", "nonveg"],
    required: true,
  },
  cookingTime: {
    type: Number,
    required: true,
  },
  category: {
    // type: mongoose.Schema.Types.ObjectId,
    type: String,
    ref: "Categories",
    required: true,
  },
  recipeImage: {
    type: [String],
    required: true,
  },
  Ingredients: [
    {
      type: String,
      required: true,
    },
  ],
  Nutritions: {
    calories: {
      type: String,
      required: true,
    },
    protein: {
      type: String,
      required: true,
    },
    carbohydrates: {
      type: String,
      required: true,
    },
    fat: {
      type: String,
      required: true,
    },
    calcium: {
      type: String,
      required: true,
    },
  },
  Instructions: [
    {
      type: String,
      required: true,
    },
  ],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  Comments: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
      text: {
        type: String,
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  status: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Export the model
module.exports = mongoose.model("Recipe", recipeSchema);
