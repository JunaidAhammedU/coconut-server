const UDB = require('../Model/UserModel');
const UserVerification = require('../Model/UserVerification');
const bcrypt = require('bcrypt');
const otpRegister = require('../Helpers/otpGenafrate');
const jwt = require('jsonwebtoken');
require('dotenv').config();
//------------------------------------------------------------


// cheking autentication user logged in or Logged Out!
const authentication = (req, res, next) => {
    try {
        const { token } = req.body;
        const response = token ? JSON.parse(token) : null;
        if (response) {
            const auth = jwt.verify(response.token, process.env.jwt_key);
            const timeStamp = Math.floor(Date.now() / 1000);
            if (auth.exp < timeStamp) {
                res.status(500).json({ status: -1 })
            } else {
                res.status(500).json({ status: 1 })
            }
        } else {
            res.status(500).json({ status: 0 })
        }
    } catch (error) {
        {
            res.status(500).json({ status: 0 })
        }
        console.log(error);
    }
}

// User Registration 
const register = async (req, res) => {
    try {
        const userData = req.body;
        const userMail = userData.email;
        const result = await UDB.find({ email: userMail });
        if (result.length) {
            res.json({ exist: true, created: false })
        } else {
            console.log("account created");
            userData.password = await bcrypt.hash(userData.password, 10);
            await UDB.insertMany([userData]);
            await otpRegister.registerOtp(userMail);
            res.status(201).json({ exist: false, created: true });
        }
    } catch (error) {
        res.json(error)
    }
}

//Otp verfication
const OtpRegister = async (req, res, next) => {
    try {
        const otpData = req.body;
        const OTP = otpData.otp;
        const sendedOTP = await UserVerification.findOne({ otp: OTP });
        if (sendedOTP) {
            res.json({ verified: true });
        } else {
            res.json({ verified: false });
        }
    } catch (error) {
        res.json(error);
        console.log(error);
    }
}


// User Login.
const doLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const getUser = await UDB.findOne({ email: email });
        if (!getUser) {
            res.status(401).json({ exist: false })
        } else {
            const is_true = await bcrypt.compare(password, getUser.password);
            if (!is_true) {
                res.status(401).json({ exist: false, response: "Invalid Username or Password!" })
            } else {
                const maxAge = 60 * 60 * 24 * 3;
                const token = jwt.sign({ sub: getUser._id }, process.env.jwt_key, { expiresIn: maxAge * 1000 });
                await UDB.updateOne({ _id: getUser._id }, { $set: { is_verified: true } });
                console.log("login success!!!");
                return res.status(201).json({ exist: true, loggedIn: true, token, getUser });
            }
        }
    } catch (error) {
        res.status(500).json({ error: true });
        console.log(error.message);
    }
}



module.exports = {
    authentication,
    register,
    OtpRegister,
    doLogin
}