const mongoose = require("mongoose");

const MESSAGE_TYPES = {
    TYPE_TEXT: "text",
};

const readByRecipientSchema = new mongoose.Schema(
    {
        _id: false,
        readByUserId: mongoose.Schema.Types.ObjectId,
        readAt: {
            type: Date,
            default: Date.now(),
        },
    },
    {
        timestamps: false,
    }
);

const chatMessageSchema = new mongoose.Schema(
    {
        chatRoomId: mongoose.Schema.Types.ObjectId,
        message: mongoose.Schema.Types.Mixed,
        type: {
            type: String,
            default: () => MESSAGE_TYPES.TYPE_TEXT,
        },
        postedByUser: mongoose.Schema.Types.ObjectId,
        readByRecipients: [readByRecipientSchema],
    },
    {
        timestamps: true,
        collection: "chatmessages",
    }
);

/**
 * This method will create a post in chat
 * 
 * @param {String} roomId - id of chat room
 * @param {Object} message - message you want to post in the chat room
 * @param {String} postedByUser - user who is posting the message
 */
chatMessageSchema.statics.createPostInChatRoom = async function (chatRoomId, message, postedByUser) {
    try {
        const post = await this.create({
            chatRoomId,
            message,
            postedByUser,
            readByRecipients: { readByUserId: postedByUser }
        });
        const aggregate = await this.aggregate([
            // get post where _id = post._id
            { $match: { _id: post._id } },
            // do a join on another table called users, and 
            // get me a user whose _id = postedByUser
            {
                $lookup: {
                    from: 'users',
                    localField: 'postedByUser',
                    foreignField: '_id',
                    as: 'postedByUser',
                }
            },
            { $unwind: '$postedByUser' },
            // do a join on another table called chatrooms, and 
            // get me a chatroom whose _id = chatRoomId
            {
                $lookup: {
                    from: 'chatrooms',
                    localField: 'chatRoomId',
                    foreignField: '_id',
                    as: 'chatRoomInfo',
                }
            },
            { $unwind: '$chatRoomInfo' },
            { $unwind: '$chatRoomInfo.userIds' },
            // do a join on another table called users, and 
            // get me a user whose _id = userIds
            {
                $lookup: {
                    from: 'users',
                    localField: 'chatRoomInfo.userIds',
                    foreignField: '_id',
                    as: 'chatRoomInfo.userProfile',
                }
            },
            { $unwind: '$chatRoomInfo.userProfile' },
            // group data
            {
                $group: {
                    _id: '$chatRoomInfo._id',
                    postId: { $last: '$_id' },
                    chatRoomId: { $last: '$chatRoomInfo._id' },
                    message: { $last: '$message' },
                    type: { $last: '$type' },
                    postedByUser: { $last: '$postedByUser' },
                    readByRecipients: { $last: '$readByRecipients' },
                    chatRoomInfo: { $addToSet: '$chatRoomInfo.userProfile' },
                    createdAt: { $last: '$createdAt' },
                    updatedAt: { $last: '$updatedAt' },
                }
            }
        ]);
        return aggregate[0];
    } catch (error) {
        throw error;
    }
}

/**
 * @param {String} chatRoomId - chat room id
 */
chatMessageSchema.statics.getConversationByRoomId = async function (chatRoomId, options = {}) {
    try {
        const id = mongoose.Types.ObjectId(chatRoomId);
        return await this.aggregate([
            { $match: { chatRoomId: id } },
            { $sort: { createdAt: -1 } },
            // do a join on another table called users, and 
            // get me a user whose _id = postedByUser
            {
                $lookup: {
                    from: 'users',
                    localField: 'postedByUser',
                    foreignField: '_id',
                    as: 'postedByUser',
                }
            },
            { $unwind: "$postedByUser" },
            {
                $project:
                {
                    "postedByUser.role": 0,
                    "postedByUser.hash_password": 0,
                    "postedByUser.createdAt": 0,
                    "postedByUser.updatedAt": 0,
                    "postedByUser.__v": 0
                }
            },
            // apply pagination
            { $skip: options.page * options.limit },
            { $limit: options.limit },
            { $sort: { createdAt: 1 } },
        ]);
    } catch (error) {
        throw error;
    }
}

