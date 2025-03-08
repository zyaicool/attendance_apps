const Role = require('../models/roles');
const User = require('../models/users');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const redisClient = require('../config/redis_client');
const configEnv = require('../config/env_config');
const jwtSecret = configEnv.jwtSecret

exports.createUser = async(req, res) => {
    try {
        const { username, password, email, roleId } = req.body;
        created_by = 99;

        const roleIdInt = parseInt(roleId, 10);
        //validate roleId is not empty
        if (isNaN(roleIdInt)) {
            return res.status(400).json({ response_message: 'Invalid roleId' });
        }

        //check roleId value, must be 1 or 2
        if (![1, 2].includes(roleId)) {
            return res.status(400).json({ response_message: 'roleId not exist.' });
        }

        const user = await User.create({
            username,
            password,
            email,
            role_id: roleIdInt,
            created_by,
            updated_by: created_by
        });

        res.status(200).json({ response_message: "Success" });
    } catch (err) {
        res.status(500).json({ response_message: err.message });
    }
};

exports.updateUser = async(req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ where: { id: req.params.id, deleted_at: null } });
        if (!user) {
            return res.status(404).json({ response_message: 'User not found' });
        }

        updated_by = 99
        await user.update({
            email,
            updated_by
        });
        res.status(200).json({ response_message: "Success" });
    } catch (err) {
        res.status(500).json({ response_message: err.message });
    }
}

exports.deleteUser = async(req, res) => {
    try {
        const user = await User.findOne({ where: { id: req.params.id, deleted_at: null } });
        if (!user) {
            return res.status(404).json({ response_message: 'User not found' });
        }
        deleted_by = 99
        await user.update({
            deleted_at: new Date(),
            deleted_by
        });
        res.status(200).json({ response_message: 'Success' });
    } catch (error) {
        res.status(500).json({ response_message: error.message });
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
            total_records: users.count,
            total_pages: Math.ceil(users.count / limit),
            current_page: page,
            data: users.rows.map(user => ({
                id: user.id,
                username: user.username,
                email: user.email
            }))
        });
    } catch (error) {
        res.status(500).json({ response_message: error.message });
    }
};

exports.getUserById = async(req, res) => {
    try {
        const user = await User.findOne({
            where: { id: req.params.id, deleted_at: null },
            attributes: ['id', 'username', 'email'],
            include: Role
        });
        if (!user) {
            return res.status(404).json({ response_message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ response_message: error.message });
    }
};

//api for login user
exports.login = async(req, res) => {
    try {
        if (!redisClient.isOpen) {
            await redisClient.connect();
        }

        const { username, password } = req.body;

        const user = await User.findOne({ where: { username, deleted_at: null } });
        if (!user) {
            return res.status(401).json({ response_message: 'Invalid username or password' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ response_message: 'Invalid username or password' });
        }

        //generate JWT token
        if (!jwtSecret) {
            throw new Error("JWT_SECRET is not defined in the environment variables.");
        }
        const token = jwt.sign({ id: user.id, username: user.username, role_id: user.role_id },
            jwtSecret, { expiresIn: '1h' }
        );

        await redisClient.setEx(`user:${user.username}`, 86400, JSON.stringify({
            id: user.id,
            username: user.username,
            role_id: user.role_id,
            token: token,
        }));

        res.status(200).json({ jwtToken: token });
    } catch (error) {
        res.status(500).json({ response_message: error.message });
    }
};