const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth'); // For authentication
const stockController = require('../../controllers/stockController'); // Ensure this file exists

// All routes in this file will have /api prefix when mounted in server.js
router.get('/stocks', auth.authenticateUser, stockController.getStocks);
router.get('/stocks/:symbol', auth.authenticateUser, stockController.getStockBySymbol);
router.get('/stocks/indices/market', auth.authenticateUser, stockController.getMarketIndices);
router.get('/stocks/trending/stocks', auth.authenticateUser, stockController.getTrendingStocks);

module.exports = router;