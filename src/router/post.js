const express = require('express');
const { initiate, getPost, getPostDetail, updatePost, deletePost } = require('../controller/post');
const router = express.Router();

router.post('/postMessage', initiate);
router.patch('/updatepost/:id', updatePost)
router.get('/getPost', getPost);
router.get('/getPost/:id', getPostDetail);
router.delete('/deletepost/:id', deletePost)

module.exports = router;