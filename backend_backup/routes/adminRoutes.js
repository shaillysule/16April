const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const User = require('../models/User');
const Portfolio = require('../models/Portfolio');
const authController = require('../controllers/authController');
const {getUsers}=require('../controllers/adminController');
// Get all users (for admin) - using authController
router.get('/users', getUsers);
 getUsers = (req, res) => {
  // Logic for fetching users
  res.json({ message: "List of users" });
};


// Add a route to toggle user roles (make/remove admin) - using authController
router.put('/users/:userId/role', auth, admin, async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!role || (role !== 'user' && role !== 'admin')) {
      return res.status(400).json({ msg: 'Valid role is required' });
    }
    
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    user.role = role;
    await user.save();
    
    res.json({ msg: 'User role updated', user });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Add this route to get portfolio details for a specific user
router.get('/users/:userId/portfolios', auth, admin, async (req, res) => {
  try {
    const portfolios = await Portfolio.find({ userId: req.params.userId });
    
    if (!portfolios) {
      return res.status(404).json({ msg: 'No portfolios found for this user' });
    }
    
    res.json(portfolios);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Add this route to get platform statistics
router.get('/statistics', auth, admin, async (req, res) => {
  try {
    // Get all users
    const users = await User.find();
    
    // Get all portfolios
    const portfolios = await Portfolio.find();
    
    // Calculate statistics
    const totalUsers = users.length;
    const adminUsers = users.filter(user => user.role === 'admin').length;
    const activeUsers = await Portfolio.distinct('userId');
    const totalPortfolios = portfolios.length;
    
    // You can add more statistics as needed
    const statistics = {
      totalUsers,
      adminUsers,
      activeUsers: activeUsers.length,
      totalPortfolios,
      // Add more stats here
    };
    
    res.json(statistics);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
module.exports = { getUsers };
