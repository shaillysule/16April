const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const User = require('../models/User');
const Portfolio = require('../models/Portfolio');

// Get all users (for admin)
router.get('/users', auth, admin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    
    // For each user, get their portfolio count
    const usersWithPortfolioInfo = await Promise.all(
      users.map(async (user) => {
        const portfolios = await Portfolio.find({ userId: user._id });
        return {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role || 'user',
          portfolio: portfolios
        };
      })
    );
    
    res.json(usersWithPortfolioInfo);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Add a route to toggle user roles (make/remove admin)
router.put('/users/:userId/role', auth, admin, async (req, res) => {
  try {
    const { role } = req.body;
    if (!role || (role !== 'admin' && role !== 'user')) {
      return res.status(400).json({ msg: 'Valid role required' });
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { role },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;