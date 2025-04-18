module.exports = function(req, res, next) {
  // After auth middleware sets req.user, check role
  if (!req.user) {
    return res.status(401).json({ msg: 'Authentication required' });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Admin access required' });
  }
  
  next();
};