const { sequelize, DataTypes } = require('../config/database');

const Role = sequelize.define('Role', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    role_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    tableName: 'roles',
    timestamps: false,
});

module.exports = Role;