const { default: mongoose } = require("mongoose");
const RSDB = require("../Model/RecipeModel");
const UDB = require("../Model/UserModel");
const SavedRecipeDB = require("../Model/SavedRecipeModel");
const CATE_DB = require("../Model/CategoryModel");
const cloudinary = require("../utils/cloudinary");
//-----------------------------------------------------------

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
      image,
    } = req.body;

    const response = {};

    const imageUrl = await cloudinary.uploader.upload(image, {
      folder: "Image",
    });

    console.log(imageUrl);

    const newRecipe = new RSDB({
      title: title,
      description: description,
      recipeType: veg === "veg" ? "veg" : "nonveg",
      cookingTime: parseInt(time),
      category: cuisine,
      recipeImage: [imageUrl.secure_url],
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
      await CATE_DB.findByIdAndUpdate(
        cuisine,
        { $addToSet: { recipes: savedRecipe._id } },
        { new: true }
      );

      response.status = true;
      response.message = "data saved";
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

    const recipeData = await RSDB.findById({ _id: id })
      .populate("Comments.user", "-password")
      .populate("category");

    const userData = await UDB.findById({ _id: userId })
      .select("-password")
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

// add new recipe saved collection
const addSavedRecipe = async (req, res) => {
  try {
    const { recipeId, userId } = req.query;
    const response = {};

    if (recipeId && userId) {
      const savedCollection = await SavedRecipeDB.findOne({ userId });

      if (savedCollection) {
        const updatedCollection = await SavedRecipeDB.findOneAndUpdate(
          { userId },
          { $addToSet: { recipe: recipeId } },
          { new: true }
        );

        if (updatedCollection) {
          response.status = true;
          response.message = "Recipe added to the collection";
        } else {
          response.status = false;
          response.message = "Failed to add the recipe";
        }
      } else {
        const newCollection = await SavedRecipeDB.create({
          userId,
          recipe: [recipeId],
        });

        if (newCollection) {
          response.status = true;
          response.message = "New collection created with the recipe";
        } else {
          response.status = false;
          response.message = "Failed to create a new collection";
        }
      }
    } else {
      response.status = false;
      response.message = "Somthing went wrong, Try again later";
    }

    if (response.status) {
      return res.status(200).json(response);
    } else {
      return res.json({ message: response.message });
    }
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

// get al saved collections
const getAllCollections = async (req, res) => {
  try {
    const { userId } = req.query;
    const response = {};

    if (userId) {
      const collectionData = await SavedRecipeDB.findOne({ userId }).populate({
        path: "recipe",
        model: "Recipe",
        options: { sort: { createdAt: -1 } },
      });

      if (collectionData) {
        response.status = true;
        response.message = "Data fetched successfully";
        response.data = collectionData;
      } else {
        response.status = false;
        response.message = "Data fetch failed";
      }
    } else {
      response.status = false;
      response.message = "Something went wrong";
    }

    if (response.status) {
      return res.status(200).json(response);
    } else {
      return res.json(response.message);
    }
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

// get all category based recipe
const getCategoryRecipe = async (req, res) => {
  try {
    const { category } = req.query;
    const response = {};

    if (category) {
      const allCategoryData = await CATE_DB.findById({
        _id: category,
      }).populate("recipes");

      if (allCategoryData) {
        response.status = true;
        response.message = "Data fetched successfully";
        response.data = allCategoryData;
      } else {
        response.status = false;
        response.message = "This category available";
      }
    } else {
      response.status = false;
      response.message = "Somthing went wrong, Try again letter";
    }

    if (response.status) {
      return res.status(200).json(response);
    } else {
      return res.json(response.message);
    }
  } catch (error) {
    return res.status(500).json(error);
  }
};

module.exports = {
  addRecipe,
  getAllRecipes,
  getRecipeData,
  addNewComment,
  getAllSeachRecipeData,
  addSavedRecipe,
  getAllCollections,
  getCategoryRecipe,
};
