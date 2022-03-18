const fs = require('fs');
const https = require('https')
const { MessageMedia } = require('whatsapp-web.js');
const { phoneNumberValidation, emailValidation, nameValidation, personalIdValidation } = require('./validators');

const fcb = () => {
    return funcionesChatBot = {
        client: undefined,
        chatTree: undefined,
        user: undefined,
        phoneNumber: undefined,
        message: undefined,
        msgValidado: undefined,
        key: undefined,
        keyBefore: undefined,
        pos: undefined,
        lastPos: undefined,
        nombrePersona: undefined,
        time: undefined,

        setClient: (client) => {
            funcionesChatBot.client = client;
        },

        setUser: (user) => {
            funcionesChatBot.user = user;
        },

        setPhoneNumber: (phoneNumber) => {
            funcionesChatBot.phoneNumber = phoneNumber;
        },

        setMessage: (message) => {
            funcionesChatBot.message = message;
        },

        setMsgValidado: (msgValidado) => {
            msgVafuncionesChatBot.lidado = msgValidado;
        },

        createChatTree: () => {
            console.log('MAKING TREE...');
            funcionesChatBot.chatTree = {};

            funcionesChatBot.chatTree['0'] = {value: 'Bienvenido a Nariño AISM\n¿En qué te podemos ayudar?\n\n1) ¿Desea obtener información? 📚\n2) ¿Desea particiar en nuestra encuesta? 📋\n3) ¿Necesita ayuda? 🤝\n4) Prueba capacidad ChatBot 🧪 \n5) Prueba \n6) Prueba con asincronía (peticiones) 🤯 \n\nEnvie @ en cualquier momento para volver al inicio'};

            funcionesChatBot.chatTree['1'] = {value: '1) Sustancias Psicoactivas \n2) Transtornos mentales \n3) Violencia \n4) Suicidio'};
            funcionesChatBot.chatTree['1']['1'] = {value: "Sustancias Psicoactivas: Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. \n\n@) Volver al inicio"};
            funcionesChatBot.chatTree['1']['2'] = {value: "Transtornos mentales: Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. \n\n@) Volver al inicio"};
            funcionesChatBot.chatTree['1']['3'] = {value: "Violencia: Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. \n\n@) Volver al inicio"};
            funcionesChatBot.chatTree['1']['4'] = {value: "Suicidio: Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. \n\n@) Volver al inicio"};

            funcionesChatBot.chatTree['2'] = {value: 'https://www.idsn.gov.co/ \n\n@) Volver al inicio'};

            funcionesChatBot.chatTree['3'] = {value: '¿Necesita ayuda?\n1) Si\n2) No \n@) Vovler al inicio'};
            funcionesChatBot.chatTree['3']['1'] = {value: 'Denos su número telefónico o móvil sin el indicativo nacional'};
            funcionesChatBot.chatTree['3']['1']['*'] = {value: 'Pronto lo llamaremos', validation: 'phoneNumberValidation'};
            funcionesChatBot.chatTree['3']['2'] = {value: 'Gracias por contactarnos'};

            funcionesChatBot.chatTree['4'] = {value: `Hola ${funcionesChatBot.phoneNumber}, soy el ChatBot y estas rutas se pueden definir dinámicamente. \n\n1) Ver ruta 1  \n2) Ver ruta 2 \n3) Ver ruta 3 \n4) Ver ruta 4`};
            funcionesChatBot.chatTree['4']['1'] = {value: 'Entraste a la ruta 1. Te voy a pedir un número telefónico:', type: 'number'};
            funcionesChatBot.chatTree['4']['1']['*'] = {value: 'Ahora te voy a pedir un correo:', type: 'email'};
            funcionesChatBot.chatTree['4']['1']['*']['*'] = {value: '¿Deseas que en un futuro te contactemos? \n\n 1) Si \n 2) No'};
            funcionesChatBot.chatTree['4']['1']['*']['*']['1'] = {value: `Pronto te contáctaremos, gracias por tu tiempo ${funcionesChatBot.phoneNumber}`};
            funcionesChatBot.chatTree['4']['1']['*']['*']['2'] = {value: `No hay problema, gracias por tu tiempo ${funcionesChatBot.phoneNumber}`};
            funcionesChatBot.chatTree['4']['2'] = {value: 'Entraste a la ruta 2. Te voy a enviar un enlace https://wwebjs.dev/guide/ \n\n ¿Fue útil esta información? \n 1) Si \n 2) No'};
            funcionesChatBot.chatTree['4']['2']['1'] = {value: `Nos alegra mucho, gracias por tu tiempo ${funcionesChatBot.phoneNumber}`};
            funcionesChatBot.chatTree['4']['2']['2'] = {value: `Estamos en constante mejora, gracias por tu tiempo ${funcionesChatBot.phoneNumber}`};
            funcionesChatBot.chatTree['4']['3'] = {value: `Esta ruta te va a enviar una imagen ${funcionesChatBot.phoneNumber}`, url: 'https://d1yjjnpx0p53s8.cloudfront.net/styles/logo-thumbnail/s3/122012/instituto_deptal_salud.png'};
            funcionesChatBot.chatTree['4']['4'] = {value: `Esta ruta te va a enviar un pdf ${funcionesChatBot.phoneNumber}`, url: 'http://idsn.gov.co/site/web2/images/edocs/inf_gestion_1er_semestre2015.pdf'};

            funcionesChatBot.chatTree['5'] = {value: "Ruta prueba 1. \nIngresa tu nombre:"};
            funcionesChatBot.chatTree['5']['*'] = {value: `Ingresa tu cédula ${funcionesChatBot.nombrePersona}:`, validation: 'nameValidation', function: 'setNombre', type: 'request', params: true, remakeTree: true};
            funcionesChatBot.chatTree['5']['*']['*'] = {value: "Ingresa tu correo:", validation: 'personalIdValidation'};
            funcionesChatBot.chatTree['5']['*']['*']['*'] = {value: "Ingresa tu móvil / teléfono:", validation: 'emailValidation'};
            funcionesChatBot.chatTree['5']['*']['*']['*']['*'] = {value: `Gracias por la información ${funcionesChatBot.nombrePersona}. La cuidaremos bien por ti.`, validation: 'phoneNumberValidation', function: 'getNombre', type: 'request', remakeTree: true};

            funcionesChatBot.chatTree['6'] = {value: `La fecha y hora actual es ${funcionesChatBot.time}`, function: 'getTime', type: 'request', remakeTree: true};

            funcionesChatBot.chatTree['7'] = {value: `${funcionesChatBot.phoneNumber}`, remakeTree: true};
            funcionesChatBot.chatTree['7']['7'] = {value: `${funcionesChatBot.phoneNumber}`, remakeTree: true};
            funcionesChatBot.chatTree['7']['7']['7'] = {value: `${funcionesChatBot.phoneNumber}`, remakeTree: true};
            funcionesChatBot.chatTree['7']['7']['7']['7'] = {value: `${funcionesChatBot.phoneNumber}`, remakeTree: true};
            funcionesChatBot.chatTree['7']['7']['7']['7']['7'] = {value: `${funcionesChatBot.phoneNumber}`, remakeTree: true};
        },

        enviarMensajePrimeraVez: () => {
            fs.writeFile('./db/db' + funcionesChatBot.phoneNumber + '.json', JSON.stringify(funcionesChatBot.user), err => {
                if(err){
                    console.error(err)
                } else {
                    console.log('Sending: ' + funcionesChatBot.chatTree[funcionesChatBot.user.info.tree_pos].value);
                    funcionesChatBot.client.sendMessage(funcionesChatBot.phoneNumber + '@c.us', funcionesChatBot.chatTree[funcionesChatBot.user.info.tree_pos].value);
                }
            });
        },

        generarRutaRutaAnterior: () => {
            funcionesChatBot.key = 'funcionesChatBot.chatTree';
            funcionesChatBot.keyBefore = 'funcionesChatBot.chatTree';
            funcionesChatBot.pos = funcionesChatBot.user.info.tree_pos.split('.');
            funcionesChatBot.lastPos = funcionesChatBot.pos.length - 1;

            for (let i = 0; i < funcionesChatBot.pos.length; i++) {
                funcionesChatBot.key += "['" + funcionesChatBot.pos[i] + "']";

                if (i < funcionesChatBot.lastPos) {
                    funcionesChatBot.keyBefore = funcionesChatBot.key;
                }
            }

            funcionesChatBot.lastPos = funcionesChatBot.pos[funcionesChatBot.pos.length - 1].length === 1 ? funcionesChatBot.pos[funcionesChatBot.pos.length - 1] : '*';

            console.log('Llave: ' + funcionesChatBot.key);
            console.log('Llave antes: ' + funcionesChatBot.keyBefore);
            console.log('Validacion: ' + funcionesChatBot.keyBefore + ".hasOwnProperty('" + funcionesChatBot.lastPos + "')");    
        },

        validarExistenciaDeRuta: () => {
            return eval(funcionesChatBot.keyBefore + ".hasOwnProperty('" + funcionesChatBot.lastPos + "')");
        },

        verificarExistenciaValidacion: () => {
            return eval(funcionesChatBot.key + ".hasOwnProperty('validation')");
        },

        validarRespuesta: () => {
            return eval(eval(funcionesChatBot.key + '.validation') + "('" + funcionesChatBot.message._data.body.trim() + "')");
        },

        verificarExistenciaFuncion: () => {
            return eval(funcionesChatBot.key + ".hasOwnProperty('function')");
        },

        verificarExistenciaParametros: () => {
            return eval(funcionesChatBot.key + ".hasOwnProperty('params')");
        },

        ejecutarFuncion: (param) => {
            if (eval(funcionesChatBot.key + '.type') === 'request') {
                console.log('Before promise');
                if (funcionesChatBot.verificarExistenciaParametros()) {
                    eval('funcionesChatBot.' + eval(funcionesChatBot.key + '.function') + `('${param}').then((resp) => {
                        console.log('After promise');
                        funcionesChatBot.enviarMensaje();
                    })`);
                } else {
                    eval('funcionesChatBot.' + eval(funcionesChatBot.key + '.function') + `().then((resp) => {
                        console.log('After promise');
                        funcionesChatBot.enviarMensaje();
                    })`);
                }
            } else {
                if (funcionesChatBot.verificarExistenciaParametros()) {
                    eval('funcionesChatBot.' + eval(funcionesChatBot.key + '.function') + "('" + param + "')");
                    funcionesChatBot.enviarMensaje();
                } else {
                    eval('funcionesChatBot.' + eval(key + '.function') + "()");
                    funcionesChatBot.enviarMensaje();
                }
            }
        },

        verificarRemakeArbol: () => {
            return eval(funcionesChatBot.key + ".hasOwnProperty('function')");
        },

        notificiarErrorUsuario: () => {
            console.log('Sending: before');

            if (funcionesChatBot.msgValidado) {
                if (funcionesChatBot.keyBefore === 'funcionesChatBot.chatTree') {
                    funcionesChatBot.client.sendMessage(funcionesChatBot.phoneNumber + '@c.us', '¡Los datos ingresados no son válidos!\n\n' + eval(funcionesChatBot.keyBefore + "['0'].value"));
                } else {
                    funcionesChatBot.client.sendMessage(funcionesChatBot.phoneNumber + '@c.us', '¡Los datos ingresados no son válidos!\n\n' + eval(funcionesChatBot.keyBefore + '.value'));
                }
            } else {
                if (funcionesChatBot.keyBefore === 'funcionesChatBot.chatTree') {
                    funcionesChatBot.client.sendMessage(funcionesChatBot.phoneNumber + '@c.us', '¡La opción no existe!\n\n' + eval(funcionesChatBot.keyBefore + "['0'].value"));
                } else {
                    funcionesChatBot.client.sendMessage(funcionesChatBot.phoneNumber + '@c.us', '¡La opción no existe!\n\n' + eval(funcionesChatBot.keyBefore + '.value'));
                }
            }
        },

        enviarMensaje: () => {
            if (funcionesChatBot.verificarRemakeArbol()) {
                funcionesChatBot.chartTree = funcionesChatBot.createChatTree();
            }

            fs.writeFile('db/db' + funcionesChatBot.phoneNumber + '.json', JSON.stringify(funcionesChatBot.user), err => {
                if(err){
                    console.error(err)
                } else {
                    console.log('Sending: ' + eval(funcionesChatBot.key + '.value'));

                    if (eval(funcionesChatBot.key + ".hasOwnProperty('url')")) {
                        MessageMedia.fromUrl(eval(funcionesChatBot.key + '.url'))
                        .then((res) => {
                            funcionesChatBot.client.sendMessage(funcionesChatBot.phoneNumber + '@c.us', eval(funcionesChatBot.key + '.value'));
                            funcionesChatBot.client.sendMessage(funcionesChatBot.phoneNumber + '@c.us', res);
                        });
                    } else {
                        funcionesChatBot.client.sendMessage(funcionesChatBot.phoneNumber + '@c.us', eval(funcionesChatBot.key + '.value'));
                    }
                }
            });
        },

        getTime: () => {
            return new Promise(function(resolve, reject) {
                https.get('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY', function(res) {
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
                            funcionesChatBot.time = data.date;
                            img = data.url;

                            resolve(data);

                            MessageMedia.fromUrl(img)
                            .then((res) => {
                                funcionesChatBot.client.sendMessage(funcionesChatBot.phoneNumber + '@c.us', res);
                            });
                        } catch(e) {
                            reject(e);
                        }
                    });
                });
            });
        },

        setNombre: (nombre) => {
            return new Promise(function(resolve, reject) {
                fs.readFile('./db/db' + funcionesChatBot.phoneNumber + '.json', (err, data) => {
                    console.log('Reading DB');
                    
                    if (err) {
                        console.log(err);
                        return reject(new Error(err));
                    } else {
                        let userAux = JSON.parse(data);

                        funcionesChatBot.user = {
                            "phone_number": funcionesChatBot.phoneNumber,
                            "info": {
                                "tree_pos": userAux.info.tree_pos + '.*',
                                "first_time": userAux.info.first_time
                            },
                            "name": nombre
                        };

                        funcionesChatBot.nombrePersona = nombre;

                        fs.writeFile('./db/db' + funcionesChatBot.phoneNumber + '.json', JSON.stringify(funcionesChatBot.user), err => {
                            if(err){
                                return reject(new Error(err));
                            } else {
                                resolve();
                            }
                        });
                    }
                });
            });
        },

        getNombre: () => {
            return new Promise(function(resolve, reject) {
                fs.readFile('./db/db' + funcionesChatBot.phoneNumber + '.json', (err, data) => {
                    console.log('Reading DB');
                    
                    if (err) {
                        console.log(err);
                        return reject(new Error(err));
                    } else {
                        let userAux = JSON.parse(data);
                        funcionesChatBot.nombrePersona = userAux.name;
                        resolve(userAux.name);
                    }
                });
            });
        }
    };
}

module.exports = { fcb }