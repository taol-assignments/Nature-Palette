const sgMail = require('@sendgrid/mail');
const config = require('../config');

sgMail.setApiKey(config.sendMail.apiKey);

module.exports = function(args) {
    sgMail.send({
        ...args,
        from: config.sendMail.from,
    })
};
