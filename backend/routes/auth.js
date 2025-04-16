// auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Middleware for JWT Authentication
// routes/auth.js - Update the authMiddleware function
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided or invalid token format' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    req.user = user;
    next();
  } catch (err) {
    console.error('Auth error:', err);
    res.status(401).json({ msg: 'Not authorized' });
  }
};

// POST /api/auth/signup - Register a new user
router.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    user = new User({ email, password: await bcrypt.hash(password, 10) });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, isSubscribed: user.isSubscribed, freeAITrials: user.freeAITrials });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});


// POST /api/auth/login - Authenticate user & get token
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Fix to make sure we're using consistent property names
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ 
      token, 
      role: user.role || "user", 
      name: user.name || "", 
      email: user.email,
      // Make sure these match what your User model has
      isSubscribed: user.isSubscribed || user.subscriptionActive || false, 
      freeAITrials: user.freeAITrials || 0
    });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});
// Add this to the end of your routes/auth.js file, just before module.exports

// GET /api/auth/me - Get current user information
router.get('/me', authMiddleware, async (req, res) => {
  try {
    // req.user is already set by the authMiddleware
    res.json({
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role || 'user',
      isSubscribed: req.user.subscriptionActive || false
    });
  } catch (err) {
    console.error('Error getting user:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});
module.exports=router;