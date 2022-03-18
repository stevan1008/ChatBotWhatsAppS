const qrcode = require('qrcode-terminal');
const { Client, MessageMedia } = require('whatsapp-web.js');
const fs = require('fs');
const http = require('http');
const https = require('https');

/*const { createChatTree, enviarMensajePrimeraVez, generarRutaRutaAnterior, validarExistenciaDeRuta, enviarMensaje } = require('./funciones-chatBot');
const { phoneNumberValidation, emailValidation, nameValidation, personalIdValidation, getTime } = require('./validators');*/

const SESSION_FILE_PATH = './sessions.json'
var sessionData;

var chatTree;

var user;
var message;

var key = 'chatTree';
var keyBefore = 'chatTree';
var pos;
var lastPos;

var existeRuta = false;
var msgValidado = false;

var phoneNumber;
var nombrePersona;
var time;

if(fs.existsSync(SESSION_FILE_PATH)) {
    sessionData = require(SESSION_FILE_PATH)
}

const client = new Client({
    session: sessionData
});

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on('ready', async () => {
    try {
        console.log('Client is ready!');
    } catch (err) {
        console.error(err)
    }    
});

client.on('authenticated', (session) => {
  sessionData = session;

  fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), err => {
    if(err){
      console.error(err)
    }
  })
})

client.on('auth_failure', (msg) => {
  console.error('Hubo un fallo en autenticación', msg)
})

client.on('message', msg => {
    message = msg;
    phoneNumber = msg._data.from.split('@')[0];
    user = null;

    console.log('New msg from ' + phoneNumber);

    fs.readFile('db/db' + phoneNumber + '.json', 'utf8', (err, data) => {
        console.log('Reading DB');
        
        if (err) {
            console.log('Creating DB');
            user = {"phone_number":phoneNumber,"info":{"tree_pos":"0","first_time":1}};

            fs.writeFile('db/db' + phoneNumber + '.json', JSON.stringify(user), err => {
                if(err){
                    console.error(err)
                } else {
                    chatbot();
                }
            });
        } else {
            user = JSON.parse(data);
            chatbot();
        }
    });
});

client.initialize();

const chatbot = async function () {
    if (+user.info.first_time === 1) {
        user.info.first_time = 0;
        enviarMensajePrimeraVez();
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
            enviarMensajePrimeraVez();
        } else {
            // Convertir un almuadilla o dejar el número
            if (user.info.tree_pos === '0') {
                user.info.tree_pos = message._data.body.trim();
            } else {
                user.info.tree_pos += '.' + (message._data.body.trim().length === 1 && /^-?\d+$/.test(message._data.body.trim()) ? message._data.body.trim() : '*');
            }
            // Generar ruta y ruta anterior
            generarRutaRutaAnterior();

            // Validar con keyBefore que exista la ruta que el usuario pide
            validarExistenciaDeRuta();

            if (existeRuta) {
                if (verificarExistenciaValidacion()) {
                    if (validarRespuesta()) {
                        msgValidado = true;
        
                        if (verificarExistenciaFuncion()) {
                            ejecutarFuncion();
                        } else {
                            enviarMensaje();
                        }
                    } else {
                        msgValidado = false;
                        notificiarErrorUsuario();
                    }
                } else {
                    msgValidado = true;

                    if (verificarExistenciaFuncion()) {
                        ejecutarFuncion();
                    } else {
                        enviarMensaje();
                    }
                }
            } else {
                notificiarErrorUsuario();
            }
        }

        console.log('\n\n\n\n');
    }
}

