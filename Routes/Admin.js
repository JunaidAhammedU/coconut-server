const express = require("express");
const AdminRoutes = express.Router();
const adminController = require("../Controller/AdminController");
const upload = require("../Middleware/Multer");
//------------------------------------------------------------------

AdminRoutes.get("/getuser", adminController.getUserData);
AdminRoutes.get("/getAllCategories", adminController.getAllCategory)

AdminRoutes.post("/login", adminController.dologin);
AdminRoutes.post("/blockuser/:id", adminController.doBlockUser);
AdminRoutes.post("/addNewCategory",upload.single('image'),adminController.addNewCatogory);


module.exports = AdminRoutes;
