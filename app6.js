const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
const fs = require('fs');
const { setClient, setUser, setPhoneNumber, setMessage, createChatTree, enviarMensajePrimeraVez,
        generarRutaRutaAnterior, validarExistenciaDeRuta, enviarMensaje, verificarExistenciaValidacion,
        validarRespuesta, verificarExistenciaFuncion, ejecutarFuncion, notificiarErrorUsuario } = require('./funciones-chatBot');

const client = new Client({
    authStrategy: new LocalAuth({ clientId: "aism1" }),
});

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on('authenticated', (session) => {
})
  
client.on('auth_failure', (msg) => {
    console.error('Hubo un fallo en autenticación', msg)
})

client.on('ready', async () => {
    try {
        console.log('Client is ready!');
        setClient(client);
    } catch (err) {
        console.error(err)
    }    
});

client.on('message', msg => {
    let message = msg;
    let phoneNumber = msg._data.from.split('@')[0];
    let user = null;

    let prueba = new Object();
    prueba['phone'] = msg._data.from.split('@')[0];

    setMessage(message);
    setPhoneNumber(phoneNumber);

    console.log('\n\n\n\n');
    console.log('New msg from ' + phoneNumber);

    fs.readFile('db/db' + phoneNumber + '.json', 'utf8', (err, data) => {
        console.log('Reading DB');
        
        if (err) {
            console.log('Creating DB');
            user = {"phone_number": phoneNumber,"info":{"tree_pos":"0","first_time":1}};
            setUser(user);

            fs.writeFile('db/db' + phoneNumber + '.json', JSON.stringify(user), err => {
                if(err){
                    console.error(err)
                } else {
                    chatbot(phoneNumber, user, message);
                }
            });
        } else {
            if (phoneNumber === '573152015671') {
                setTimeout(() => {
                    console.log(phoneNumber, prueba['phone']);
                    user = JSON.parse(data);
                    setUser(user);
                    chatbot(phoneNumber, user, message);
                }, 5000);
            } else {
                console.log(phoneNumber, prueba['phone']);
                user = JSON.parse(data);
                setUser(user);
                chatbot(phoneNumber, user, message);
            }
        }
    });
});

client.initialize();

const chatbot = function (phoneNumber, user, message) {
    let chartTree = createChatTree();

    if (+user.info.first_time === 1) {
        user.info.first_time = 0;
        enviarMensajePrimeraVez(phoneNumber, user);
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
            enviarMensajePrimeraVez(phoneNumber, user);
        } else {
            // Convertir un almuadilla o dejar el número
            if (user.info.tree_pos === '0') {
                user.info.tree_pos = message._data.body.trim();
            } else {
                user.info.tree_pos += '.' + (message._data.body.trim().length === 1 && /^-?\d+$/.test(message._data.body.trim()) ? message._data.body.trim() : '*');
            }

            setUser(user);

            // Generar ruta y ruta anterior (key y keyBefore)
            let ruta = generarRutaRutaAnterior(user);

            // Validar con keyBefore que exista la ruta que el usuario pide
            let existeRuta = validarExistenciaDeRuta(chartTree, user, ruta.keyBefore);
            let msgValidado = verificarExistenciaValidacion(chartTree, ruta.key);

            if (existeRuta) {
                if (msgValidado) {
                    if (validarRespuesta(chartTree, ruta.key, message)) {
                        if (verificarExistenciaFuncion(chartTree, ruta.key)) {
                            ejecutarFuncion(chartTree, ruta.key, phoneNumber, message._data.body.trim());
                        } else {
                            enviarMensaje(chartTree, key, phoneNumber);
                        }
                    } else {
                        notificiarErrorUsuario(chartTree, ruta.keyBefore, msgValidado);
                    }
                } else {
                    if (verificarExistenciaFuncion(chartTree, ruta.key)) {
                        ejecutarFuncion(chartTree, ruta.key, phoneNumber, message._data.body.trim());
                    } else {
                        enviarMensaje(chartTree, key, phoneNumber);
                    }
                }
            } else {
                notificiarErrorUsuario(chartTree, ruta.keyBefore, msgValidado);
            }
        }
    }
}

//Funciones

// Validadores