const createChatTree = () => {
    console.log('MAKING TREE...');
    chatTree = {};

    chatTree['0'] = {value: 'Bienvenido a Nariño AISM\n¿En qué te podemos ayudar?\n\n1) ¿Desea obtener información? 📚\n2) ¿Desea particiar en nuestra encuesta? 📋\n3) ¿Necesita ayuda? 🤝\n4) Prueba capacidad ChatBot 🧪 \n5) Prueba \n6) Prueba con asincronía (peticiones) 🤯 \n\nEnvie @ en cualquier momento para volver al inicio'};

    chatTree['1'] = {value: '1) Sustancias Psicoactivas \n2) Transtornos mentales \n3) Violencia \n4) Suicidio'};
    chatTree['1']['1'] = {value: "Sustancias Psicoactivas: Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. \n\n@) Volver al inicio"};
    chatTree['1']['2'] = {value: "Transtornos mentales: Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. \n\n@) Volver al inicio"};
    chatTree['1']['3'] = {value: "Violencia: Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. \n\n@) Volver al inicio"};
    chatTree['1']['4'] = {value: "Suicidio: Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. \n\n@) Volver al inicio"};

    chatTree['2'] = {value: 'https://www.idsn.gov.co/ \n\n@) Volver al inicio'};

    chatTree['3'] = {value: '¿Necesita ayuda?\n1) Si\n2) No \n@) Vovler al inicio'};
    chatTree['3']['1'] = {value: 'Denos su número telefónico o móvil sin el indicativo nacional'};
    chatTree['3']['1']['*'] = {value: 'Pronto lo llamaremos', validation: 'phoneNumberValidation'};
    chatTree['3']['2'] = {value: 'Gracias por contactarnos'};

    chatTree['4'] = {value: `Hola ${phoneNumber}, soy el ChatBot y estas rutas se pueden definir dinámicamente. \n\n1) Ver ruta 1  \n2) Ver ruta 2 \n3) Ver ruta 3 \n4) Ver ruta 4`};
    chatTree['4']['1'] = {value: 'Entraste a la ruta 1. Te voy a pedir un número telefónico:', type: 'number'};
    chatTree['4']['1']['*'] = {value: 'Ahora te voy a pedir un correo:', type: 'email'};
    chatTree['4']['1']['*']['*'] = {value: '¿Deseas que en un futuro te contactemos? \n\n 1) Si \n 2) No'};
    chatTree['4']['1']['*']['*']['1'] = {value: `Pronto te contáctaremos, gracias por tu tiempo ${phoneNumber}`};
    chatTree['4']['1']['*']['*']['2'] = {value: `No hay problema, gracias por tu tiempo ${phoneNumber}`};
    chatTree['4']['2'] = {value: 'Entraste a la ruta 2. Te voy a enviar un enlace https://wwebjs.dev/guide/ \n\n ¿Fue útil esta información? \n 1) Si \n 2) No'};
    chatTree['4']['2']['1'] = {value: `Nos alegra mucho, gracias por tu tiempo ${phoneNumber}`};
    chatTree['4']['2']['2'] = {value: `Estamos en constante mejora, gracias por tu tiempo ${phoneNumber}`};
    chatTree['4']['3'] = {value: `Esta ruta te va a enviar una imagen ${phoneNumber}`, url: 'https://d1yjjnpx0p53s8.cloudfront.net/styles/logo-thumbnail/s3/122012/instituto_deptal_salud.png'};
    chatTree['4']['4'] = {value: `Esta ruta te va a enviar un pdf ${phoneNumber}`, url: 'http://idsn.gov.co/site/web2/images/edocs/inf_gestion_1er_semestre2015.pdf'};

    chatTree['5'] = {value: "Ruta prueba 1. \nIngresa tu nombre:"};
    chatTree['5']['*'] = {value: `Ingresa tu cédula ${nombrePersona}:`, validation: 'nameValidation', function: 'setNombre', remakeTree: true};
    chatTree['5']['*']['*'] = {value: "Ingresa tu correo:", validation: 'personalIdValidation'};
    chatTree['5']['*']['*']['*'] = {value: "Ingresa tu móvil / teléfono:", validation: 'emailValidation'};
    chatTree['5']['*']['*']['*']['*'] = {value: `Gracias por la información ${nombrePersona}. La cuidaremos bien por ti.`, validation: 'phoneNumberValidation'};

    chatTree['6'] = {value: `La fecha y hora actual es ${time}`, function: 'getTime', type: 'request', remakeTree: true};

    return chatTree;
}

const enviarMensajePrimeraVez = () => {
    createChatTree();

    fs.writeFile('db/db' + phoneNumber + '.json', JSON.stringify(user), err => {
        if(err){
            console.error(err)
        } else {
            console.log('Sending: ' + chatTree[user.info.tree_pos].value);
            client.sendMessage(phoneNumber + '@c.us', chatTree[user.info.tree_pos].value);
        }
    });
}

const generarRutaRutaAnterior = () => {
    key = 'chatTree';
    keyBefore = 'chatTree';
    pos = user.info.tree_pos.split('.');
    lastPos = pos.length - 1;

    for (let i = 0; i < pos.length; i++) {
        key += "['" + pos[i] + "']";

        if (i < lastPos) {
            keyBefore = key;
        }
    }

    lastPos = pos[pos.length - 1].length === 1 ? pos[pos.length - 1] : '*';

    console.log('Llave: ' + key);
    console.log('Llave antes: ' + keyBefore);
    console.log('Validacion: ' + keyBefore + ".hasOwnProperty('" + lastPos + "')");    
}

