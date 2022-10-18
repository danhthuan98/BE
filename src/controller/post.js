// const upload = require('../utils/cloudinary');
const Post = require('../models/postModel');
const { cloudinary } = require('../utils/cloudinary');

// const User = require('../models/user');

exports.createPost = async (req, res) => {
    const { title, img } = req.body;
    const { _id } = req.user;
    let imageUrl = [];
    if (img) {
        const options = { upload_preset: 'dev_setups' };
        for (const item of img) {
            const uploadResponse = await cloudinary.uploader.upload(item, options);
            if (!uploadResponse.secure_url) {
                return res.status(400).json('Something went wrong while uploading image to Cloudinary');
            }
            imageUrl.push(uploadResponse.secure_url);
        }
    }

    const arrPictures = imageUrl.map((item) => {
        return {
            img: item
        }
    })

    const content = arrPictures.length > 0 ? { title, author: _id, postPictures: arrPictures } : { title, author: _id };

    const newPost = new Post(content);

    newPost.save((error, post) => {
        if (error) return res.status(400).json({ error });
        if (post) {
            res.status(201).json({ newPost });
        }
    });

    // await User.findOneAndUpdate({ _id }, { $push: { posts: newPost.id } });
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
