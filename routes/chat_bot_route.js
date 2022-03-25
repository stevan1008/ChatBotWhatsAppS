const express = require('express');
const router = express.Router();

const { getChatBotToken, createChatBotToken } = require('../controllers/chat_bot_controller');

router.route('/').get(getChatBotToken).post(createChatBotToken);

module.exports = router;