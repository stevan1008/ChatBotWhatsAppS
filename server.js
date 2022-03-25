const express = require('express');
const connectDB = require('./database_prov/connect');
const chatBotRoutes = require('./routes/chat_bot_route');
require('dotenv').config();

const server = express();

const port = process.env.port || 3000;

server.use(express.json());

server.use('/api/chatbot', chatBotRoutes);

const start = async() => {
    try {
        await connectDB(process.env.MONGO_URI);
        server.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    } catch (err) {
        console.log(err);
    }
};

start();