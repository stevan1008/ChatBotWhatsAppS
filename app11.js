const express = require('express');
const router = express.Router();
const qrcode = require('qrcode-terminal');
const cors = require('cors');
const { Client, NoAuth, LocalAuth } = require('whatsapp-web.js');
const  Chat = require('whatsapp-web.js/src/structures/Chat');
const fs = require('fs');
const { fcb } = require('./funciones-chatBot4.js');
const { authGuard } = require('./middlewares/api_guard');
const moment = require('moment');

var qrToken = undefined;
var auth = false;
var ready = false;
var phoneNumber = undefined;

var chat = new Chat();

const client = new Client({
    authStrategy: new LocalAuth({ clientId: "aism-one" })
    //authStrategy: new NoAuth()
});

const server = express();
server.use(express.json());
server.use(cors());

server.use('/api/chatbot/startChatbot', authGuard, function(req, res) {
    if (!ready) {
        client.initialize();
    }

    res.json({ res: 'Client started!' }); 
});

server.use('/api/chatbot/token', authGuard, function(req, res) {    
    res.json({ token: qrToken, botReady: ready, authenticated: auth }); 
});


server.use('/api/chatbot/logout', authGuard, (req, res) => {
    qrToken = undefined;
    auth = false;
    ready = false;
    auth = false;
    client.destroy();
    console.log('Client destroyed');
    res.json({ res: 'Logout!' });
});

server.use('/api/chatbot/changer', authGuard, (req, res) => {
    client.logout();
})

server.use('/api/chatbot/ready', authGuard, (req, res) => {
    res.json({ ready: ready });
});

server.use('/api/chatbot/phone', authGuard, (req, res) => {
    if (ready) {
        res.json({ phoneNumber: client.info.wid.user });
    } else {
        res.json({msg: 'Número no encontrado'});
    }
});

const port = process.env.port || 3000;

const start = async() => {
    try {
        server.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    } catch (err) {
        console.log(err);
    }
};

start();

client.on('qr', qr => {
    qrToken = qr;
    qrcode.generate(qr, {small: true});
});

client.on('authenticated', (session) => {
    auth = true;
    console.log('authenticated!');
});
  
client.on('auth_failure', (msg) => {
    console.error('Hubo un fallo en autenticación', msg)
});

client.on('ready', async () => {
    try {
        console.log('Client is ready!');
        ready = true;
        qrToken = undefined;
    } catch (err) {
        console.error(err)
    }    
});

client.on('message', msg => {
    let phoneNumber = msg._data.from.split('@')[0];

    if (phoneNumber !== 'status') {
        let message = msg;
        let user = null;

        console.log('\n\n\n\n');
        console.log('New msg from ' + phoneNumber);

        fs.readFile('db/db' + phoneNumber + '.json', 'utf8', (err, data) => {
            console.log('Reading DB');
            
            if (err) { // Primera vez del ciudadano
                console.log('Creating DB');
                user = {
                    "phone_number": phoneNumber,
                    "bot_activo": true,
                    "info": {
                        "tree_pos": "0",
                        "first_time": 1,
                        "last_int": new Date()
                    },
                    "name": ""
                };

                fs.writeFile('db/db' + phoneNumber + '.json', JSON.stringify(user), err => {
                    if(err){
                        console.error(err)
                    } else {
                        chatbot(phoneNumber, user, message);
                    }
                });
            } else { // Ya tiene base de datos
                user = JSON.parse(data);
                let arbolReiniciado = false;

                if (message._data.type === 'chat' && message._data.body.trim().toUpperCase() == 'PROFESIONAL' && user.bot_activo) {
                    user.bot_activo = false;
                    client.sendMessage(phoneNumber + '@c.us', 'Pronto un profesional de la salud lo atenderá');
                }

                // Gestión del tiempo inactivo
                let dateNow = moment();
                let dateChatAux = new Date(user.info.last_int);
                dateChatAux.setMinutes(dateChatAux.getMinutes() + dateChatAux.getTimezoneOffset());
                let dateChat = moment(dateChatAux);
                
                if (dateNow.diff(dateChat, 'minutes') >= 15) {
                    user.bot_activo = true;
                    user.info.tree_pos = '0';
                    user.info.first_time = 1;
                    user.name = '';

                    arbolReiniciado = true;
                }

                let date = new Date();
                let utcDate = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds());
                user.info.last_int = new Date(utcDate);

                fs.writeFile('db/db' + phoneNumber + '.json', JSON.stringify(user), err => {
                    if(err){
                        console.error(err)
                    } else {
                        if (user.bot_activo) {
                            if (arbolReiniciado) {
                                client.sendMessage(phoneNumber + '@c.us', 'Pasaron más de 15 minutos sin interacción. Debe volver a iniciar su proceso.');
                            }

                            chatbot(phoneNumber, user, message);
                        }
                    }
                });
            }
        });
    }
});

const chatbot = function (phoneNumber, user, message) {
    let chatBot = fcb();
    chatBot.setClient(client);
    chatBot.setPhoneNumber(phoneNumber);
    chatBot.setUser(user);
    chatBot.setMessage(message);
    chatBot.createChatTree();

    if (+user.info.first_time === 1) {
        user.info.first_time = 0;
        chatBot.enviarMensajePrimeraVez();
    } else {
        if (message._data.type !== 'chat') {
            let key = 'chatBot.chatTree';
            let pos = user.info.tree_pos.split('.');

            for (let i = 0; i < pos.length; i++) {
                key += "['" + pos[i] + "']";
            }

            if (key === 'chatBot.chatTree') {
                client.sendMessage(phoneNumber + '@c.us', `¡El tipo de mensaje '${message._data.type}' no es permitido !\n\n` + eval(key + "['0'].value"));
            } else {
                client.sendMessage(phoneNumber + '@c.us', `¡El tipo de mensaje '${message._data.type}' no es permitido !\n\n` + eval(key + '.value'));
            }
        }
        else if (message._data.body.trim() === '@') {
            user.info.tree_pos = '0';
            user.info.first_time = 0;
            chatBot.enviarMensajePrimeraVez();
        } else if (message._data.body.trim() === '#') {
            chatBot.volverAtras();
        } else {
            // Convertir un almuadilla o dejar el número
            if (user.info.tree_pos === '0') {
                user.info.tree_pos = message._data.body.trim();
            } else {
                user.info.tree_pos += '.' + (message._data.body.trim().length === 1 && /^-?\d+$/.test(message._data.body.trim()) ? message._data.body.trim() : '*');
            }

            // Generar ruta y ruta anterior (key y keyBefore)
            chatBot.generarRutaRutaAnterior();

            if (chatBot.validarExistenciaDeRuta()) {
                if (chatBot.verificarExistenciaValidacion()) {
                    if (chatBot.validarRespuesta()) {
                        if (chatBot.verificarExistenciaFuncion()) {
                            chatBot.ejecutarFuncion(message._data.body.trim());
                        } else {
                            chatBot.enviarMensaje();
                        }
                    } else {
                        chatBot.notificiarErrorUsuario();
                    }
                } else {
                    if (chatBot.verificarExistenciaFuncion()) {
                        chatBot.ejecutarFuncion(message._data.body.trim());
                    } else {
                        chatBot.enviarMensaje();
                    }
                }
            } else {
                chatBot.notificiarErrorUsuario();
            }
        }
    }
}

module.exports = router;
