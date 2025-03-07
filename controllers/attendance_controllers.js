const redisClient = require('../config/redis_client');
const Attendance = require('../models/attendances');

exports.clockin = async(req, res) => {
    try {

        if (!req.user || !req.user.id) {
            return res.status(401).json({ response_message: 'Invalid token or user ID not found' });
        }
        const userId = req.user.id;

        const today = new Date().toISOString().split('T')[0];
        const clockInTime = new Date().toLocaleTimeString('en-US', { hour12: false });

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
            clockin: clockInTime
        }));

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
        const today = new Date().toISOString().split('T')[0];
        const clockOutTime = new Date().toLocaleTimeString('en-US', { hour12: false });

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
            clockin: parsedClockin.clockin,
            clockout: clockOutTime
        }));

        res.status(200).json({ response_message: 'Clock-out successful' });

    } catch (error) {
        res.status(500).json({ response_message: error.message });
    }
};