// middleware/auth.js
const jwt = require('jsonwebtoken');

const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    console.log('Auth header received:', authHeader); // Debug log
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided or invalid token format' });
    }
    const token = authHeader.split(' ')[1];
    console.log('Token extracted:', token); // Debug log

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Attempting to verify token with JWT_SECRET:', process.env.JWT_SECRET); // Debug log
    console.log('Decoded token:', decoded); // Debug log

    // Support both id and user.id in the token
    const userId = decoded.id || (decoded.user && decoded.user.id);
    if (!userId) {
      return res.status(401).json({ message: 'Invalid token format' });
    }

    const User = require('../models/User'); // Adjust path based on your project structure
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Token verification failed:', err.message, 'Full error:', err); // Debug log
    res.status(500).json({ msg: `something wrong${err.name}: ${err.message}` });
  }
};

// Middleware to check if the user is an admin
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied: Admin only' });
  }

  next();
};

module.exports = { authenticateUser, isAdmin };