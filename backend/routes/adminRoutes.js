const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const User=require('../models/User');// Example: Get all users (for admin)


router.get('/users', auth, admin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
