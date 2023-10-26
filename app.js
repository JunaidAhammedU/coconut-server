const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const adminRouter = require('./Routes/Admin');
const userRouter = require('./Routes/User');
const dbConnect = require('./Config/dbConnection');
const cookieParser = require('cookie-parser');
require('dotenv').config();
//----------------------------------------------------


// Database Connections
dbConnect();

// Middleware
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({extended:true}));
app.use(cors({
    origin: [process.env.origin],
    methods: ["GET", "POST"],
    credentials: true
})) 

app.use('/',userRouter);
app.use('/admin',adminRouter);


// Server Configurations
app.listen(3001,()=> console.log("server started"));
