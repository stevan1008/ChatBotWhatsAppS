const { Client, LegacySessionAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');

const SESSION_FILE_PATH = './sessions.json'
let sessionData;

const countryCode = '57'
const number = '3007300582'
const msg = 'Ingresa tu número de identifación'

if(fs.existsSync(SESSION_FILE_PATH)) {
  sessionData = require(SESSION_FILE_PATH);
}
/* const authStrategy = new LegacySessionAuth({
  session: sessionData
  session: sessionData,
  restartOnAuthFail: false
}) */

/* const client = new Client({ authStrategy }) */

const client = new Client({
  authStrategy: new LegacySessionAuth({
      session: sessionData
  })
});

client.on("qr", (qr) => {
  console.log("QR RECEIVED", qr);
  qrcode.generate(qr, {small: true})
});

client.on("ready", () => {
  console.log("Client is ready!");

  /*let chatId = countryCode + number + '@c.us'
  client.sendMessage(chatId, msg)
  .then(res => {
    if(res.id.fromMe){
      console.log('El mensaje fue enviado');
    }
  })*/
});

/* client.on('authenticated', (session) => {
  sessionData = session;

  fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), err => {
    if(err){
      console.error(err)
    }
  })
})

client.on('auth_failure', (msg) => {
  console.error('Hubo un fallo en autenticación', msg)
}) */

client.on('message', message => {
  console.log(JSON.stringify(message) + '\n\n\n');

  // Cada ciudadano tiene su número de telefono
	if(message.body === '!ping') {
		client.sendMessage(message.from, 'pong');
	} else if (message.body.toUpperCase() === 'TENGO PROBLEMAS') {
    client.sendMessage(message.from.trim(), 'Llame a la línea amiga 😎');
  }
});

client.initialize();
