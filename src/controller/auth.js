const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const shortid = require("shortid");

exports.signin = (req, res) => {
    User.findOne({ email: req.body.email }).exec(async (error, user) => {
        if (error) return res.status(400).json({ error });
        if (user) {
            const isPassword = await user.authenticate(req.body.password);
            if (isPassword && user.role === "user") {
                const token = jwt.sign(
                    { _id: user._id, role: user.role },
                    process.env.JWT_SECRET,
                    { expiresIn: "1d" }
                );
                const { _id, firstName, lastName, email, role, fullName } = user;
                res.cookie("token", token, { expiresIn: "1d" });
                res.status(200).json({
                    token,
                    user: { _id, firstName, lastName, email, role, fullName },
                });
            } else {
                res.status(400).json({ error: "invalid password" });
            }
        } else {
            res.status(400).json({ error: "User is not exists" });
        }
    });
}

exports.createdCustomer = async (req, res) => {
    User.findOne({ email: req.body.email }).exec(async (error, user) => {
        if (user) return res.status(400).json({ error: "Email has been registed" });
        try {
            await User.createCustomer(req.body);
            return res.status(201).json({ message: 'Customer has created successfully!' })
        } catch (err) {
            return res.status(500).json({ success: false, error: error })
        }
    });
}

exports.getAllCustomer = async (req, res) => {
    try {
        const options = {
            page: parseInt(req.query.page) || 0,
            limit: parseInt(req.query.limit) || 5,
        };

        const customers = await User.getCustomers(options);
        const total = await User.countDocuments({});
        return res.status(200).json({ customers, total });

    } catch (error) {
        return res.status(500).json({ error: error })
    }
}

exports.signout = (req, res) => {
    res.clearCookie("token");
    res.status(200).json({
        message: "Signout successfully...!",
    });
};