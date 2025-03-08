const fs = require('fs');

function readSecret(secretPath) {
    try {
        return fs.readFileSync(secretPath, 'utf8').trim();
    } catch (error) {
        console.error(`Error reading secret from ${secretPath}:`, error);
        return null;
    }
}

const config = {
    port: process.env.PORT || 3000,
    jwtSecret: readSecret(process.env.JWT_SECRET_FILE) || process.env.JWT_SECRET,
    emailUser: readSecret(process.env.EMAIL_USER_FILE) || process.env.EMAIL_USER,
    emailPass: readSecret(process.env.EMAIL_PASS_FILE) || process.env.EMAIL_PASS
};

module.exports = config;