const Post = require('../models/post');
const mongoose = require("mongoose");

exports.initiate = async (req, res) => {
    try {
        if (req.body.title === '') {
            return res.status(400).json({ error: 'Title must be required' });
        }
        const { title, descrip } = req.body;
        const post = await Post.createPost(title, descrip);
        return res.status(201).json({ post });

    } catch (error) {
        return res.status(500).json({ success: false, error: error })
    }
}

exports.getPost = async (req, res) => {
    try {
        const options = {
            page: parseInt(req.query.page) || 0,
            limit: parseInt(req.query.limit) || 5,
        };

        const posts = await Post.getPost(options);
        const total = await Post.count({});
        return res.status(200).json({
            success: true,
            posts,
            total
        });

    } catch (error) {
        return res.status(500).json({ error: error })
    }
}

exports.getPostDetail = async (req, res) => {
    try {
        const { id } = req.params;

        const post = await Post.getPostDetail(id);
        if (post) {
            return res.status(200).json({ post });
        }
        return res.status(400).json({ message: 'Post has been no exists' })

    } catch (error) {
        return res.status(500).json({ error: error })
    }
}

exports.updatePost = async (req, res) => {
    try {
        const id = mongoose.Types.ObjectId(req.params.id);
        const { title, descrip } = req.body;
        const post = { title, descrip }
        if (title === '') {
            return res.status(400).json({ error: 'Title must be required' }); 
        }
        const updatePost = await Post.findOneAndUpdate({ _id: id }, post, { new: true });

        if (!updatePost) {
            return res.status(401).json({ error: 'Post has been no exists' })
        }

        return res.status(200).json({ updatePost });

    } catch (error) {
        return res.status(500).json({ error: error });
    }
}


exports.deletePost = async (req, res) => {
    try {
        const id = mongoose.Types.ObjectId(req.params.id);
        const deletedPost = await Post.findOneAndDelete({ _id: id });

        if (!deletedPost) {
            return res.status(401).json({ message: 'Post has been no exists' });
        }

        return res.status(200).json({ deletedPost, message: 'post has been deleted success!' });

    } catch (error) {
        return res.status(500).json({ error: error });
    }
}


