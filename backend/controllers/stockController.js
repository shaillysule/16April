// backend/controllers/stockController.js
const axios = require('axios');

const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const DEFAULT_SYMBOLS = ['AAPL', 'TSLA', 'GOOGL', 'MSFT', 'AMZN', 'META'];

// Get list of stocks
exports.getStocks = async (req, res) => {
  try {
    console.log("Getting stock data with API key:", API_KEY ? "API key found" : "API key missing");
    
    if (!API_KEY) {
      return res.status(500).json({ error: 'API key is missing' });
    }

    const stockData = await Promise.all(
      DEFAULT_SYMBOLS.map(async (symbol) => {
        try {
          const response = await axios.get(
            `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`
          );
          
          const quote = response.data['Global Quote'];
          
          // If no data was returned for this symbol
          if (!quote || Object.keys(quote).length === 0) {
            return {
              symbol,
              companyName: symbol,
              latestPrice: '0.00',
              changePercent: '0.00%',
              error: 'No data available'
            };
          }
          
          return {
            symbol,
            companyName: symbol, // You'll need company overview to get actual name
            latestPrice: quote['05. price'],
            changePercent: quote['10. change percent'],
          };
        } catch (err) {
          console.error(`Error fetching data for ${symbol}:`, err.message);
          return {
            symbol,
            companyName: symbol,
            latestPrice: '0.00',
            changePercent: '0.00%',
            error: err.message
          };
        }
      })
    );
    
    res.json(stockData);
  } catch (error) {
    console.error('Error fetching stock data:', error.message);
    res.status(500).json({ error: 'Failed to fetch stock data' });
  }
};

// Get details for a specific stock
exports.getStockBySymbol = async (req, res) => {
  const { symbol } = req.params;
  
  if (!symbol) {
    return res.status(400).json({ error: 'Stock symbol is required' });
  }
  
  try {
    console.log("Getting stock detail for:", symbol);
    
    if (!API_KEY) {
      return res.status(500).json({ error: 'API key is missing' });
    }

    // Get company overview
    const overviewResponse = await axios.get(
      `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${API_KEY}`
    );
    const overview = overviewResponse.data;

    // Get current quote
    const quoteResponse = await axios.get(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`
    );
    const quote = quoteResponse.data['Global Quote'];

    // If no quote data was returned
    if (!quote || Object.keys(quote).length === 0) {
      return res.status(404).json({ error: 'Stock data not found' });
    }

    res.json({
      symbol,
      name: overview.Name || symbol,
      description: overview.Description || `No description available for ${symbol}`,
      latestPrice: quote['05. price'] || '0.00',
      changePercent: quote['10. change percent'] || '0.00%',
      dayHigh: overview['52WeekHigh'] || 'N/A', // Alpha Vantage doesn't provide day high in these endpoints
      dayLow: overview['52WeekLow'] || 'N/A',   // Alpha Vantage doesn't provide day low in these endpoints
      yearHigh: overview['52WeekHigh'] || 'N/A',
      yearLow: overview['52WeekLow'] || 'N/A',
      sector: overview.Sector || 'N/A',
      industry: overview.Industry || 'N/A',
      marketCap: overview.MarketCapitalization || 'N/A',
      peRatio: overview.PERatio || 'N/A',
      dividendYield: overview.DividendYield || 'N/A',
      eps: overview.EPS || 'N/A',
    });
  } catch (err) {
    console.error('Stock detail fetch failed:', err.message);
    res.status(500).json({ error: 'Failed to fetch stock detail' });
  }
};

// Get historical data for a stock
exports.getStockHistory = async (req, res) => {
  const { symbol } = req.params;
  const { interval = 'daily' } = req.query; // daily, weekly, monthly
  
  if (!symbol) {
    return res.status(400).json({ error: 'Stock symbol is required' });
  }
  
  try {
    console.log(`Getting ${interval} history for:`, symbol);
    
    if (!API_KEY) {
      return res.status(500).json({ error: 'API key is missing' });
    }
    
    // Map interval to Alpha Vantage function
    let timeSeriesFunction;
    switch (interval) {
      case 'daily':
        timeSeriesFunction = 'TIME_SERIES_DAILY';
        break;
      case 'weekly':
        timeSeriesFunction = 'TIME_SERIES_WEEKLY';
        break;
      case 'monthly':
        timeSeriesFunction = 'TIME_SERIES_MONTHLY';
        break;
      default:
        timeSeriesFunction = 'TIME_SERIES_DAILY';
    }
    
    const response = await axios.get(
      `https://www.alphavantage.co/query?function=${timeSeriesFunction}&symbol=${symbol}&apikey=${API_KEY}`
    );
    
    // Determine the time series key based on the interval
    let timeSeriesKey;
    switch (interval) {
      case 'daily':
        timeSeriesKey = 'Time Series (Daily)';
        break;
      case 'weekly':
        timeSeriesKey = 'Weekly Time Series';
        break;
      case 'monthly':
        timeSeriesKey = 'Monthly Time Series';
        break;
      default:
        timeSeriesKey = 'Time Series (Daily)';
    }
    
    const timeSeries = response.data[timeSeriesKey];
    
    if (!timeSeries || Object.keys(timeSeries).length === 0) {
      return res.status(404).json({ error: 'Historical data not found' });
    }
    
    // Convert object to arrays for easier frontend processing
    const dates = [];
    const prices = [];
    
    // Sort dates in ascending order
    const sortedDates = Object.keys(timeSeries).sort();
    
    // Get the last 30 data points (or less if not available)
    const recentDates = sortedDates.slice(-30);
    
    recentDates.forEach(date => {
      dates.push(date);
      prices.push(parseFloat(timeSeries[date]['4. close']));
    });
    
    res.json({
      symbol,
      interval,
      dates,
      prices,
    });
  } catch (err) {
    console.error('Historical data fetch failed:', err.message);
    res.status(500).json({ error: 'Failed to fetch historical data' });
  }
};

// Get market indices (might need a different data source)
exports.getMarketIndices = async (req, res) => {
  try {
  
    const indices = await fetchIndicesData();
    res.json(indices);
  } catch (err) {
    console.error('Market indices fetch failed:', err.message);
    res.status(500).json({ error: 'Failed to fetch market indices' });
  }
};

// Get trending stocks (based on volume)
exports.getTrendingStocks = async (req, res) => {
  try {
    // This would ideally come from a different endpoint or analysis
    // For now, return placeholder data
    const trendingStocks = [
      { symbol: 'AAPL', companyName: 'Apple Inc.', latestPrice: '189.34', changePercent: '1.5%' },
      { symbol: 'TSLA', companyName: 'Tesla Inc.', latestPrice: '765.23', changePercent: '2.3%' },
      { symbol: 'AMZN', companyName: 'Amazon.com Inc.', latestPrice: '3150.00', changePercent: '1.2%' },
      { symbol: 'MSFT', companyName: 'Microsoft Corp.', latestPrice: '234.12', changePercent: '0.7%' }
    ];
    
    res.json(trendingStocks);
  } catch (err) {
    console.error('Trending stocks fetch failed:', err.message);
    res.status(500).json({ error: 'Failed to fetch trending stocks' });
  }
};