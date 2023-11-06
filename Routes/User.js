const express = require('express');
const UserRoutes = express.Router();
const userController  = require('../Controller/UserController');
const userAuth = require('../Middleware/userAuth')
const upload = require('../Middleware/Multer')
const recipeController = require('../Controller/recipeController')
//--------------------------------------------------------------

UserRoutes.post('/',userController.authentication);
UserRoutes.post('/register',userController.register);
UserRoutes.post('/login',userController.doLogin);
UserRoutes.post('/otp-verify', userController.OtpRegister);
UserRoutes.post('/addrecipe', upload.single('image'), recipeController.addRecipe);

UserRoutes.get('/getallrecipes',recipeController.getAllRecipes)



module.exports = UserRoutes;