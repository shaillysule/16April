const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Middleware for JWT Authentication
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    console.log('Auth header received:', authHeader); // Debug log
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided or invalid token format' });
    }
    const token = authHeader.split(' ')[1];
    console.log('Token extracted:', token); // Debug log

    // Verify the token
    console.log('Attempting to verify token with JWT_SECRET:', process.env.JWT_SECRET); // Debug log
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded); // Debug log

    // Extract user ID from the decoded token
    const userId = decoded.id || (decoded.user && decoded.user.id);
    if (!userId) {
      return res.status(401).json({ message: 'Invalid token payload: no user ID found' });
    }

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    req.user = user;
    next();
  } catch (err) {
    console.error('Auth error - Token verification failed:', err.name, err.message, 'Full error:', err); // Enhanced debug log
    res.status(401).json({ msg: `${err.name}: ${err.message}` }); // Return specific error
  }
};

// POST /api/auth/signup - Register a new user
router.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  try {
    // Validate email is gmail
    if (!email.endsWith('@gmail.com')) {
      return res.status(400).json({ msg: 'Please use a Gmail address (@gmail.com)' });
    }
    
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    // Create new user with default fields
    user = new User({
      email,
      password: await bcrypt.hash(password, 10),
      role: 'user',  // Ensure role is set to 'user' by default
      name: email.split('@')[0], // Default name from email
      subscriptionActive: false,
      freeAITrials: 3 // Give new users some free trials
    });
    
    await user.save();

    // Create token with consistent format
    const token = jwt.sign(
      { id: user._id }, // Simplified payload to just id
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    );
    
    res.json({ 
      token, 
      role: user.role || "user", 
      name: user.name || "", 
      email: user.email,
      isSubscribed: false, 
      freeAITrials: user.freeAITrials || 0
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// POST /api/auth/login - Authenticate user & get token
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // Validate email is gmail
    if (!email.endsWith('@gmail.com')) {
      return res.status(400).json({ msg: 'Please use a Gmail address (@gmail.com)' });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Create token with consistent format
    const token = jwt.sign(
      { id: user._id }, // Simplified payload to just id
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    );
    
    // Log successful login for debugging
    console.log('Login successful for:', email, 'with role:', user.role);
    
    res.json({ 
      token, 
      role: user.role || "user", 
      name: user.name || "", 
      email: user.email,
      isSubscribed: user.isSubscribed || user.subscriptionActive || false, 
      freeAITrials: user.freeAITrials || 0
    });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// GET /api/auth/me - Get current user information
router.get('/me', authMiddleware, async (req, res) => {
  try {
    // req.user is already set by the authMiddleware
    res.json({
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role || 'user',
      isSubscribed: req.user.subscriptionActive || req.user.isSubscribed || false
    });
  } catch (err) {
    console.error('Error getting user:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;