const UBD = require("../Model/UserModel");
//----------------------------------------

const dologin = async (req, res) => {
  try {
    const adminData = req.body;
    const regex = {
      email: /^([\w])([\w\W])+@([a-zA-Z0-9]){3,6}.([a-zA-Z0-9]){2,3}$/gm,
      password:
        /^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?[0-9])(?=.*?[!@#$%^&*().\\?]).{8,16}$/gm,
    };
    if (!regex.email.test(adminData.email)) {
      res.json({ status: -1 });
    } else if (!regex.password.test(adminData.password)) {
      res.json({ status: -1 });
    } else {
      let admin = await UBD.findOne({ email: adminData.email });
      if (admin && admin.is_admin === true) {
        res.status(200).json({ isAdmin: true, admin });
      } else {
        res.status(200).json({ isAdmin: false });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

//get user data from database
const getUserData = async (req, res) => {
  try {
    const userData = await UBD.find();
    if (!userData) {
      res.status(401).json({ status: -1 });
    } else {
      res.status(200).json({ status: 1, response: userData });
    }
  } catch (error) {
    console.log(error);
    res.send(200).json({ status: -1 });
  }
};

//block user
const doBlockUser = async (req, res) => {
  try {
    const data = req.params.id;
    const userData = await UBD.findById({ _id: data });
    if (userData.is_blocked === false) {
      await UBD.findByIdAndUpdate({ _id: data },{ $set: { is_blocked: true } });
      res.status(200).json({ is_blocked:true });
    } else {
      await UBD.findByIdAndUpdate({ _id: data },{ $set: { is_blocked: false } });
      res.status(200).json({ is_blocked:false });
    }
  } catch (error) {}
};

module.exports = { dologin, getUserData, doBlockUser };
