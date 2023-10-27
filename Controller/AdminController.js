const UBD = require('../Model/UserModel');
//----------------------------------------


const dologin = async (req, res) => {
    try {
        console.log("Request received");
        console.log(req.body);
        res.status(200).json({ message: "Request received" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error" });
    }
}


module.exports = { dologin }