const express = require('express');
const { signin, signup, signout, refreshToken, updateUserProfile } = require('../../controller/admin/auth');
const { validateSigninRequest, isRequestValidated, validateSignupRequest } = require('../../validator/auth');
const { requireSignin, adminMiddleware } = require("../../common-middlewares");
const { upload } = require("../../common-middlewares");
const router = express.Router();

router.post('/v1/login', validateSigninRequest, isRequestValidated, signin);
router.post('/v1/signup', signup);
router.post('/admin/signout', signout);
router.post('/v1/refreshtoken', refreshToken);
router.post('/admin/updateuser', requireSignin, adminMiddleware, upload.single("profilePicture"), updateUserProfile);

module.exports = router
