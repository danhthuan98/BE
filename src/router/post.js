const express = require('express');
const router = express.Router();
const { requireSignin, adminMiddleware } = require('../common-middlewares');
const { createPost, getPost } = require('../controller/post');

router.post('/post/create', requireSignin, adminMiddleware, createPost);
router.get('/post/getpost/:_id', requireSignin, adminMiddleware, getPost);


module.exports = router;