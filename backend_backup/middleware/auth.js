const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async function(req, res, next) {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    // Check if no token
    if (!token) {
      return res.status(401).json({ msg: 'No token, authorization denied' });
    }
    
    // Verify token with proper error handling
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Handle both token formats - new format has direct 'id' property,
    // old format has 'user.id' property
    const userId = decoded.id || (decoded.user && decoded.user.id);
    
    if (!userId) {
      return res.status(401).json({ msg: 'Invalid token format' });
    }
    
    // Find the user with the extracted ID
    const user = await User.findById(userId).select('-password');
    
    // Validate user exists in database
    if (!user) {
      return res.status(401).json({ msg: 'User not found' });
    }
    
    // Set user info on request object
    req.user = {
      id: user._id,
      name: user.name || '',
      email: user.email,
      role: user.role || 'user',
      isSubscribed: user.subscriptionActive || user.isSubscribed || false
    };
    
    // Debug log for troubleshooting
    console.log(`Auth middleware: User ${user.email} authenticated with role ${user.role}`);
    
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(401).json({ msg: 'Token is not valid' });
  }
};