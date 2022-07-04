const mongoose = require("mongoose");

const chatRoomSchema = new mongoose.Schema(
    {
        userIds: [mongoose.Schema.Types.ObjectId],
        chatInitiator: mongoose.Schema.Types.ObjectId,
    },
    {
        timestamps: true,
        collection: "chatrooms",
    }
);

chatRoomSchema.statics.initiateChat = async function (userIds, chatInitiator) {
    try {
        const availableRoom = await this.findOne({
            userIds: {
                $size: userIds.length,
                $all: [...userIds],
            }
        });
        if (availableRoom) {
            return {
                isNew: false,
                message: 'retrieving an old chat room',
                //chatRoomId: availableRoom._doc._id,
            };
        }

        const newRoom = await this.create({ userIds, chatInitiator });
        return {
            isNew: true,
            message: 'creating a new chat room',
            chatRoomId: newRoom._doc._id,
        };
    } catch (error) {
        console.log('error on start chat method', error);
        throw error;
    }
}

/**
 * @param {String} userId - id of user
 * @return {Array} array of all chatroom that the user belongs to
 */
chatRoomSchema.statics.getChatRoomsByUserId = async function (userId) {
    try {
        const rooms = await this.find({ userIds: { $all: [userId] } });
        return rooms;
    } catch (error) {
        throw error;
    }
}

/**
 * @param {String} roomId - id of chatroom
 * @return {Object} chatroom
 */
chatRoomSchema.statics.getChatRoomByRoomId = async function (roomId) {
    try {
        const room = await this.findOne({ _id: roomId });
        return room;
    } catch (error) {
        throw error;
    }
}



module.exports = mongoose.model("ChatRoom", chatRoomSchema);
