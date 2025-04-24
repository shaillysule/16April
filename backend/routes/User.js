const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

router.get('/user', auth.authenticateUser, async (req, res) => { // Fixed: Use auth.authenticateUser
    console.log('Request received for /user'); // Debug log
    console.log('req.user:', req.user); // Debug req.user
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }
        res.json({ isSubscribed: user.subscriptionActive }); // Use subscriptionActive from model
    } catch (err) {
        console.error('Error in /user route:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;