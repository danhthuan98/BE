const jwt = require("jsonwebtoken");
const multer = require("multer");
const shortid = require("shortid");
const path = require("path");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(path.dirname(__dirname), "uploads"));
    },
    filename: function (req, file, cb) {
        cb(null, shortid.generate() + "-" + file.originalname);
    },
});

exports.upload = multer({ storage });



exports.requireSignin = (req, res, next) => {
    if (req.headers.authorization) {
        const token = req.headers.authorization.split(" ")[1];
        // Phan giai de lay ra user tu token
        const user = jwt.verify(token, process.env.JWT_SECRET);
        /* Add infomation user into request */
        req.user = user;
    } else {
        return res.status(400).json({ message: "Authorization required" });
    }
    next();
};

exports.adminMiddleware = (req, res, next) => {
    if (req.user.role !== "admin") {
        return res.status(400).json({ message: "Admin access denied" });
    }
    next();
};

exports.userMiddleware = (req, res, next) => {
    if (req.user.role !== "user") {
        return res.status(400).json({ message: "User access denied" });
    }
    next();
};