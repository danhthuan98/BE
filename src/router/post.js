const express = require('express');
const router = express.Router();
const { requireSignin, adminMiddleware } = require('../common-middlewares');
const { createPost } = require('../controller/post');

router.post('/post/create', requireSignin, adminMiddleware, createPost);


module.exports = router;