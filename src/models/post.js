const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    datetime: {
        type: Date,
        required: true,
        default: Date.now()
    },
    descrip: {
        type: String
    }
},
    { timestamps: true }
);

postSchema.statics.createPost = async function (title, descrip) {
    try {
        const post = await this.create({
            title,
            descrip
        });
        return post;
    } catch (error) {
        throw error;
    }
}

postSchema.statics.getPost = async function (options = {}) {
    try {
        return await this.aggregate([
            { $skip: options.page * options.limit },
            { $limit: options.limit },
            { $sort: { createdAt: 1 } }
        ])
    } catch (error) {
        throw error;
    }
}

module.exports = mongoose.model("Post", postSchema);