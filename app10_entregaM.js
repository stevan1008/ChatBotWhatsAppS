const express = require('express');
const router = express.Router();
const qrcode = require('qrcode-terminal');
const cors = require('cors');
const { Client, LocalAuth, NoAuth } = require('whatsapp-web.js');
const fs = require('fs');
const { fcb } = require('./funciones-chatBot3_1 _entregaMarzo');
const { authGuard } = require('./middlewares/api_guard');

var qrToken = undefined;
var auth = false;
var ready = false;
var phoneNumber = undefined;

const client = new Client({
    //authStrategy: new LocalAuth({ clientId: "aism-one" })
    authStrategy: new NoAuth()
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
            console.log(`Servkpoer running on port ${port}`);
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
    let message = msg;
    let user = null;

    console.log('\n\n\n\n');
    console.log('New msg from ' + phoneNumber);

    fs.readFile('db/db' + phoneNumber + '.json', 'utf8', (err, data) => {
        console.log('Reading DB');
        
        if (err) {
            console.log('Creating DB');
            user = {
                "phone_number": phoneNumber,
                "info": {
                    "tree_pos": "0",
                    "first_time": 1
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
        } else {
            user = JSON.parse(data);
            chatbot(phoneNumber, user, message);
        }
    });
});

const chatbot = function (phoneNumber, user, message) {
    let chat = fcb();

    chat.setClient(client);
    chat.setPhoneNumber(phoneNumber);
    chat.setUser(user);
    chat.setMessage(message);
    chat.createChatTree();

    if (+user.info.first_time === 1) {
        user.info.first_time = 0;
        chat.enviarMensajePrimeraVez();
    } else {
        if (message._data.type !== 'chat') {
            let key = 'chatTree';
            let pos = user.info.tree_pos.split('.');

            for (let i = 0; i < pos.length; i++) {
                key += "['" + pos[i] + "']";
            }

            if (key === 'chatTree') {
                client.sendMessage(phoneNumber + '@c.us', `¡El tipo de mensaje '${message._data.type}' no es permitido !\n\n` + eval(key + "['0'].value"));
            } else {
                client.sendMessage(phoneNumber + '@c.us', `¡El tipo de mensaje '${message._data.type}' no es permitido !\n\n` + eval(key + '.value'));
            }
        }
        else if (message._data.body.trim() === '@') {
            user.info.tree_pos = '0';
            user.info.first_time = 0;
            chat.enviarMensajePrimeraVez();
        } else if (message._data.body.trim() === '#') {
            chat.volverAtras();
        } else {
            // Convertir un almuadilla o dejar el número
            if (user.info.tree_pos === '0') {
                user.info.tree_pos = message._data.body.trim();
            } else {
                user.info.tree_pos += '.' + (message._data.body.trim().length === 1 && /^-?\d+$/.test(message._data.body.trim()) ? message._data.body.trim() : '*');
            }

            // Generar ruta y ruta anterior (key y keyBefore)
            chat.generarRutaRutaAnterior();

            if (chat.validarExistenciaDeRuta()) {
                if (chat.verificarExistenciaValidacion()) {
                    if (chat.validarRespuesta()) {
                        if (chat.verificarExistenciaFuncion()) {
                            chat.ejecutarFuncion(message._data.body.trim());
                        } else {
                            chat.enviarMensaje();
                        }
                    } else {
                        chat.notificiarErrorUsuario();
                    }
                } else {
                    if (chat.verificarExistenciaFuncion()) {
                        chat.ejecutarFuncion(message._data.body.trim());
                    } else {
                        chat.enviarMensaje();
                    }
                }
            } else {
                chat.notificiarErrorUsuario();
            }
        }
    }
}

module.exports = router;
