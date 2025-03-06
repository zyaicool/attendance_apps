const Role = require('../models/roles');
const User = require('../models/users')
const bcrypt = require('bcryptjs');

exports.createUser = async(req, res) => {
    try {
        const { username, password, email, roleId } = req.body;
        created_by = 99;

        const roleIdInt = parseInt(roleId, 10);
        //validate roleId is not empty
        if (isNaN(roleIdInt)) {
            return res.status(400).json({ responseMessage: 'Invalid roleId' });
        }

        //process hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        //check roleId value, must be 1 or 2
        if (![1, 2].includes(roleId)) {
            return res.status(400).json({ responseMessage: 'roleId not exist.' });
        }

        const user = await User.create({
            username,
            password: hashedPassword,
            email,
            role_id: roleIdInt,
            created_by,
            updated_by: created_by
        });

        res.status(200).json({ responseMessage: "Success" });
    } catch (err) {
        res.status(500).json({ responseMessage: err.message });
    }
};

exports.updateUser = async(req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ where: { id: req.params.id, deleted_at: null } });
        if (!user) {
            return res.status(404).json({ responseMessage: 'User not found' });
        }

        updated_by = 99
        await user.update({
            email,
            updated_by
        });
        res.status(200).json({ responseMessage: "Success" });
    } catch (err) {
        res.status(500).json({ responseMessage: err.message });
    }
}

exports.deleteUser = async(req, res) => {
    try {
        const user = await User.findOne({ where: { id: req.params.id, deleted_at: null } });
        if (!user) {
            return res.status(404).json({ responseMessage: 'User not found' });
        }
        deleted_by = 99
        await user.update({
            deleted_at: new Date(),
            deleted_by
        });
        res.status(200).json({ responseMessage: 'Success' });
    } catch (error) {
        res.status(500).json({ responseMessage: error.message });
    }
};

exports.getUsers = async(req, res) => {
    try {
        let { page, limit, search } = req.query;
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;
        const offset = (page - 1) * limit;

        const whereClause = { deleted_at: null };
        if (search) {
            whereClause.username = {
                [Op.like]: `%${search}%`
            };
        }

        const users = await User.findAndCountAll({
            where: whereClause,
            attributes: ['id', 'username', 'email'],
            limit,
            offset
        });

        res.status(200).json({
            total: users.count,
            page,
            limit,
            users: users.rows.map(user => ({
                id: user.id,
                username: user.username,
                email: user.email
            }))
        });
    } catch (error) {
        res.status(500).json({ responseMessage: error.message });
    }
};

exports.getUserById = async(req, res) => {
    try {
        const user = await User.findOne({
            where: { id: req.params.id, deleted_at: null },
            include: Role
        });
        if (!user) {
            return res.status(404).json({ responseMessage: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ responseMessage: error.message });
    }
};