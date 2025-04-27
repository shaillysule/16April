// apiService.js
const axios = require('axios');
const NodeCache = require('node-cache');

// Cache with 30 minute TTL
const stockCache = new NodeCache({ stdTTL: 1800 });

const API_KEY = process.env.ALPHAVANTAGE_API_KEY || 'your_api_key';

// Helper to check cache before making API call
const fetchWithCache = async (cacheKey, apiCall) => {
  // Check if data exists in cache
  const cachedData = stockCache.get(cacheKey);
  if (cachedData) {
    console.log(`Cache hit for ${cacheKey}`);
    return cachedData;
  }

  // If not in cache, make API call
  try {
    console.log(`Fetching fresh data for ${cacheKey}`);
    const data = await apiCall();
    
    // Store in cache
    stockCache.set(cacheKey, data);
    return data;
  } catch (error) {
    console.error(`Error fetching data for ${cacheKey}:`, error.message);
    throw error;
  }
};

// Get stock data for a single symbol
const getStockData = async (symbol) => {
  const cacheKey = `stock_${symbol}`;
  
  return fetchWithCache(cacheKey, async () => {
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`;
    const response = await axios.get(url);
    
    if (response.data['Global Quote'] && Object.keys(response.data['Global Quote']).length > 0) {
      const quote = response.data['Global Quote'];
      return {
        symbol,
        companyName: symbol, // You might want to get actual company names from another API
        latestPrice: quote['05. price'],
        changePercent: quote['10. change percent']
      };
    } else if (response.data.Information) {
      console.log(`API limit message: ${response.data.Information}`);
      throw new Error('API rate limit reached');
    } else {
      throw new Error('No data returned for symbol');
    }
  });
};

// Get data for multiple stock symbols with fallback to cached/mock data
const getMultipleStockData = async (symbols) => {
  const results = [];
  
  for (const symbol of symbols) {
    try {
      const stockData = await getStockData(symbol);
      results.push(stockData);
    } catch (error) {
      console.error(`Error fetching data for ${symbol}:`, error.message);
      
      // Add fallback data instead of error entry
      results.push({
        symbol,
        companyName: symbol,
        latestPrice: '0.00',
        changePercent: '0.00%',
        fallback: true // Flag to indicate this is fallback data
      });
    }
    
    // Add delay between requests to avoid hitting rate limits
    if (symbols.indexOf(symbol) < symbols.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  return results;
};

// Get market indices data
const getMarketIndices = async () => {
  const indices = ['^GSPC', '^IXIC', '^DJI']; // S&P 500, NASDAQ, Dow Jones
  const cacheKey = 'market_indices';
  
  return fetchWithCache(cacheKey, async () => {
    const results = [];
    
    for (const symbol of indices) {
      try {
        const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`;
        const response = await axios.get(url);
        
        if (response.data['Global Quote'] && Object.keys(response.data['Global Quote']).length > 0) {
          const quote = response.data['Global Quote'];
          results.push({
            symbol,
            price: quote['05. price'],
            changePercent: quote['10. change percent']
          });
        } else {
          results.push({
            symbol,
            price: '0.00',
            changePercent: '0.00%',
            fallback: true
          });
        }
      } catch (error) {
        console.error(`Error fetching index data for ${symbol}:`, error.message);
        results.push({
          symbol,
          price: '0.00',
          changePercent: '0.00%',
          fallback: true
        });
      }
      
      // Add delay between requests
      if (indices.indexOf(symbol) < indices.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    return results;
  });
};

// Get trending stocks data
const getTrendingStocks = async () => {
  const trendingSymbols = ['MSFT', 'NVDA', 'TSLA', 'GOOGL'];
  return getMultipleStockData(trendingSymbols);
};

// Alternative API - Financial Modeling Prep (offers more generous free tier)
const getFMPStockData = async (symbol) => {
  const API_KEY_FMP = process.env.FMP_API_KEY || 'your_fmp_api_key';
  const url = `https://financialmodelingprep.com/api/v3/quote/${symbol}?apikey=${API_KEY_FMP}`;
  
  const response = await axios.get(url);
  if (response.data && response.data.length > 0) {
    const quote = response.data[0];
    return {
      symbol: quote.symbol,
      companyName: quote.name,
      latestPrice: quote.price.toFixed(2),
      changePercent: `${quote.changesPercentage.toFixed(2)}%`
    };
  }
  throw new Error('No data returned from FMP API');
};

module.exports = {
  getStockData,
  getMultipleStockData,
  getMarketIndices,
  getTrendingStocks,
  getFMPStockData
};