const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
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
            { $sort: { createdAt: -1 } },
            { $skip: options.page * options.limit },
            { $limit: options.limit },
        ])
    } catch (error) {
        throw error;
    }
}

postSchema.statics.getPostDetail = async function (id) {
    try {

        const ids = mongoose.Types.ObjectId(id);
        const aggregate = await this.aggregate([
            { $match: { _id: ids } }
        ])
        return aggregate[0];
    } catch (error) {
        throw error;
    }
}

module.exports = mongoose.model("Post", postSchema);