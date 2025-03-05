const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('mysql://user:password@mysql:3306/attendance_apps', { dialect: 'mysql', });

sequelize.authenticate()
    .then(() => console.log('Connection successfully....'))
    .catch(err => console.error('Unable to connect to the database: ', err));

module.exports = { sequelize, DataTypes };