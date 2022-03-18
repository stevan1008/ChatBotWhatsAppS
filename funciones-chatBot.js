const fs = require('fs');
const https = require('https')
const { MessageMedia } = require('whatsapp-web.js');
const { phoneNumberValidation, emailValidation, nameValidation, personalIdValidation } = require('./validators');

var client;

/*
var argument1 = {
    myvar: "12",
    mymethod: function() { return argument1.myvar; }
}
*/

let chatTree = {}

const setClient = (appClient) => {
    client = appClient;
}

const setUser = (appUser) => {
    user = appUser;
}

const setPhoneNumber = (appPhoneNumber) => {
    phoneNumber = appPhoneNumber;
}

const setMessage = (appMessage) => {
    message = appMessage;
}

const setMsgValidado = (appMsgValidado) => {
    msgValidado = appMsgValidado;
}

const createChatTree = (phoneNumber, nombrePersona, time) => {
    console.log('MAKING TREE...');
    let chatTree = {};

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
    chatTree['5']['*'] = {value: `Ingresa tu cédula ${nombrePersona}:`, validation: 'nameValidation', function: 'setNombre', params: true, remakeTree: true};
    chatTree['5']['*']['*'] = {value: "Ingresa tu correo:", validation: 'personalIdValidation'};
    chatTree['5']['*']['*']['*'] = {value: "Ingresa tu móvil / teléfono:", validation: 'emailValidation'};
    chatTree['5']['*']['*']['*']['*'] = {value: `Gracias por la información ${nombrePersona}. La cuidaremos bien por ti.`, validation: 'phoneNumberValidation'};

    chatTree['6'] = {value: `La fecha y hora actual es ${time}`, function: 'getTime', type: 'request', remakeTree: true};

    chatTree['7'] = {value: `${phoneNumber}`, remakeTree: true};
    chatTree['7']['7'] = {value: `${phoneNumber}`, remakeTree: true};
    chatTree['7']['7']['7'] = {value: `${phoneNumber}`, remakeTree: true};
    chatTree['7']['7']['7']['7'] = {value: `${phoneNumber}`, remakeTree: true};
    chatTree['7']['7']['7']['7']['7'] = {value: `${phoneNumber}`, remakeTree: true};

    return chatTree;
}

const enviarMensajePrimeraVez = (phoneNumberx, userx) => {
    fs.writeFile('./db/db' + phoneNumberx + '.json', JSON.stringify(userx), err => {
        if(err){
            console.error(err)
        } else {
            console.log('Sending: ' + chatTree[user.info.tree_pos].value);
            client.sendMessage(phoneNumberx + '@c.us', chatTree[user.info.tree_pos].value);
        }
    });
}

const generarRutaRutaAnterior = (user) => {
    let key = 'chatTree';
    let keyBefore = 'chatTree';
    let pos = user.info.tree_pos.split('.');
    let lastPos = pos.length - 1;

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

    return {'key': key, 'keyBefore': keyBefore};
}

const validarExistenciaDeRuta = (chartTree, user, keyBefore) => {
    let pos = user.info.tree_pos.split('.');
    let lastPos = pos.length - 1;

    return eval(keyBefore + ".hasOwnProperty('" + lastPos + "')");
}

const verificarExistenciaValidacion = (chartTree, key) => {
    return eval(key + ".hasOwnProperty('validation')");
}

const validarRespuesta = (chartTree, key, message) => {
    return eval(eval(key + '.validation') + "('" + message._data.body.trim() + "')");
}

const verificarExistenciaFuncion = (chartTree, key) => {
    return eval(key + ".hasOwnProperty('function')");
}

const verificarExistenciaParametros = (chartTree, key) => {
    return eval(key + ".hasOwnProperty('params')");
}

const ejecutarFuncion = (chartTree, key, phoneNumber, param) => {
    if (eval(key + '.type') === 'request') {
        console.log('Before promise');
        if (verificarExistenciaParametros(chartTree, key)) {
            eval(eval(key + '.function') + `('${param}').then((resp) => {
                console.log('After promise');
                enviarMensaje(chartTree, key, phoneNumber);
            })`);
        } else {
            eval(eval(key + '.function') + `().then((resp) => {
                console.log('After promise');
                enviarMensaje(chartTree, key, phoneNumber);
            })`);
        }
    } else {
        if (verificarExistenciaParametros(chartTree, key)) {
            eval(eval(key + '.function') + "('" + param + "')");
            enviarMensaje(chartTree, key, phoneNumber);
        } else {
            eval(eval(key + '.function') + "()");
            enviarMensaje(chartTree, key, phoneNumber);
        }
    }
}

const verificarRemakeArbol = (key) => {
    return eval(key + ".hasOwnProperty('function')");
}

const notificiarErrorUsuario = (chartTree, keyBefore, msgValidado) => {
    console.log('Sending: before');

    if (msgValidado) {
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

const enviarMensaje = (chartTreeIn, key, phoneNumber) => {
    let chartTree = chartTreeIn;

    if (verificarRemakeArbol(key)) {
        chartTree = createChatTree();
    }

    fs.writeFile('db/db' + phoneNumber + '.json', JSON.stringify(user), err => {
        if(err){
            console.error(err)
        } else {
            console.log('Sending: ' + eval(key + '.value'));

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
}

const getTime = function() {
    return new Promise(function(resolve, reject) {
        https.get('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY',function(res) {
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

                    resolve(data);

                    MessageMedia.fromUrl(img)
                    .then((res) => {
                        client.sendMessage(phoneNumber + '@c.us', res);
                    });
                } catch(e) {
                    reject(e);
                }
            });
        });
    });
}

const setNombre = (nombre) => {
    nombrePersona = nombre;
}

module.exports = { funcionesChatBot }