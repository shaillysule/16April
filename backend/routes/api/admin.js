const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const adminController = require('../../controllers/adminController');

// All routes in this file have /api/admin prefix
// Protect all admin routes with both auth and admin middleware
router.use(auth.authenticateUser); // Fixed: Use auth.authenticateUser
router.use(auth.isAdmin); // Fixed: Use auth.isAdmin from middleware/auth.js

// Get all users 
// GET /api/admin/users
router.get('/users', adminController.getAllUsers);

// Update user role 
// PUT /api/admin/users/:id/role
router.put('/users/:id/role', adminController.updateUserRole);

module.exports = router;