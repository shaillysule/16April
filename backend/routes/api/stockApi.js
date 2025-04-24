// utils/stockApiService.js - NEW FILE
const axios = require('axios');
const NodeCache = require('node-cache'); // You'll need to install this

const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const cache = new NodeCache({ stdTTL: 300 }); // Cache for 5 minutes

const getStockQuote = async (symbol) => {
  const cacheKey = `quote_${symbol}`;
  
  // Check cache first
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }
  
  try {
    const response = await axios.get(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`
    );
    
    const data = response.data['Global Quote'];
    if (!data || Object.keys(data).length === 0) {
      throw new Error('Stock not found');
    }
    
    // Format the response
    const quote = {
      symbol: data['01. symbol'],
      price: parseFloat(data['05. price']),
      change: parseFloat(data['09. change']),
      changePercent: parseFloat(data['10. change percent'].replace('%', '')),
      volume: parseInt(data['06. volume']),
      latestTradingDay: data['07. latest trading day']
    };
    
    // Store in cache
    cache.set(cacheKey, quote);
    
    return quote;
  } catch (error) {
    console.error(`Error fetching stock quote for ${symbol}:`, error.message);
    throw error;
  }
};

// Add more API functions as needed

module.exports = {
  getStockQuote
  // Export other functions
};