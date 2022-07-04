const makeValidation = require('@withvoid/make-validation')
const ChatRoom = require('../models/ChatRoom');
const ChatMessage = require('../models/ChatMessage');
const User = require('../models/user');

exports.initiate = async (req, res) => {
    try {
        /* Validation */
        const validation = makeValidation(types => ({
            payload: req.body,
            checks: {
                userIds: {
                    type: types.array,
                    options: { unique: true, empty: false, stringOnly: true }
                }
            }
        }));

        if (!validation.success) return res.status(400).json({ ...validation });
        /* Get all user id to initial group chat */
        const { userIds } = req.body;
        /* Get user id of chat master */
        const { _id: chatInitiator } = req.user;
        const allUserIds = [...userIds];
        const chatRoom = await ChatRoom.initiateChat(allUserIds, chatInitiator);
        const messagePayload = {
            messageText: "Hello",
        };
        await ChatMessage.createPostInChatRoom(chatRoom.chatRoomId, messagePayload, chatInitiator);
        return res.status(200).json({ success: true, chatRoom });
    } catch (error) {
        return res.status(500).json({ success: false, error: error })
    }
}
exports.postMessage = async (req, res) => {
    try {
        const { roomId } = req.body;
        /* Validation */
        const validation = makeValidation(types => ({
            payload: req.body,
            checks: {
                messageText: { type: types.string },
            }
        }));
        if (!validation.success) return res.status(400).json({ ...validation }); 

        const messagePayload = {
            messageText: req.body.messageText,
        };
        const { _id: currentLoggedUser } = req.user;
        const post = await ChatMessage.createPostInChatRoom(roomId, messagePayload, currentLoggedUser);

        const coversation = {
            _id: post.postId, chatRoomId: post.chatRoomId, createdAt: post.createdAt,
            message: post.message, postedByUser: post.postedByUser, readByRecipients: post.readByRecipients,
            type: post.type, updatedAt: post.updatedAt
        }

        req.io.sockets.emit("send_message", coversation);

        return res.status(200).json({ success: true, post });
    } catch (error) {
        return res.status(500).json({ success: false, error: error })
    }
}

exports.getRecentConversation = async (req, res) => {
    try {
        const { _id: currentLoggedUser } = req.user;
        const options = {
            page: parseInt(req.query.page) || 0,
            limit: parseInt(req.query.limit) || 10,
        };
        const rooms = await ChatRoom.getChatRoomsByUserId(currentLoggedUser);
        const roomIds = rooms.map(room => room._id);
        const recentConversation = await ChatMessage.getRecentConversation(
            roomIds, options, currentLoggedUser
        );
        return res.status(200).json({ success: true, conversation: recentConversation });
    } catch (error) {
        return res.status(500).json({ success: false, error: error })
    }
}

exports.getConversationByRoomId = async (req, res) => {
    try {
        const { roomId, page } = req.body;
        const room = await ChatRoom.getChatRoomByRoomId(roomId)
        if (!room) {
            return res.status(400).json({
                success: false,
                message: 'No room exists for this id',
            })
        }
        const users = await User.getUserByIds(room.userIds);
        console.log(req.body.page)
        const options = {
            page: parseInt(page) || 0,
            limit: parseInt(req.body.limit) || 10,
        };
        const conversation = await ChatMessage.getConversationByRoomId(roomId, options);
        return res.status(200).json({
            success: true,
            conversation,
            users,
        });
    } catch (error) {
        return res.status(500).json({ success: false, error });
    }
}
exports.markConversationReadByRoomId = async (req, res) => {
    try {
        const { roomId } = req.params;
        const room = await ChatRoom.getChatRoomByRoomId(roomId)
        if (!room) {
            return res.status(400).json({
                success: false,
                message: 'No room exists for this id',
            })
        }

        const currentLoggedUser = req.user._id;
        const result = await ChatMessage.markMessageRead(roomId, currentLoggedUser);
        return res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, error });
    }
}