const express = require('express');
const { initiate, getPost } = require('../controller/post');
const router = express.Router();

router.post('/postMessage', initiate);
router.get('/getPost', getPost);

module.exports = router;