/**
 * @param {String} chatRoomId - chat room id
 * @param {String} currentUserOnlineId - user id
 */
chatMessageSchema.statics.markMessageRead = async function (chatRoomId, currentUserOnlineId) {
    try {
        return this.updateMany(
            {
                chatRoomId,
                'readByRecipients.readByUserId': { $ne: currentUserOnlineId }
            },
            {
                $addToSet: {
                    readByRecipients: { readByUserId: currentUserOnlineId }
                }
            },
            {
                multi: true
            }
        );
    } catch (error) {
        throw error;
    }
}

/**
 * @param {Array} chatRoomIds - chat room ids
 * @param {{ page, limit }} options - pagination options
 * @param {String} currentUserOnlineId - user id
 */
chatMessageSchema.statics.getRecentConversation = async function (chatRoomIds, options, currentUserOnlineId) {
    try {
        return this.aggregate([
            { $match: { chatRoomId: { $in: chatRoomIds } } },
            {
                $group: {
                    _id: '$chatRoomId',
                    messageId: { $last: '$_id' },
                    chatRoomId: { $last: '$chatRoomId' },
                    message: { $last: '$message' },
                    type: { $last: '$type' },
                    postedByUser: { $last: '$postedByUser' },
                    createdAt: { $last: '$createdAt' },
                    readByRecipients: { $last: '$readByRecipients' },
                }
            },
            { $sort: { createdAt: -1 } },
            // do a join on another table called users, and 
            // get me a user whose _id = postedByUser
            {
                $lookup: {
                    from: 'users',
                    localField: 'postedByUser',
                    foreignField: '_id',
                    as: 'postedByUser',
                }
            },
            { $unwind: "$postedByUser" },
            // do a join on another table called chatrooms, and 
            // get me room details
            {
                $lookup: {
                    from: 'chatrooms',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'roomInfo',
                }
            },
            { $unwind: "$roomInfo" },
            { $unwind: "$roomInfo.userIds" },
            // do a join on another table called users 
            {
                $lookup: {
                    from: 'users',
                    localField: 'roomInfo.userIds',
                    foreignField: '_id',
                    as: 'roomInfo.userProfile',
                }
            },
            // { $unwind: "$readByRecipients" },
            // do a join on another table called users 
            {
                $lookup: {
                    from: 'users',
                    localField: 'readByRecipients.readByUserId',
                    foreignField: '_id',
                    as: 'readByRecipients.readByUser',
                }
            },
            {
                $project: {
                    "postedByUser.role": 0,
                    "postedByUser.hash_password": 0,
                    "postedByUser.createdAt": 0,
                    "postedByUser.updatedAt": 0,
                    "postedByUser.__v": 0,
                    "readByRecipients.readByUser.__v": 0,
                    "readByRecipients.readByUser.createdAt": 0,
                    "readByRecipients.readByUser.updatedAt": 0,
                    "readByRecipients.readByUser.hash_password": 0,
                    "readByRecipients.readByUser.role": 0,
                    "roomInfo.userProfile.hash_password": 0,
                    "roomInfo.userProfile.updatedAt": 0,
                    "roomInfo.userProfile.createdAt": 0,
                    "roomInfo.userProfile.__v": 0,
                    "roomInfo.userProfile.role": 0,
                }
            },
            {
                $group: {
                    _id: '$roomInfo._id',
                    messageId: { $last: '$messageId' },
                    chatRoomId: { $last: '$chatRoomId' },
                    message: { $last: '$message' },
                    type: { $last: '$type' },
                    postedByUser: { $last: '$postedByUser' },
                    readByRecipients: { $addToSet: '$readByRecipients' },
                    roomInfo: { $addToSet: '$roomInfo.userProfile' },
                    createdAt: { $last: '$createdAt' },
                },
            },
            // apply pagination
            { $skip: options.page * options.limit },
            { $limit: options.limit },
        ]);
    } catch (error) {
        throw error;
    }
}

module.exports = mongoose.model("ChatMessage", chatMessageSchema);
