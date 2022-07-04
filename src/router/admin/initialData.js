const express = require('express');
const { initialData } = require('../../controller/admin/initialData');
//const { checkTokenExpirationMiddleware } = require('../../common-middlewares/index');
const router = express.Router();

router.post('/initialdata', initialData);

module.exports = router;