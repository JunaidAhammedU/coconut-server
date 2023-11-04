const express = require("express");
const AdminRoutes = express.Router();
const adminController = require("../Controller/AdminController");
//------------------------------------------------------------------

AdminRoutes.post("/login", adminController.dologin);
AdminRoutes.post("/blockuser/:id", adminController.doBlockUser);

AdminRoutes.get("/getuser", adminController.getUserData);

module.exports = AdminRoutes;
