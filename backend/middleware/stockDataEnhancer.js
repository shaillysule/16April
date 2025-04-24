// backend/middleware/stockDataEnhancer.js
const axios = require('axios');

const enhanceWithStockData = async (req, res, next) => {
  try {
    const { query } = req.body;
    
    // Check if query contains stock ticker pattern
    const tickerPattern = /\$([A-Z]{1,5})\b/g;
    const matches = query.match(tickerPattern);
    
    if (!matches) {
      return next();
    }
    
    // Extract tickers without $ symbol
    const tickers = matches.map(match => match.substring(1));
    
    // Get stock data for each ticker
    const stockData = {};
    for (const ticker of tickers) {
      try {
        // Using Alpha Vantage API (you'll need an API key)
        const response = await axios.get(
          `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`
        );
        
        if (response.data && response.data['Global Quote']) {
          const quote = response.data['Global Quote'];
          stockData[ticker] = {
            price: quote['05. price'],
            change: quote['09. change'],
            percentChange: quote['10. change percent'],
            volume: quote['06. volume'],
            latestTradingDay: quote['07. latest trading day']
          };
        }
      } catch (err) {
        console.error(`Error fetching data for ${ticker}:`, err);
      }
    }
    
    // Attach stock data to the request
    req.stockData = stockData;
    next();
    
  } catch (error) {
    console.error('Error in stock data enhancer:', error);
    next(); // Continue without stock data
  }
};

module.exports = enhanceWithStockData;