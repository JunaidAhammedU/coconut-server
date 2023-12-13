const express = require('express');
const UserRoutes = express.Router();
const userController  = require('../Controller/UserController');
const {verifyAuth} = require('../Middleware/Auth')
const recipeController = require('../Controller/recipeController')
const chatController = require("../Controller/chatController");
//----------------------------------------------------------------

// all get methods
UserRoutes.get('/getallrecipes',verifyAuth,recipeController.getAllRecipes)
UserRoutes.get('/getuserdata/:id',verifyAuth,userController.getUserData)
UserRoutes.get('/getrecipedata/:id/:userId',recipeController.getRecipeData)
UserRoutes.get('/followStatus/:loggedInUserId/:viewedUserId',verifyAuth,userController.getFollowStatus);
UserRoutes.get('/getallfollowers/:userId',verifyAuth,userController.getAllFollowers)
UserRoutes.get('/getrecipesearch', recipeController.getAllSeachRecipeData);
UserRoutes.get('/getAllCollections',verifyAuth,recipeController.getAllCollections)
UserRoutes.get('/getAllCategoryRecipe',verifyAuth,recipeController.getCategoryRecipe)
UserRoutes.post('/editProfile', verifyAuth,userController.userProfileEdit);

// all post and patch methods
UserRoutes.post('/',userController.authentication);
UserRoutes.post('/register',userController.register);
UserRoutes.post('/login',userController.doLogin);
UserRoutes.post('/otp-verify', userController.OtpRegister);
UserRoutes.post('/addrecipe',verifyAuth,recipeController.addRecipe);
UserRoutes.post('/addfollow/:id',verifyAuth,userController.followUser);
UserRoutes.post('/addunfollow/:id',verifyAuth,userController.unFollowUser);
UserRoutes.post("/addcomment",verifyAuth,recipeController.addNewComment)
UserRoutes.post('/addSavedRecipe',verifyAuth,recipeController.addSavedRecipe)

UserRoutes.patch('/removeRecipeCollection',verifyAuth,recipeController.doRecipeRemove)

//---
UserRoutes.post("/createChat",verifyAuth,chatController.accessChat);
UserRoutes.post("/sendNewMessage",chatController.sendMessage);
//---



module.exports = UserRoutes;