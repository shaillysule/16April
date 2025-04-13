// controllers/stockController.js
const axios = require('axios');

const API_KEY = 'YOUR_ALPHA_VANTAGE_API_KEY';
const SYMBOLS = ['AAPL', 'TSLA', 'GOOGL', 'MSFT']; // You can add more

exports.getStocks = async (req, res) => {
  try {
    const stockData = await Promise.all(
      SYMBOLS.map(async (symbol) => {
        const response = await axios.get(
          `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`
        );
        const quote = response.data['Global Quote'];
        return {
          symbol,
          companyName: symbol,
          latestPrice: quote['05. price'],
          changePercent: quote['10. change percent'],
        };
      })
    );
    res.json(stockData);
  } catch (error) {
    console.error('Error fetching stock data:', error.message);
    res.status(500).json({ error: 'Failed to fetch stock data' });
  }
};

exports.getStockBySymbol = async (req, res) => {
  const { symbol } = req.params;
  try {
    const response = await axios.get(
      `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${API_KEY}`
    );
    const overview = response.data;

    const priceResp = await axios.get(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`
    );
    const quote = priceResp.data['Global Quote'];

    res.json({
      symbol,
      companyName: overview.Name,
      description: overview.Description,
      latestPrice: quote['05. price'],
      changePercent: quote['10. change percent'],
    });
  } catch (err) {
    console.error('Stock detail fetch failed:', err.message);
    res.status(500).json({ error: 'Failed to fetch stock detail' });
  }
};
