const mongoose = require("mongoose");

const savedRecipeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  recipe: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recipe",
    },
  ],
});

module.exports = mongoose.model("savedRecipe", savedRecipeSchema);
