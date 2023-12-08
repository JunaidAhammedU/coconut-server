const UBD = require("../Model/UserModel");
const CATE_DB = require("../Model/CategoryModel");
const cloudinary = require("../utils/cloudinary");
//--------------------------------------------------

// admin login
const dologin = async (req, res) => {
  try {
    const adminData = req.body;
    const response = {};

    const regex = {
      email: /^([\w])([\w\W])+@([a-zA-Z0-9]){3,6}.([a-zA-Z0-9]){2,3}$/gm,
      password:
        /^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?[0-9])(?=.*?[!@#$%^&*().\\?]).{8,16}$/gm,
    };

    if (!regex.email.test(adminData.email)) {
      response.status = false;
      response.message = "Invalid Email address";
    } else if (!regex.password.test(adminData.password)) {
      response.status = false;
      response.message = "Create a strong Password";
    } else {
      let admin = await UBD.findOne({ email: adminData.email })
        .select("_id UserName email is_admin ")
        .lean();

      if (admin && admin.is_admin === true) {
        response.status = true;
        response.message = "Login Successful";
      } else {
        response.status = false;
        response.message = "Somting went wrong try again!";
      }
    }

    return res.status(200).json(response);
  } catch (error) {
    res.json(error);
  }
};

//get user data from database
const getUserData = async (req, res) => {
  try {
    const response = {};
    const userData = await UBD.aggregate([
      {
        $project: {
          _id: 1,
          UserName: 1,
          email: 1,
          createdAt: 1,
          is_blocked: 1,
          is_verified: 1,
        },
      },
    ]);
    if (!userData) {
      (response.status = false), (response.message = "Can't get the data");
    } else {
      (response.status = true), (response.data = userData);
    }

    if (response.status) {
      return res.status(200).json(response);
    } else {
      return res.json(response.message);
    }
  } catch (error) {
    console.log(error);
    res.json({ error: err.message });
  }
};

//block user
const doBlockUser = async (req, res) => {
  try {
    const response = {};
    const data = req.params.id;

    const userData = await UBD.findById({ _id: data });
    if (!userData) {
      response.status = false;
      response.message = "User is not available";
    } else {
      if (userData.is_blocked === false) {
        await UBD.findByIdAndUpdate(
          { _id: data },
          { $set: { is_blocked: true } }
        );
        response.blocked = true;
        response.status = true;
      } else {
        await UBD.findByIdAndUpdate(
          { _id: data },
          { $set: { is_blocked: false } }
        );
        response.unBlocked = true;
        response.status = true;
      }
    }

    if (response.status) {
      return res.status(200).json(response);
    } else {
      return res.json(response.message);
    }
  } catch (error) {
    return res.status(500).json({ message: "internal server error" });
  }
};

// add new Category
const addNewCatogory = async (req, res) => {
  try {
    const { title, bio, image } = req.body;
    const response = {};

    const imageUrl = await cloudinary.uploader.upload(image, {
      folder: "category_images",
    });

    if (!title) {
      response.status = false;
      response.message = "invalid title";
    } else if (!bio) {
      response.status = false;
      response.message = "invalid Bio";
    } else if (!imageUrl) {
      response.status = false;
      response.message = "add image";
    } else {
      const allReadyAvailableData = await CATE_DB.findOne({ title: title });
      if (allReadyAvailableData) {
        response.status = false;
        response.message = "This category already added";
      } else {
        const Catogory = new CATE_DB({
          title,
          bio,
          image: imageUrl.secure_url,
        });

        const newCategory = await Catogory.save();
        if (newCategory) {
          response.status = true;
          response.message = `${title} added to the catogory`;
        } else {
          response.status = false;
          response.message = "Category failed to add";
        }
      }
    }

    if (response.status) {
      return res.status(200).json(response);
    } else {
      return res.json(response);
    }
  } catch (error) {
    return res.status(500).json({ message: "internal server error" });
  }
};

// get all category data
const getAllCategory = async (req, res) => {
  try {
    const response = {};

    const allCategory = await CATE_DB.aggregate([
      {
        $project: {
          _id: 1,
          title: 1,
          bio: 1,
          status: 1,
          image: 1,
        },
      },
    ]);

    if (allCategory) {
      response.status = true;
      response.message = "data fetched successful";
      response.data = allCategory;
    } else {
      response.status = false;
      response.message = "data cant reach, Please close the window & tryAgain.";
    }

    if (response.status) {
      return res.status(200).json(response);
    } else {
      return res.json(response.message);
    }
  } catch (error) {
    return res.status(500).json({ message: "internal server error" });
  }
};

module.exports = {
  dologin,
  getUserData,
  doBlockUser,
  addNewCatogory,
  getAllCategory,
};
