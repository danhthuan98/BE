const Post = require('../models/postModel');
const User = require('../models/user');

exports.createPost = async (req, res) => {
    const { description } = req.body;
    const { _id } = req.user;
    const newPost = new Post({ description, author: _id });

    newPost.save((error, post) => {
        if (error) return res.status(400).json({ error });
        if (post) {
            res.status(201).json({ newPost });
        }
    });

    await User.findOneAndUpdate({ _id }, { $push: { posts: newPost.id } });
};

exports.getPost = async (req, res) => {
    const { _id } = req.params;
    const query = {
        author: { _id }
    };
    const posts = await Post.find(query)
        .populate({
            path: 'author',
            select: 'firstName lastName profilePicture',
            populate: [
                { path: 'following' },
                { path: 'followers' },
                {
                    path: 'notifications',
                    populate: [{ path: 'author' }, { path: 'follow' }, { path: 'like' }, { path: 'comment' }],
                },
            ],
        }).sort({ createdAt: -1 })
    // .populate('likes')
    // .populate({
    //     path: 'comments',
    //     options: { sort: { createdAt: -1 } },
    //     populate: { path: 'author' },
    // });

    return res.status(200).json({ posts });

}
