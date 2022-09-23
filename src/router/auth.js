const express = require('express');
const { signin, createdCustomer, signout, getAllCustomer } = require('../controller/auth');
const { validateSigninRequest, isRequestValidated, validateSignupRequest } = require('../validator/auth');
const router = express.Router();

router.post('/signin', validateSigninRequest, isRequestValidated, signin);
router.post('/customer/createcustomer', validateSignupRequest, isRequestValidated, createdCustomer);
router.get('/customer/getcustomer', getAllCustomer);
router.post('/signout', signout);

module.exports = router;