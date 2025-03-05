const { sequelize, DataTypes } = require('../config/database');
const User = require('../models/users');

const Attendance = sequelize.define('Attendance', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    clockin: {
        type: DataTypes.TIME,
        allowNull: true,
    },
    clockout: {
        type: DataTypes.TIME,
        allowNull: true,
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
    tableName: 'attendances',
    timestamps: false,
});


Attendance.belongsTo(User, { foreignKey: 'user_id', targetKey: 'id' });
User.hasMany(Attendance, { foreignKey: 'user_id', sourceKey: 'id' });

module.exports = Attendance;