const validarExistenciaDeRuta = () => {
    existeRuta = eval(keyBefore + ".hasOwnProperty('" + lastPos + "')");
}

const verificarExistenciaValidacion = () => {
    msgValidado = eval(key + ".hasOwnProperty('validation')");
}

const validarRespuesta = () => {
    return eval(eval(key + '.validation') + "('" + message._data.body.trim() + "')");
}

const verificarExistenciaFuncion = () => {
    return eval(key + ".hasOwnProperty('function')");
}

const ejecutarFuncion = () => {
    if (eval(key + '.type') === 'request') {
        console.log('Before promise');
        eval(eval(key + '.function') + `().then(() => {
            console.log('After promise');
            enviarMensaje();
        })`);
    } else {
        eval(eval(key + '.function') + "()");
        enviarMensaje();
    }
}

const verificarRemakeArbol = () => {
    return eval(key + ".hasOwnProperty('function')");
}

const notificiarErrorUsuario = () => {
    console.log('Sending: before');

    if (!msgValidado) {
        if (keyBefore === 'chatTree') {
            client.sendMessage(phoneNumber + '@c.us', '¡Los datos ingresados no son válidos!\n\n' + eval(keyBefore + "['0'].value"));
        } else {
            client.sendMessage(phoneNumber + '@c.us', '¡Los datos ingresados no son válidos!\n\n' + eval(keyBefore + '.value'));
        }
    } else {
        if (keyBefore === 'chatTree') {
            client.sendMessage(phoneNumber + '@c.us', '¡La opción no existe!\n\n' + eval(keyBefore + "['0'].value"));
        } else {
            client.sendMessage(phoneNumber + '@c.us', '¡La opción no existe!\n\n' + eval(keyBefore + '.value'));
        }
    }
}

const enviarMensaje = () => {
    if (verificarRemakeArbol()) {
        chatTree = createChatTree();
    }

    fs.writeFile('db/db' + phoneNumber + '.json', JSON.stringify(user), err => {
        if(err){
            console.error(err)
        } else {
            if (eval(key + ".hasOwnProperty('url')")) {
                MessageMedia.fromUrl(eval(key + '.url'))
                .then((res) => {
                    client.sendMessage(phoneNumber + '@c.us', eval(key + '.value'));
                    client.sendMessage(phoneNumber + '@c.us', res);
                });
            } else {
                client.sendMessage(phoneNumber + '@c.us', eval(key + '.value'));
            }
        }
    });

    console.log('Sending: ' + eval(key + '.value'));
}

// Validadores
const phoneNumberValidation = function(msgBody) {
    cellphoneRegex = new RegExp('^(([3]{1})([0-9]){2})([0-9]{7})$', 'g');
    phoneRegex = new RegExp('^([1-9]{1})([0-9]{6})*$', 'g');

    if (cellphoneRegex.test(msgBody) || phoneRegex.test(msgBody)) {
        return true;
    }

    return false;
}

const emailValidation = function(msgBody) {
    emailRegex = new RegExp('^([a-zA-ZñÑ0-9._-]*)([@]{1})([a-zA-ZñÑ0-9_.-]{1,})$', 'g');

    if (emailRegex.test(msgBody)) {
        return true;
    }

    return false;
}

const nameValidation = function(msgBody) {
    nameRegex = new RegExp('^([a-zA-ZñÑáéíóúÁÉÍÓÚäëïöü0-9 ]{1,})*$', 'g');

    if (nameRegex.test(msgBody)) {
        return true;
    }

    return false;
}

const personalIdValidation = function(msgBody) {
    emailRegex = new RegExp('^([1-9]{1})([0-9]{0,14})$', 'g');

    if (emailRegex.test(msgBody)) {
        return true;
    }

    return false;
}

const getTime = function() {
    return new Promise(function(resolve, reject) {
        var req = https.get('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY',function(res) {
            // reject on bad status
            if (res.statusCode < 200 || res.statusCode >= 300) {
                return reject(new Error('statusCode=' + res.statusCode));
            }

            // cumulate data
            let data = '';

            res.on('data', function(chunk) {
                data += chunk;
            });

            // resolve on end
            res.on('end', function() {
                try {
                    data = JSON.parse(data);
                    time = data.date;
                    img = data.url;

                    MessageMedia.fromUrl(img)
                    .then((res) => {
                        client.sendMessage(phoneNumber + '@c.us', res);
                    });
                } catch(e) {
                    reject(e);
                }
            });

            resolve(data);
        });
    });
}

const setNombre = function(name) {
    nombrePersona = name;
}
