const nodemailer = require('nodemailer');
const configEnv = require('./env_config');
const emailUser = configEnv.emailUser
const emailPass = configEnv.emailPass

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: emailUser,
        pass: emailPass
    }
});

module.exports = transporter;