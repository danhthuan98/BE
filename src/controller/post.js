const Post = require('../models/post');

exports.createPost = async (req, res) => {
    const { description } = req.body;
    const { _id } = req.user;
    const newPost = new Post({ description, createdBy: _id });

    await newPost.save((error, post) => {
        if (error) return res.status(400).json({ error });
        if (post) {
            res.status(201).json({ newPost });
        }
    });
};

exports.getPost = async (req, res) => {
    
}
