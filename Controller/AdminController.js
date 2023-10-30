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

module.exports = { dologin };
