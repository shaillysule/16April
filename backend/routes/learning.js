const express = require('express');
const router = express.Router();
const learningController = require('../controllers/learningController');
const { authenticateUser, isAdmin } = require('../middleware/auth');

// Public routes
router.get('/', learningController.getAllModules);
router.get('/:id', learningController.getModuleById);

// Route to mark module as complete and award points
router.post('/complete', authenticateUser, learningController.completeModule);

// Admin-only routes
router.post('/', authenticateUser, isAdmin, learningController.createModule);
router.put('/:id', authenticateUser, isAdmin, learningController.updateModule);
router.delete('/:id', authenticateUser, isAdmin, learningController.deleteModule);

module.exports = router;