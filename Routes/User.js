const express = require('express');
const UserRoutes = express.Router();
const userController  = require('../Controller/UserController');
const {verifyAuth} = require('../Middleware/Auth')
const upload = require('../Middleware/Multer')
const recipeController = require('../Controller/recipeController')
const chatController = require("../Controller/chatController");
//----------------------------------------------------------------




UserRoutes.get('/getallrecipes',recipeController.getAllRecipes)
UserRoutes.get('/getuserdata/:id',userController.getUserData)
UserRoutes.get('/getrecipedata/:id/:userId',recipeController.getRecipeData)
UserRoutes.get('/followStatus/:loggedInUserId/:viewedUserId', userController.getFollowStatus);
UserRoutes.get('/getallfollowers/:userId',verifyAuth,userController.getAllFollowers)
UserRoutes.get("/chathistory/:user1/:user2", verifyAuth, chatController.getChatHistory);
UserRoutes.get('/getrecipesearch', recipeController.getAllSeachRecipeData);


UserRoutes.post('/',userController.authentication);
UserRoutes.post('/register',userController.register);
UserRoutes.post('/login',userController.doLogin);
UserRoutes.post('/otp-verify', userController.OtpRegister);
UserRoutes.post('/addrecipe',verifyAuth,upload.single('image'), recipeController.addRecipe);
UserRoutes.post('/addfollow/:id',verifyAuth,userController.followUser);
UserRoutes.post('/addunfollow/:id',verifyAuth,userController.unFollowUser);
UserRoutes.post("/createChat/:loggedUserId/:userId",verifyAuth,chatController.chat);
UserRoutes.post("/addcomment",verifyAuth,recipeController.addNewComment)



module.exports = UserRoutes;