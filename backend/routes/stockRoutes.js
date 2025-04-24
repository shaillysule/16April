// routes/stockRoutes.js
const express = require('express');
const router = express.Router();
const { 
  getMultipleStockData, 
  getMarketIndices, 
  getTrendingStocks 
} = require('../services/apiService');
const authMiddleware = require('../middleware/auth');

// Get data for watched stocks
router.get('/api/stocks', authMiddleware, async (req, res) => {
  try {
    console.log('Fetching stock data for multiple symbols...');
    const symbols = req.query.symbols?.split(',') || ['AAPL']; // Default to AAPL if no symbols provided
    const data = await getMultipleStockData(symbols);
    
    console.log('Final stock data response:', data);
    res.json(data);
  } catch (error) {
    console.error('Error in /api/stocks:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get market indices
router.get('/api/indices', authMiddleware, async (req, res) => {
  try {
    console.log('Fetching market indices...');
    const data = await getMarketIndices();
    
    console.log('Final indices data response:', data);
    res.json(data);
  } catch (error) {
    console.error('Error in /api/indices:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get trending stocks
router.get('/api/trending', authMiddleware, async (req, res) => {
  try {
    console.log('Fetching trending stocks...');
    const data = await getTrendingStocks();
    
    console.log('Final trending stocks response:', data);
    res.json(data);
  } catch (error) {
    console.error('Error in /api/trending:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add to watchlist
router.post('/api/watchlist', authMiddleware, async (req, res) => {
  try {
    const { symbol } = req.body;
    // Add code to save symbol to user's watchlist in database
    res.json({ success: true, message: `Added ${symbol} to watchlist` });
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;