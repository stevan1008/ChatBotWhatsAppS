const http = require('http');
const https = require('https');

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

module.exports = { phoneNumberValidation, emailValidation, nameValidation, personalIdValidation }
