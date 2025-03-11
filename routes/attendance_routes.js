const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendance_controllers');
const authMiddleware = require('../utils/auth_middleware');

router.post('/clockin', authMiddleware, attendanceController.clockin);
router.post('/clockout', authMiddleware, attendanceController.clockout);
router.get('/attendances/elastics', authMiddleware, attendanceController.getAttendanceRecords)
router.get('/attendances', authMiddleware, attendanceController.getListAttendance)
router.get('/attendances/checkClockin', attendanceController.checkAndNotifyMissingClockins)

module.exports = router;