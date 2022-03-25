const mongoose = require('mongoose');
const chatBotSchema = new mongoose.Schema({
    token: {
        type: String,
        trim: true,
    }
});

module.exports = mongoose.model('ChatBot', chatBotSchema);