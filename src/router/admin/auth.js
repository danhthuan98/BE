const express = require('express');
const { signin, signup, signout,
    refreshToken, updateUserProfile, getUserSuggestedByName,
    getUserInformation, uploadUserImage, updateAudiencePost } = require('../../controller/admin/auth');
const { validateSigninRequest, isRequestValidated, validateSignupRequest } = require('../../validator/auth');
const { requireSignin, adminMiddleware } = require("../../common-middlewares");
const { upload } = require("../../common-middlewares");
const router = express.Router();

router.post('/v1/login', validateSigninRequest, isRequestValidated, signin);
router.post('/v1/signup', signup);
router.post('/v1/signout', signout);
router.post('/v1/refreshtoken', refreshToken);
router.get('/v1/userprofile', requireSignin, getUserInformation);
router.post('/admin/updateuser', requireSignin, adminMiddleware, upload.single("profilePicture"), updateUserProfile);
router.post('/v1/upload/userprofile', requireSignin, adminMiddleware, uploadUserImage);
router.post('/v1/change/audiencepost', requireSignin, adminMiddleware, updateAudiencePost);
router.get('/v1/user/suggested', requireSignin, adminMiddleware, getUserSuggestedByName);

module.exports = router
