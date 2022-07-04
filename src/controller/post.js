const Post = require('../models/post');

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
        console.log(req.query.limit)
        const options = {
            page: parseInt(req.query.page) || 0,
            limit: parseInt(req.query.limit) || 3,
        };
        console.log(options)
        const posts = await Post.getPost(options);
        return res.status(200).json({
            success: true,
            posts
        });

    } catch (error) {
        return res.status(500).json({ error: error })
    }
}


