const express = require('express');
const router = express.Router();
const userController = require('../controllers/user_controllers');
const authMiddleware = require('../utils/auth_middleware');

router.post('/users', authMiddleware, userController.createUser);
router.get('/users', authMiddleware, userController.getUsers);
router.get('/users/:id', authMiddleware, userController.getUserById);
router.put('/users/:id', authMiddleware, userController.updateUser);
router.delete('/users/:id', authMiddleware, userController.deleteUser);
router.post('/login', userController.login);

module.exports = router;