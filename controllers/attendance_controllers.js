const redisClient = require('../config/redis_client');
const Attendance = require('../models/attendances');
const moment = require('moment-timezone');
const esClient = require('../config/elastic_client');
const transporter = require('../config/mail_client');
const configEnv = require('../config/env_config');
const User = require('../models/users')
const emailUser = configEnv.emailUser


exports.clockin = async(req, res) => {
    try {

        if (!req.user || !req.user.id) {
            return res.status(401).json({ response_message: 'Invalid token or user ID not found' });
        }
        const userId = req.user.id;
        const username = req.user.username

        const today = moment().tz('Asia/Jakarta').format('YYYY-MM-DD');
        const clockInTime = moment().tz('Asia/Jakarta').format('HH:mm:ss');

        const existingAttendance = await Attendance.findOne({ where: { user_id: userId, date: today, deleted_at: null } });

        if (existingAttendance) {
            return res.status(400).json({ response_message: 'User has already clocked in today' });
        }

        const newAttendance = await Attendance.create({
            date: today,
            user_id: userId,
            clockin: clockInTime,
            created_by: userId,
            updated_by: userId
        });

        await redisClient.setEx(`clockin:${userId}`, 86400, JSON.stringify({
            id: newAttendance.id,
            date: today,
            user_id: userId,
            username: username,
            clockin: clockInTime
        }));

        await esClient.index({
            index: 'attendance',
            id: `clockin-${userId}-${today}`,
            body: {
                id: newAttendance.id,
                user_id: userId,
                username: username,
                date: today,
                clockin: clockInTime,
                clockout: null
            }
        });

        res.status(200).json({ response_message: 'Clock-in successful' });
    } catch (error) {
        res.status(500).json({ response_message: error.message });
    }
};

exports.clockout = async(req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ response_message: 'Invalid token or user ID not found' });
        }

        const userId = req.user.id;
        const today = moment().tz('Asia/Jakarta').format('YYYY-MM-DD');
        const clockOutTime = moment().tz('Asia/Jakarta').format('HH:mm:ss');

        const clockinData = await redisClient.get(`clockin:${userId}`);
        if (!clockinData) {
            return res.status(400).json({ response_message: 'User has not clocked in today' });
        }

        const parsedClockin = JSON.parse(clockinData);

        const attendance = await Attendance.findOne({
            where: { id: parsedClockin.id, user_id: userId, date: today, deleted_at: null }
        });

        if (!attendance) {
            return res.status(404).json({ response_message: 'Clock-in record not found' });
        }

        if (attendance.clockout) {
            return res.status(400).json({ response_message: 'User has already clocked out today' });
        }

        await Attendance.update({ clockout: clockOutTime, updated_by: userId }, { where: { id: attendance.id } });

        await redisClient.setEx(`clockin:${userId}`, 86400, JSON.stringify({
            id: attendance.id,
            date: today,
            user_id: userId,
            username: username,
            clockin: parsedClockin.clockin,
            clockout: clockOutTime
        }));

        await esClient.update({
            index: 'attendance',
            id: `clockin-${userId}-${today}`,
            body: {
                doc: { clockout: clockOutTime }
            }
        });

        res.status(200).json({ response_message: 'Clock-out successful' });

    } catch (error) {
        res.status(500).json({ response_message: error.message });
    }
};

exports.getAttendanceRecords = async(req, res) => {
    try {
        const { user_id, date } = req.query;
        if (!user_id || !date) {
            return res.status(400).json({ response_message: 'Both user_id and date are required' });
        }

        const userIdInt = parseInt(user_id, 10);
        if (isNaN(userIdInt)) {
            return res.status(400).json({ response_message: 'Invalid user_id format' });
        }

        const indexExists = await esClient.indices.exists({ index: 'attendance' });
        if (!indexExists) {
            return res.status(404).json({ response_message: 'Attendance index does not exist' });
        }

        const response = await esClient.search({
            index: 'attendance',
            body: {
                query: {
                    bool: {
                        must: [
                            { match: { "user_id": userIdInt } },
                            { range: { "date": { "gte": date, "lte": date } } }
                        ]
                    }
                }
            }
        });
        console.log('Elasticsearch Response: ', response)
        if (!response.body.hits || response.body.hits.hits.length === 0) {
            return res.status(404).json({ response_message: 'No attendance records found' });
        }

        const records = response.body.hits.hits.map(hit => hit._source);

        res.status(200).json({ response_message: 'Success', data: records });
    } catch (error) {
        if (error.meta && error.meta.body && error.meta.body.error.type === 'index_not_found_exception') {
            return res.status(404).json({ response_message: 'Attendance index does not exist' });
        }

        res.status(500).json({ response_message: error.message });
    }
};


exports.getListAttendance = async(req, res) => {
    try {
        let { page, limit, search, date } = req.query;
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;
        const offset = (page - 1) * limit;

        let whereCondition = {};
        if (date) {
            whereCondition.date = date;
        }

        const attendances = await Attendance.findAndCountAll({
            where: whereCondition,
            include: [{
                model: User,
                attributes: ['id', 'username'], // Select relevant fields
                where: search ? {
                        username: {
                            [Op.like]: `%${search}%`
                        }
                    } // Search by username
                    :
                    {}
            }],
            limit,
            offset
        });

        res.status(200).json({
            total_records: attendances.count,
            total_pages: Math.ceil(attendances.count / limit),
            current_page: page,
            data: attendances.rows
        });
    } catch (error) {
        res.status(500).json({ response_message: error.message });
    }
};

exports.checkAndNotifyMissingClockins = async(req, res) => {
    try {
        const users = await User.findAll({ attributes: ['id', 'username', 'email'] });
        const today = moment().tz('Asia/Jakarta').format('YYYY-MM-DD');

        let usersNotClockedIn = [];

        for (const user of users) {
            const redisKey = `clockin:${user.id}`;
            const clockinData = await redisClient.get(redisKey);

            if (!clockinData) {
                // User has NOT clocked in today
                usersNotClockedIn.push({ username: user.username, email: user.email });
            }
        }

        if (usersNotClockedIn.length > 0) {
            for (const user of usersNotClockedIn) {
                await transporter.sendMail({
                    from: emailUser,
                    to: user.email,
                    subject: "Clock-in Reminder",
                    text: `Hi ${user.username},\n\nYou have not clocked in today (${today}). Please clock in as soon as possible.\n\nThank you.`
                });
            }
        }

        res.status(200).json({
            response_message: `Checked all users. Emails sent to ${usersNotClockedIn.length} users who haven't clocked in.`,
            users_not_clocked_in: usersNotClockedIn
        });

    } catch (error) {
        res.status(500).json({ response_message: error.message });
    }
};