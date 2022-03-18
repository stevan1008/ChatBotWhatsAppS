const qrcode = require('qrcode-terminal');
const { Client } = require('whatsapp-web.js');
const fs = require('fs');
const { stringify } = require('querystring');
const { Console } = require('console');

const SESSION_FILE_PATH = './sessions.json'
let sessionData;

let phoneNumber = "573045293034@c.us"


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
/*         const chat = await client.getChatById(phoneNumber)
        .then((chat) => chat[0].fetchMessages())
        .then(msg => console.log(msg)) */
/*         const chat = await client.getChatById(phoneNumber);
        console.log("Chat info: ", chat); */
        /*const messages = await */
/*         client.getChatById(phoneNumber)    FUNCIONA!!!
        .then(chat => {
            chat.fetchMessages()
            .then(msgs => console.log(msgs))
        }) */


/*         const chats = await client.getChatById(phoneNumber);
        const messages = await chats.fetchMessages(); */
        //console.log(messages);

        /*for (const msg of messages) {
            console.log(msg._data.body);
        }*/
    
        //console.log(messages);

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

client.on('message', message => {
    //console.log(JSON.stringify(message));
  
    // Cada ciudadano tiene su número de telefono
/*       if(message.body === '!ping') {
          client.sendMessage(message.from, 'pong');
      } else if (message.body.toUpperCase() === 'TENGO PROBLEMAS') {
      client.sendMessage(message.from.trim(), 'Llame a la línea amiga 😎');
    } */

    /*if(message.body === '1'){
        client.sendMessage(message.from.trim(), 'A) en SPA \n B) TM \n C) VIOLENCIA \n D) SUICIDIO')
    } else if (message.body === '2') {
        client.sendMessage(message.from.trim(), 'Link del consentimiento' )
    } else if (message.body === '3') {
        client.sendMessage(message.from.trim(), 'Si desea ser contactado por un profesional por favor digite el número: "11", de lo contrario digite el número: "22"')
        if (message.body === '11') {
            client.sendMessage(message.from.trim(), 'Denos su número télefonico')
        } else {
            client.sendMessage(message.form.trim(), 'Las siguientes opciones: \n 1. Desea obtener informacion? \n 2. Desea participar encuenta? \n 3. Necesita ayuda?')
        }
    } else {
        client.sendMessage(message.form.trim(), 'Las siguientes opciones: \n 1. Desea obtener informacion? \n 2. Desea participar encuenta? \n 3. Necesita ayuda?')
    }*/

    let phoneNumber = message._data.from.split('@')[0];
    let user = null;

    console.log('New msg from ' + phoneNumber);

    fs.readFile('db/db' + phoneNumber + '.json', 'utf8', (err, data) => {
        // Lectura - escritura de la base
        console.log('Reading DB');
        
        if (err) {
            console.log('Creating DB');
            user = {"phone_number":phoneNumber,"info":{"tree_pos":"0","first_time":1}};

            fs.writeFile('db/db' + phoneNumber + '.json', JSON.stringify(user), err => {
                if(err){
                    console.error(err)
                } else {
                    chatbot(user, phoneNumber, message);
                }
            });
        } else {
            user = JSON.parse(data);
            chatbot(user, phoneNumber, message);
        }
    });
});

const chatbot = (user, phoneNumber, message) => {
    let chatTree = {};

    chatTree['0'] = {value: 'Bienvenido a Nariño AISM\n¿En qué te podemos ayudar?\n\n1) ¿Desea obtener información?\n2) ¿Desea particiar en nuestra encuesta?\n3) ¿Necesita ayuda?'};

    chatTree['1'] = {value: '1) Sustancias Psicoactivas \n 2) Transtornos mentales \n 3) Violencia \n 4) Suicidio'};
    chatTree['1']['1'] = {value: "Sustancias Psicoactivas: Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged."};
    chatTree['1']['2'] = {value: "Transtornos mentales: Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged."};
    chatTree['1']['3'] = {value: "Violencia: Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged."};
    chatTree['1']['4'] = {value: "Suicidio: Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged."};

    chatTree['2'] = {value: 'https://www.idsn.gov.co/'};

    chatTree['3'] = {value: '¿Necesita ayuda?\n1) Si\n2)No'};
    chatTree['3']['1'] = {value: 'Denos su número telefónico'};
    chatTree['3']['1']['*'] = {value: 'Pronto lo llamaremos'};
    chatTree['3']['2'] = {value: 'Gracias por contactarnos'};

    // Logica del chatbot
    if (+user.info.first_time === 1) {
        user.info.first_time = 0;
        
        fs.writeFile('db/db' + phoneNumber + '.json', JSON.stringify(user), err => {
            if(err){
                console.error(err)
            } else {
                console.log('Sending: ' + chatTree[user.info.tree_pos].value);
                client.sendMessage(phoneNumber + '@c.us', chatTree[user.info.tree_pos].value);
            }
        });
    } else {
        if (user.info.tree_pos === '0') {
            user.info.tree_pos = message._data.body.trim();
        } else {
            user.info.tree_pos += '.' + message._data.body.trim();
        }

        fs.writeFile('db/db' + phoneNumber + '.json', JSON.stringify(user), err => {
            if(err){
                console.error(err)
            } else {
                let key = 'chatTree';
                let keyBefore = 'chatTree';
                let pos = user.info.tree_pos.split('.');
                let lastPos = pos.length - 1;

                for (let i = 0; i < pos.length; i++) {
                    if (pos[i].length === 1 && /^-?\d+$/.test(pos[i])) {
                        key += '[' + pos[i] + ']';

                        if (i < lastPos) {
                            keyBefore = key;
                        }
                    } else {
                        key += "['*']";

                        if (i < lastPos) {
                            keyBefore = key;
                        }
                    }
                }

                lastPos = pos[pos.length - 1].length === 1 ? pos[pos.length - 1] : '*';

                console.log('Llave: ' + key);
                console.log('Llave antes: ' + keyBefore);
                console.log('Validacion: ' + keyBefore + ".hasOwnProperty('" + lastPos + "')");

                if (eval(keyBefore + ".hasOwnProperty('" + lastPos + "')")) {
                    console.log('Sending: ' + eval(key + '.value'));
                    client.sendMessage(phoneNumber + '@c.us', eval(key + '.value'));
                } else {
                    console.log('Sending: before');

                    let userPos = user.info.tree_pos.split('.');
                    let lastUserPos = '';

                    if (userPos.length > 1) {
                        for (let i = 0; i < userPos.length - 1; i++) {
                            if (lastUserPos === '') {
                                lastUserPos = userPos[i];
                            } else {
                                lastUserPos += '.' + userPos[i];
                            }
                        }
                    } else {
                        lastUserPos = '0';
                    }

                    user.info.tree_pos = lastUserPos;

                    console.log('Last user pos: ' + lastUserPos);
                    console.log('New tree: ' + user.info.tree_pos);

                    fs.writeFile('db/db' + phoneNumber + '.json', JSON.stringify(user), err => {
                        if(err){
                            console.error(err)
                        } else {
                            if (keyBefore === 'chatTree') {
                                client.sendMessage(phoneNumber + '@c.us', '¡La opción no existe!\n\n' + eval(keyBefore + "['0'].value"));
                            } else {
                                client.sendMessage(phoneNumber + '@c.us', '¡La opción no existe!\n\n' + eval(keyBefore + '.value'));
                            }
                        }
                    });
                }
            }

            console.log('\n\n\n\n');
        });
    }
}

client.initialize();