const UDB = require("../Model/UserModel");
const RSDB = require("../Model/RecipeModel");
const UserVerification = require("../Model/UserVerification");
const bcrypt = require("bcrypt");
const otpRegister = require("../Helpers/otpGenafrate");
const jwt = require("jsonwebtoken");
const { response } = require("express");
require("dotenv").config();
const cloudinary = require("../utils/cloudinary");
//------------------------------------------------------------

// cheking autentication user logged in or Logged Out!
const authentication = (req, res, next) => {
  try {
    const { token } = req.body;
    const response = {};

    if (token) {
      const auth = jwt.verify(token, process.env.jwt_key);
      const timeStamp = Math.floor(Date.now() / 1000);

      if (auth.exp < timeStamp) {
        response.status = false;
        response.message = "Authentication faild";
      } else {
        response.status = true;
        response.message = "Authentication success";
      }
    } else {
      response.status = false;
      response.message = "Somthing went wrong!";
    }

    return res.status(200).json(response);
  } catch (error) {
    return res.json(error);
  }
};

// User Registration
const register = async (req, res) => {
  try {
    const { UserName, email } = req.body;
    const userData = req.body;

    const response = {};

    // validation checking.
    const name_reg = /^[A-Za-z_][a-zA-Z0-9_.]{3,15}$/gm;
    const email_reg = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/gm;
    const password_reg =
      /^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?[0-9])(?=.*?[!@#$%^&*().\\?]).{8,16}$/gm;

    if (!name_reg.test(UserName)) {
      response.status = false;
      response.message = "Invalid Username";
    } else if (!email_reg.test(email)) {
      response.status = false;
      response.message = "Invalid Email Address";
    } else if (!password_reg.test(req.body.password)) {
      response.status = false;
      response.message = "Create Strong Password";
    } else {
      const result = await UDB.find({ email: email });
      if (result.length) {
        response.status = false;
        response.message = "user already exist!, Try to register another email";
      } else {
        req.body.password = await bcrypt.hash(req.body.password, 10);
        await UDB.insertMany([userData]);
        await otpRegister.registerOtp(email);
        response.status = true;
        response.message = "Account Created";
      }
    }

    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.json(error);
  }
};

//Otp verfication
const OtpRegister = async (req, res, next) => {
  try {
    const otpData = req.body;
    const OTP = otpData.otp;
    const sendedOTP = await UserVerification.findOne({ otp: OTP });
    if (sendedOTP) {
      res.json({ verified: true });
      await UserVerification.deleteOne({ otp: OTP });
    } else {
      res.json({ verified: false });
    }
  } catch (error) {
    res.json(error);
    console.log(error);
  }
};

// User Login.
const doLogin = async (req, res) => {
  try {
    console.log("check");
    const { email, password } = req.body;
    const response = {};

    //cheking data is valid!
    const email_reg = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/gm;
    const password_reg =
      /^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?[0-9])(?=.*?[!@#$%^&*().\\?]).{8,16}$/gm;

    if (!email_reg.test(email)) {
      response.status = false;
      response.message = "invalid email address";
    } else if (!password_reg.test(password)) {
      response.status = false;
      response.message = "invalid password";
    } else {
      const getUser = await UDB.findOne({ email: email });

      if (!getUser) {
        response.status = false;
        response.message = "invalid email or password!, Try again";
      } else {
        const is_pass_true = await bcrypt.compare(password, getUser.password);
        if (!is_pass_true) {
          response.status = false;
          response.message = "Incorrect Password!";
        } else {
          const maxAge = 60 * 60 * 24 * 3;
          const token = jwt.sign({ sub: getUser._id }, process.env.jwt_key, {
            expiresIn: maxAge * 1000,
          });

          await UDB.updateOne(
            { _id: getUser._id },
            { $set: { is_verified: true } }
          );

          const {
            _id,
            UserName,
            email,
            followers,
            following,
            profile_image,
            is_admin,
            is_verified,
            is_blocked,
            createdAt,
          } = getUser;
          response.status = true;
          response.message = "Login Success";
          response.token = token;
          response.data = {
            _id,
            UserName,
            email,
            followers,
            following,
            profile_image,
            is_admin,
            is_verified,
            is_blocked,
            createdAt,
          };
        }
      }
    }

    return res.json(response);
  } catch (error) {
    res.status(500).json({ error: true });
    console.log(error);
  }
};

//get user data
const getUserData = async (req, res) => {
  try {
    const data = req.params.id;
    const response = {};

    if (data) {
      const userData = await UDB.findById({ _id: data })
        .select(
          "_id UserName email followers following profile_image is_verified createdAt "
        )
        .lean()
        .populate("followers following");

      const recipeData = await RSDB.aggregate([
        { $match: { userId: { $eq: userData._id } } },
      ]);

      if (userData && recipeData) {
        response.status = true;
        response.userDetails = {
          _id,
          UserName,
          email,
          followers,
          following,
          profile_image,
          is_verified,
          createdAt,
        } = userData;
        response.recipeData = recipeData;
      } else {
        response.status = false;
        response.message = "cant get the user data";
      }
    } else {
      response.status = false;
      response.message = "cant get the user data";
    }

    return res.json(response);
  } catch (error) {
    console.error(error);
  }
};

//handle follow user
const followUser = async (req, res) => {
  try {
    const { follower } = req.body;
    const followed = req.params.id;
    const response = {};

    if (!follower || !followed) {
      response.message = "Invalid request data";
    }

    const new_follower = await UDB.findByIdAndUpdate(
      followed,
      { $addToSet: { followers: follower } },
      { new: true }
    );

    const new_following = await UDB.findByIdAndUpdate(
      follower,
      { $addToSet: { following: followed } },
      { new: true }
    )
      .select("_id UserName followers following")
      .lean();

    if (new_follower && new_following) {
      response.status = true;
      response.data = { _id, UserName, followers, following } = new_following;
      response.message = "you are are successfully followed";
      response.newFollowing_id = followed;
    } else {
      response.status = false;
      response.message = "Not Unfollowed, Somthing went wrong!";
    }

    return res.json(response);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

//handle follow user
const unFollowUser = async (req, res) => {
  try {
    const { follower } = req.body;
    const followed = req.params.id;
    const response = {};

    if (!follower || !followed) {
      response.message = "Invalid request data";
    }

    const remv_follower = await UDB.findByIdAndUpdate(
      followed,
      { $pull: { followers: follower } },
      { new: true }
    );

    const remv_following = await UDB.findByIdAndUpdate(
      follower,
      { $pull: { following: followed } },
      { new: true }
    )
      .select("_id UserName followers following")
      .lean();

    if (remv_follower && remv_following) {
      response.status = true;
      response.data = { _id, UserName, followers, following } = remv_following;
      response.message = "you are are successfully unfollowed";
      response.unFollower_id = followed;
    } else {
      response.status = false;
      response.message = "Not Unfollowed, Somthing went wrong!";
    }

    return res.json(response);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// get follow status for follow unfollow module
const getFollowStatus = async (req, res) => {
  try {
    const { loggedInUserId, viewedUserId } = req.params;
    const response = {};

    const viewedUser = await UDB.findById(viewedUserId);

    if (!viewedUser) {
      response.status = false;
      response.message = "User not found";
    } else {
      response.isFollowing = viewedUser.followers.includes(loggedInUserId);
    }

    return res.json(response);
  } catch (error) {
    res.json(error);
    console.error("Error getting follow status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// get All followed user list
const getAllFollowers = async (req, res) => {
  try {
    const userId = req.params.userId;
    const response = {};

    if (userId) {
      const userData = await UDB.findById(userId).populate(
        "followers",
        "-password"
      );

      if (userData.followers.length > 0) {
        response.status = true;
        response.message = "data fetched";
        response.data = userData.followers;
      } else {
        response.status = false;
        response.message = "data fetching faild";
      }
    } else {
      response.status = false;
      response.message = "Somthing went wrong!";
    }

    return res.status(200).json(response);
  } catch (error) {
    res.json(error);
  }
};

// user profile edit
const userProfileEdit = async (req, res) => {
  try {
    const { UserName, email, profileImage } = req.body;
    const { userId } = req.query;
    const response = {};

    const profileUrl = await cloudinary.uploader.upload(profileImage, {
      folder: "Profile_images",
    });

    if (UserName && email && userId) {
      const updatedUserData = await UDB.findByIdAndUpdate(userId, {
        $set: { UserName, email, profile_image: profileUrl.secure_url },
      });
      if (updatedUserData) {
        response.status = true;
        response.message = "Profile updated";
        response.data = updatedUserData;
      } else {
        response.status = false;
        response.message = "Profile not updated!, Try again";
      }
    } else {
      response.status = false;
      response.message = "Somthing went wrong!, Try again";
    }

    return res.status(200).json(response);
  } catch (error) {
    return res.json(error);
  }
};

module.exports = {
  authentication,
  register,
  OtpRegister,
  doLogin,
  getUserData,
  followUser,
  unFollowUser,
  getFollowStatus,
  getAllFollowers,
  userProfileEdit,
};
