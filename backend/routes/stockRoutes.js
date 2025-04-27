const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');

// Stock routes
router.get('/', stockController.getStocks);
router.get('/indices/market', stockController.getMarketIndices);
router.get('/trending/stocks', stockController.getTrendingStocks);
router.get('/market-data', stockController.getMarketData);
router.get('/:symbol', stockController.getStockBySymbol);
router.get('/:symbol/history', stockController.getStockHistory);

module.exports = router;