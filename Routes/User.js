const express = require('express');
const UserRoutes = express.Router();
const userController  = require('../Controller/UserController');
const userAuth = require('../Middleware/userAuth')
//--------------------------------------------------------------


UserRoutes.post('/',userController.authentication);
UserRoutes.post('/register',userController.register);
UserRoutes.post('/login',userController.doLogin);
UserRoutes.post('/otp-verify', userController.OtpRegister);

module.exports = UserRoutes;