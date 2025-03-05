const { sequelize } = require('../config/database');
const Role = require('../models/roles');
const User = require('../models/users');
const Attendance = require('../models/attendances');
const Parameter = require('../models/parameters');

async function syncDatabase() {
    try {
        console.log('Syncing database...');
        await sequelize.sync({ force: false });
        console.log('Database synced successfully!');
        await insertDataRoles();
        console.log('Data role successfully insert!');
    } catch (error) {
        console.error('Error syncing database:', error);
    }
}

async function insertDataRoles() {
    try {
        const roles = [
            { id: 1, role_name: 'admin' },
            { id: 2, role_name: 'user' }
        ];

        for (const role of roles) {
            const [existRole, created] = await Role.findOrCreate({
                where: { id: role.id },
                defaults: role
            });

            if (created) {
                console.log(`Role "${role.role_name}" created successfully.`);
            } else {
                console.log(`Role "${role.role_name}" already exists.`);
            }
        }
    } catch (error) {
        console.error('Error inserting initial roles:', error);
    }
}

module.exports = syncDatabase;