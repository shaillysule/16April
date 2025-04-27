const express = require('express');
const axios = require('axios');
const router = express.Router();

const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY; // Store your API key in environment variables

router.get('/api/stocks/:symbol', async (req, res) => {
  const symbol = req.params.symbol.toUpperCase();

  try {
    const response = await axios.get('https://www.alphavantage.co/query', {
      params: {
        function: 'GLOBAL_QUOTE',
        symbol: symbol,
        apikey: ALPHA_VANTAGE_API_KEY,
      },
    });

    const data = response.data['Global Quote'];
    if (!data) {
      return res.status(404).json({ error: 'Stock data not found' });
    }

    res.json({
      symbol: data['01. symbol'],
      price: parseFloat(data['05. price']),
      change: parseFloat(data['09. change']),
      percentChange: data['10. change percent'],
    });
  } catch (error) {
    console.error('Error fetching stock data:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
