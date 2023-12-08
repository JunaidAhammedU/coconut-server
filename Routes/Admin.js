const express = require("express");
const AdminRoutes = express.Router();
const adminController = require("../Controller/AdminController");
//------------------------------------------------------------------

AdminRoutes.get("/getuser", adminController.getUserData);
AdminRoutes.get("/getAllCategories", adminController.getAllCategory)

AdminRoutes.post("/login", adminController.dologin);
AdminRoutes.post("/blockuser/:id", adminController.doBlockUser);
AdminRoutes.post("/addNewCategory",adminController.addNewCatogory);


module.exports = AdminRoutes;
