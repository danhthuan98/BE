const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true
    },
    audience: { type: String, required: true },
    postPictures: [
        { img: { type: String }, description: { type: String } }
    ],
    friendTag: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
        }
    ],
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Like',
        },
    ],
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comment',
        },
    ],
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);