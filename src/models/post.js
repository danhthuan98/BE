const mongoose = require('mongoose');
const postSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
        trim: true
    },
    postPictures: [
        { img: { type: String } }
    ],
    friendTag: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
        }
    ],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);