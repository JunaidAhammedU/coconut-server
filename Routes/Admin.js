const express = require('express');
const AdminRoutes = express.Router();
const adminController = require('../Controller/AdminController');
//------------------------------------------------------------------


AdminRoutes.post('/login', adminController.dologin);

module.exports = AdminRoutes;