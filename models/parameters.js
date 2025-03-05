const { sequelize, DataTypes } = require('../config/database');
const Parameter = sequelize.define('Parameter', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    parameter_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    parameter_value: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    created_by: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    updated_by: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    deleted_by: {
        type: DataTypes.STRING,
        allowNull: true,
    }
}, {
    tableName: 'parameters',
    timestamps: false,
});

module.exports = Parameter;