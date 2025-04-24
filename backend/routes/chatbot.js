// backend/routes/chatbot.js
const express = require('express');
const router = express.Router();

const { handleStockQuery } = require('../controllers/chatbotController');
const { authenticateUser } = require('../middleware/auth'); // ✅ FIXED
const enhanceWithStockData = require('../middleware/stockDataEnhancer');

// Routes

// Public stock chat
router.post('/stock', enhanceWithStockData, handleStockQuery);

// Personalized chat (requires login)
router.post('/stock/personalized', authenticateUser, enhanceWithStockData, handleStockQuery); // ✅ FIXED

module.exports = router;
