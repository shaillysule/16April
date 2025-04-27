// routes/subscription.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// Get subscription status
router.get('/status', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    res.json({
      isSubscribed: user.isSubscribed,
      freeLoginsUsed: user.freeLoginsUsed
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Subscribe a user
router.post('/subscribe', auth, async (req, res) => {
  try {
    // Here you would typically integrate with a payment processor
    // For now, we'll just update the user status
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { isSubscribed: true },
      { new: true }
    ).select('-password');
    
    res.json({
      isSubscribed: user.isSubscribed
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;