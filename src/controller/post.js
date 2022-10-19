const Post = require('../models/postModel');
const { cloudinary } = require('../utils/cloudinary');

function upload(item, options) {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(item, options)
            .then((uploadResponse) =>
                resolve(uploadResponse.secure_url))
            .catch((err) => reject(err));
    });
}

exports.createPost = async (req, res) => {
    const { title, img } = req.body;
    const { _id } = req.user;
    let imageUrl = [];
    if (img) {
        const options = { upload_preset: 'dev_setups' };
        let promiseArray = [];
        for (const item of img) {
            promiseArray.push(upload(item, options));
        }
        await Promise.all(promiseArray)
            .then((response) => {
                for (const item of response) {
                    imageUrl.push(item)
                }
            })
            .catch((error) => res.status(400).json('Something went wrong while uploading image to Cloudinary'));
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
