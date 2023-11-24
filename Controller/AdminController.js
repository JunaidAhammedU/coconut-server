const UBD = require("../Model/UserModel");
//----------------------------------------

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
        response.status = true;
        response.message = "Somting went wrong try again!";
      }
    }
    return res.json(response);
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
    return res.json(response);
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
      (response.status = false), (response.message = "User is not available");
    } else {
      if (userData.is_blocked === false) {
        await UBD.findByIdAndUpdate(
          { _id: data },
          { $set: { is_blocked: true } }
        );
        response.blocked = true;
      } else {
        await UBD.findByIdAndUpdate(
          { _id: data },
          { $set: { is_blocked: false } }
        );
        response.unBlocked = true;
      }
    }
    return res.json(response);
  } catch (error) {
    res.json({ error: err.message });
  }
};

module.exports = { dologin, getUserData, doBlockUser };
