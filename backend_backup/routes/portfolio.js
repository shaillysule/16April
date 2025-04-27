const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

router.get('/users/portfolio', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('portfolio -password');
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }
        res.json(user.portfolio || []);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;