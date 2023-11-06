const RSDB = require("../Model/RecipeModel");
//--------------------------------------------

const addRecipe = async (req, res) => {
  try {
    console.log(req.body);
    const {
      title,
      description,
      veg,
      nonveg,
      time,
      cuisine,
      ingredient,
      calories,
      protein,
      carbohydrates,
      fat,
      calcium,
      userId,
      instruction,
    } = req.body;

    const imgUrl = req.file.filename;

    if (!imgUrl) {
      res.json({ status: -1 });
    } else {
      const newRecipe = RSDB({
        title: title,
        description: description,
        recipeType: veg ? "veg" : nonveg ? "nonveg" : undefined,
        cookingTime: time,
        category: cuisine,
        recipeImage: imgUrl,
        Ingredients: Object.values(ingredient).filter(Boolean),
        Nutritions: {
          calories: calories,
          protein: protein,
          carbohydrates: carbohydrates,
          fat: fat,
          calcium: calcium,
        },
        Instructions: Object.values(instruction).filter(Boolean),
        userId: userId,
      });
      const savedRecipe = await newRecipe.save();
      if (savedRecipe) {
        res.json({ status: 1 });
      } else {
        res.json({ status: -2 });
      }
    }
  } catch (error) {
    console.error(error);
  }
};

//Get All Recipes
const getAllRecipes = async (req,res) => {
  try {
    const allRecipes = await RSDB.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "recipeDetails",
        },
      },
    ]);
    console.log(allRecipes);
    if (!allRecipes) {
      res.json({ status: false });
    } else {
      res.json({ status: true, allRecipes:allRecipes });
    }
  } catch (error) {
    console.error(error);
  }
};
module.exports = {
  addRecipe,
  getAllRecipes,
};
