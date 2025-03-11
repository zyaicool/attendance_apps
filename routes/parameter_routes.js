const express = require('express');
const router = express.Router();
const parameterController = require('../controllers/parameter_controllers');
const authMiddleware = require('../utils/auth_middleware');

router.get('/parameters', authMiddleware, parameterController.getParameters);
router.get('/parameters/:id', authMiddleware, parameterController.getParameterById);
router.put('/parameters/:id', authMiddleware, parameterController.updateParameter);

module.exports = router;