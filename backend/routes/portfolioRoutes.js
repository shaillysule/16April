// routes/portfolioRoutes.js
const express = require('express');
const router = express.Router();
const { 
  buyStock, 
  sellStock, 
  getPortfolio, 
  getTransactionHistory 
} = require('../controllers/portfolioController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

router.post('/buy', buyStock);
router.post('/sell', sellStock);
router.get('/', getPortfolio);
router.get('/transactions', getTransactionHistory);

module.exports = router;