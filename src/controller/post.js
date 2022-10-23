// const upload = require('../utils/cloudinary');
const Post = require('../models/postModel');
const { cloudinary } = require('../utils/cloudinary');

// const User = require('../models/user');

function upload(item, options) {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(item, options)
            .then((response) => resolve(response.secure_url))
            .catch((err) => reject(err));
    });
}

exports.createPost = async (req, res) => {
    const { title, img, audience, friendTag } = req.body;
    const { _id } = req.user;
    let imageUrl = [];

    if (img) {
        const options = { upload_preset: 'dev_setups' };
        let promiseArray = [];
        for (const item of img) {
            promiseArray.push(upload(item, options))
        }
        await Promise.all(promiseArray)
            .then((response) => imageUrl = response)
            .catch((error) => res.status(400).json('Something went wrong while uploading image to Cloudinary'));
    }

    const arrPictures = imageUrl.map((item) => {
        return {
            img: item
        }
    })

    const content = arrPictures.length > 0 ? { title, author: _id, postPictures: arrPictures, audience, friendTag } :
        { title, author: _id, audience, friendTag };

    const newPost = new Post(content);

    newPost.save(async (error, result) => {
        if (error) return res.status(400).json({ error });
        if (result) {
            const post = await Post.findById({ _id: result._id }).
                populate({
                    path: 'friendTag',
                    select: 'firstName lastName profilePicture'
                }).
                populate({
                    path: 'author',
                    select: 'firstName lastName profilePicture'
                })
            res.status(201).json({ post });
        }
    });
};

exports.getPost = async (req, res) => {
    const { _id } = req.params;
    const query = {
        author: { _id }
    };
    const posts = await Post.find(query)
        .populate({
            path: 'friendTag',
            select: 'firstName lastName profilePicture'
        }).
        populate({
            path: 'author',
            select: 'firstName lastName profilePicture'
        })
        .sort({ createdAt: -1 })
    // .populate('likes')
    // .populate({
    //     path: 'comments',
    //     options: { sort: { createdAt: -1 } },
    //     populate: { path: 'author' },
    // });

    return res.status(200).json({ posts });

}
