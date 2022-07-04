const express = require('express');
const { getRecentConversation, getConversationByRoomId,
    initiate, postMessage, markConversationReadByRoomId } = require('../controller/ChatRoom');
const { requireSignin } = require("../common-middlewares");

const router = express.Router();

router.get('/', requireSignin, getRecentConversation)
router.post('/getConversation', requireSignin, getConversationByRoomId)
router.post('/initiate', requireSignin, initiate)
router.post('/postMessage', requireSignin, postMessage)
router.put('/:roomId/mark-read', requireSignin, markConversationReadByRoomId)

module.exports = router;