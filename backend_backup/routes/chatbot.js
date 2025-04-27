const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');
const auth = require('../middleware/auth'); // If you have authentication middleware

// Route to ask questions to the chatbot
router.post('/ask', auth, chatbotController.askQuestion);
router.get('/history', auth, chatbotController.getHistory);
router.post('/feedback', auth, chatbotController.recordFeedback);


module.exports = router;