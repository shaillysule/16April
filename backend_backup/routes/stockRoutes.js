// backend/routes/stockRoutes.js

const express = require('express');
const router = express.Router();
const { 
  getStocks, 
  getStockBySymbol, 
  getStockHistory, 
  getMarketIndices, 
  getTrendingStocks 
} = require('../controllers/stockController');
const auth = require('../middleware/auth');

// Base routes with authentication
router.get('/', auth, getStocks);
router.get('/:symbol', auth, getStockBySymbol);
router.get('/:symbol/history', auth, getStockHistory);
router.get('/stocks/indices/market', auth, getMarketIndices);
router.get('/stocks/trending/stocks', auth, getTrendingStocks);

module.exports = router;