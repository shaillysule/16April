// backend/routes/stockRoutes.js
const express = require('express');
const router = express.Router();
const { getStocks, getStockBySymbol } = require('../controllers/stockController');
const auth = require('../middleware/auth');

router.get('/', auth, getStocks);
router.get('/:symbol', auth, getStockBySymbol);

module.exports = router;
