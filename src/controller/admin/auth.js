const User = require("../../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const shortid = require("shortid");
const RefreshToken = require("../../models/refreshToken");

exports.signin = (req, res) => {
    User.findOne({ email: req.body.email }).exec(async (error, user) => {
        if (error) return res.status(400).json({ error });
        if (user) {
            const isPassword = await user.authenticate(req.body.password);
            if (isPassword && user.role === "admin") {
                const token = jwt.sign(
                    { _id: user._id, role: user.role },
                    process.env.JWT_SECRET,
                    { expiresIn: "10d" }
                );

                const refreshToken = await RefreshToken.createToken(user);

                const { _id, firstName, lastName, email, role, fullName, profilePicture } = user;
                //res.cookie("token", token, { expiresIn: "1d" });
                res.status(200).json({
                    token,
                    user: { _id, firstName, lastName, email, role, fullName, profilePicture },
                    refreshToken
                });
            } else {
                res.status(400).json({ error: "invalid password" })
            }
        } else {
            res.status(400).json({ error: "Admin is not exists" })
        }
    });
}

exports.refreshToken = async (req, res) => {
    const { refreshToken: requestToken } = req.body;

    if (requestToken === null) {
        return res.status(403).json({ message: "Refresh Token is required!" });
    }

    try {
        let refreshToken = await RefreshToken.findOne({ token: requestToken });

        if (!refreshToken) {
            res.status(403).json({ message: "Refresh token is not in database!" });
            return;
        }

        if (RefreshToken.verifyExpiration(refreshToken)) {
            RefreshToken.findByIdAndRemove(refreshToken._id, { useFindAndModify: false }).exec();
            res.status(403).json({
                message: "Refresh token was expired. Please make a new signin request",
            });
            return;
        }

        let newAccessToken = jwt.sign({ _id: refreshToken.user._id, role: "admin" }, process.env.JWT_SECRET, {
            expiresIn: "10d"
        });

        return res.status(200).json({
            accessToken: newAccessToken,
            refreshToken: refreshToken.token,
        });
    } catch (err) {
        return res.status(500).send({ message: err });
    }
};

exports.signup = (req, res) => {
    User.findOne({ email: req.body.email }).exec(async (error, user) => {
        if (user) {
            return res.status(400).json({ error: "Email has been registed" });
        }
        let role = "admin";
        let profilePicture = "";
        const { firstName, lastName, email, password } = req.body;
        const hash_password = await bcrypt.hash(password, 10);
        const _user = new User({
            firstName,
            lastName,
            email,
            hash_password,
            username: shortid.generate(),
            role,
            profilePicture
        });

        _user.save((error, data) => {
            if (error) {
                return res.status(400).json({
                    error: "Something went wrong",
                });
            }

            if (data) {
                return res.status(201).json({
                    message: "Admin created Successfully..!",
                });
            }
        });
    });
}

exports.signout = async (req, res) => {
    let refreshToken = await RefreshToken.findOne({ token: req.body.refreshToken });
    await RefreshToken.findByIdAndRemove(refreshToken._id, { useFindAndModify: false }).exec();
    res.clearCookie("token");
    res.status(200).json({
        message: "Signout successfully...!",
    });
};

exports.updateUserProfile = async (req, res) => {
    // User.findOne({ email: req.body.email }).exec(async (error, user) => {
    //     if (user) {
    //         return res.status(400).json({ error: "Email has been registed" });
    //     }
    // })
    let profilePicture = '';
    if (req.file) {
        profilePicture = "/public/" + req.file.filename;
    }

    let condition = req.file ? { firstName: req.body.firstName, lastName: req.body.lastName, email: req.body.email, profilePicture: profilePicture } :
        { firstName: req.body.firstName, lastName: req.body.lastName, email: req.body.email };

    await User.findOneAndUpdate({ _id: req.body._id },
        { $set: condition },
        { new: true }, (err, result) => {
            if (err) {
                console.log(err);
                return res.status(400).json({ error: "Something went wrong" })
            } else {
                const user = {};
                user.firstName = result.firstName;
                user.lastName = result.lastName;
                user.email = result.email;
                user.profilePicture = result.profilePicture;
                user._id = result._id;
                user.role = result.role;
                return res.status(200).json({ user });
            }
        })
}
