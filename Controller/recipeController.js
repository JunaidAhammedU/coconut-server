const { default: mongoose } = require("mongoose");
const RSDB = require("../Model/RecipeModel");
const UDB = require("../Model/UserModel");
//--------------------------------------------

// adding a recipe data to DB
const addRecipe = async (req, res) => {
  try {
    const {
      title,
      description,
      veg,
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

    const response = {};

    const newRecipe = new RSDB({
      title: title,
      description: description,
      recipeType: veg === "veg" ? "veg" : "nonveg",
      cookingTime: parseInt(time),
      category: cuisine,
      recipeImage: [imgUrl],
      Ingredients: ingredient,
      Nutritions: {
        calories: calories,
        protein: protein,
        carbohydrates: carbohydrates,
        fat: fat,
        calcium: calcium,
      },
      Instructions: instruction,
      userId: userId,
    });

    const savedRecipe = await newRecipe.save();
    if (savedRecipe) {
      response.status = true;
      response.message = "data saved";
      response.data = savedRecipe;
    } else {
      response.status = false;
      response.message = "Somthing whent wrong, try again";
      console.log(error);
    }
    return res.json(response);
  } catch (error) {
    console.error(error);
    res.json(error);
  }
};

//Get All Recipes
const getAllRecipes = async (req, res) => {
  try {
    const response = {};

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

    if (allRecipes) {
      response.status = true;
      response.data = allRecipes;
      response.message = "data fetch success";
    } else {
      response.status = false;
      response.message = "data fetch failed";
    }

    return res.json(response);
  } catch (error) {
    res.json(error);
  }
};

// get individual recipe data
const getRecipeData = async (req, res) => {
  try {
    const { id, userId } = req.params;
    const response = {};

    const recipeData = await RSDB.findById({ _id: id }).populate(
      "Comments.user",
      "_id UserName email"
    );

    const userData = await UDB.findById({ _id: userId })
      .select("_id UserName email followers following is_verified createdAt")
      .lean();

    if (recipeData && userData) {
      response.status = true;
      response.message = "data fetched succesfully";
      response.recipeData = recipeData;
      response.userData = {
        _id,
        UserName,
        email,
        followers,
        following,
        is_verified,
        createdAt,
      } = userData;
    } else {
      response.status = false;
      response.message = "Somthing whent wrong";
    }
    return res.json(response);
  } catch (error) {
    res.json(error);
  }
};

// add new Comments
const addNewComment = async (req, res) => {
  try {
    const { user, text, recipe } = req.body;
    const response = {};

    if (user && text) {
      const updatedRecipe = await RSDB.findByIdAndUpdate(
        recipe,
        { $push: { Comments: { user, text } } },
        { new: true }
      );
      if (updatedRecipe) {
        response.status = true;
        response.message = "Comment added";
      } else {
        response.status = false;
        response.message = "Commentn not added";
      }
    } else {
      response.status = false;
      response.message = "somthing went wrong";
    }

    return res.json(response);
  } catch (error) {
    res.json(error);
  }
};

// get all search sort filter recipe
const getAllSeachRecipeData = async (req, res) => {
  try {
    const page = parseInt(req.query.page) - 1 || 0;
    const limit = parseInt(req.query.limit) || 5;
    const search = req.query.search || "";
    const sort = req.query.sort || "category";
    let recType = req.query.recipeType || "All";

    let recipeQuery = RSDB.find({
      title: { $regex: search, $options: "i" },
    });

    if (recType !== "All") {
      recType = recType.split(",");
      recipeQuery = recipeQuery.where("recipeType").in(recType);
    }

    const allRecipeData = await recipeQuery
      .sort(sort)
      .skip(page * limit)
      .limit(limit);

    const total = await RSDB.countDocuments({
      recipeType: { $in: recType !== "All" ? recType : ["veg", "nonveg"] },
      title: { $regex: search, $options: "i" },
    });

    const response = {
      status: true,
      total,
      page: page + 1,
      limit,
      recType,
      allRecipeData,
    };

    return res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  addRecipe,
  getAllRecipes,
  getRecipeData,
  addNewComment,
  getAllSeachRecipeData,
};
