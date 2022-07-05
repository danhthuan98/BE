const express = require('express');
const { initiate, getPost, getPostDetail } = require('../controller/post');
const router = express.Router();

router.post('/postMessage', initiate);
router.get('/getPost', getPost);
router.get('/getPost/:id', getPostDetail);

module.exports = router;