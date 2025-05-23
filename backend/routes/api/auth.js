const express = require('express');
const router = express.Router();
const authController = require('../../controllers/authController');
const auth = require('../../middleware/auth'); // Ensure this points to the updated middleware/auth.js

// All routes in this file have /api/auth prefix

// Register user
// POST /api/auth/register
router.post('/register', authController.registerUser);
// For backwards compatibility - both endpoints will work
router.post('/signup', authController.registerUser);

// Login user
// POST /api/auth/login
router.post('/login', authController.loginUser);

// Get authenticated user
// GET /api/auth/me
router.get('/me', auth.authenticateUser, authController.getMe); // Already using auth.authenticateUser

module.exports = router;