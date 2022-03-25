const chatBot = require('../models/chat_bot_model');
const { token, client } = require('../app8_1');

client.initialize();

const getChatBotToken = async (req, res) => {
    try {
        const chatBotInfo = await chatBot.find({})
        res.status(200).json(chatBotInfo);
    } catch (err) {
        res.status(500).json({
            error: err
        });
    }
};

const createChatBotToken = async (req, res) => {
    try {
        const newChatBot = await chatBot.create(token);
        res.status(201).json(newChatBot);
    } catch (err) {
        res.status(500).json({
            error: err
        });
    }
};

module.exports = {  getChatBotToken, createChatBotToken };