const express = require('express');
const { signin, signup, signout } = require('../controller/auth');
const { validateSigninRequest, isRequestValidated, validateSignupRequest } = require('../validator/auth');
const router = express.Router();

router.post('/signin', validateSigninRequest, isRequestValidated, signin);
router.post('/signup', validateSignupRequest, isRequestValidated, signup);
router.post('/signout', signout);

module.exports = router;