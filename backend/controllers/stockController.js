const axios = require('axios');
require('dotenv').config();

const ALPHA_VANTAGE_KEY = process.env.ALPHA_VANTAGE_KEY;
const DEFAULT_SYMBOLS = ['AAPL']; // Keep at 1 symbol initially

if (!ALPHA_VANTAGE_KEY) {
  console.error('ALPHA_VANTAGE_KEY is missing in .env file');
  process.exit(1);
}

exports.getStocks = async (req, res) => {
  try {
    console.log('Fetching stock data for multiple symbols...');
    const stockData = await Promise.all(
      DEFAULT_SYMBOLS.map(async (symbol, index) => {
        if (index > 0) await new Promise(resolve => setTimeout(resolve, 12000));
        try {
          const response = await axios.get('https://www.alphavantage.co/query', {
            params: {
              function: 'TIME_SERIES_DAILY',
              symbol: symbol,
              apikey: ALPHA_VANTAGE_KEY
            }
          });
          console.log(`Raw API Response for ${symbol}:`, response.data);
          const dailyData = response.data['Time Series (Daily)'];
          if (!dailyData) {
            throw new Error('No daily data returned');
          }
          const latestDate = Object.keys(dailyData)[0];
          const latest = dailyData[latestDate];
          const previousDate = Object.keys(dailyData)[1] || latestDate; // Fallback to latest if no previous
          const previous = dailyData[previousDate];
          const latestPrice = parseFloat(latest['4. close']);
          const previousPrice = parseFloat(previous['4. close']);
          const changePercent = isNaN((latestPrice - previousPrice) / previousPrice * 100)
            ? '0.00'
            : ((latestPrice - previousPrice) / previousPrice * 100).toFixed(2);
          const result = {
            symbol,
            companyName: response.data['Meta Data']['2. Symbol'] || symbol,
            latestPrice: latestPrice.toString() || '0.00',
            changePercent: `${changePercent}%`
          };
          console.log(`Processed data for ${symbol}:`, result);
          return result;
        } catch (err) {
          console.error(`Error fetching data for ${symbol}:`, err.message, 'Response:', err.response?.data);
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
    console.log('Final stock data response:', stockData);
    res.json(stockData);
  } catch (error) {
    console.error('Overall error fetching stock data:', error.message, 'Stack:', error.stack);
    res.status(500).json({ error: 'Failed to fetch stock data' });
  }
};

exports.getStockBySymbol = async (req, res) => {
  const { symbol } = req.params;

  if (!symbol) {
    return res.status(400).json({ error: 'Stock symbol is required' });
  }

  try {
    const overviewResponse = await axios.get('https://www.alphavantage.co/query', {
      params: {
        function: 'OVERVIEW',
        symbol: symbol,
        apikey: ALPHA_VANTAGE_KEY
      }
    });
    console.log(`Raw Overview Response for ${symbol}:`, overviewResponse.data);
    const priceResponse = await axios.get('https://www.alphavantage.co/query', {
      params: {
        function: 'TIME_SERIES_DAILY',
        symbol: symbol,
        apikey: ALPHA_VANTAGE_KEY
      }
    });
    console.log(`Raw Price Response for ${symbol}:`, priceResponse.data);
    const data = overviewResponse.data;
    const dailyData = priceResponse.data['Time Series (Daily)'];
    if (!dailyData) {
      throw new Error('No daily data returned');
    }
    const latestDate = Object.keys(dailyData)[0];
    const latest = dailyData[latestDate];
    const previousDate = Object.keys(dailyData)[1] || latestDate;
    const previous = dailyData[previousDate];
    const latestPrice = parseFloat(latest['4. close']);
    const previousPrice = parseFloat(previous['4. close']);
    const changePercent = isNaN((latestPrice - previousPrice) / previousPrice * 100)
      ? '0.00'
      : ((latestPrice - previousPrice) / previousPrice * 100).toFixed(2);

    const result = {
      symbol,
      name: data.Name || symbol,
      description: data.Description || `No description available for ${symbol}`,
      latestPrice: latestPrice.toString() || '0.00',
      changePercent: `${changePercent}%`,
      dayHigh: latest['2. high'] || 'N/A',
      dayLow: latest['3. low'] || 'N/A',
      yearHigh: data['52WeekHigh'] || 'N/A',
      yearLow: data['52WeekLow'] || 'N/A',
      sector: data.Sector || 'N/A',
      industry: data.Industry || 'N/A',
      marketCap: data.MarketCapitalization ? (parseFloat(data.MarketCapitalization) / 1e9).toFixed(2) + 'B' : 'N/A',
      peRatio: data.PERatio || 'N/A',
      dividendYield: data.DividendYield ? `${(parseFloat(data.DividendYield) * 100).toFixed(2)}%` : 'N/A',
      eps: data.EPS || 'N/A'
    };
    console.log(`Processed data for ${symbol}:`, result);
    res.json(result);
  } catch (err) {
    console.error('Stock detail fetch failed:', err.message, 'Response:', err.response?.data, 'Stack:', err.stack);
    res.status(err.response?.status || 500).json({ error: `Failed to fetch stock detail: ${err.message}` });
  }
};

exports.getMarketIndices = async (req, res) => {
  try {
    console.log('Fetching market indices...');
    const indices = await Promise.all(
      ['^GSPC', '^IXIC', '^DJI'].map(async (symbol, index) => {
        if (index > 0) await new Promise(resolve => setTimeout(resolve, 12000));
        try {
          const response = await axios.get('https://www.alphavantage.co/query', {
            params: {
              function: 'TIME_SERIES_DAILY',
              symbol: symbol,
              apikey: ALPHA_VANTAGE_KEY
            }
          });
          console.log(`Raw API Response for ${symbol}:`, response.data);
          const dailyData = response.data['Time Series (Daily)'];
          if (!dailyData) {
            throw new Error('No daily data returned');
          }
          const latestDate = Object.keys(dailyData)[0];
          const latest = dailyData[latestDate];
          const previousDate = Object.keys(dailyData)[1] || latestDate;
          const previous = dailyData[previousDate];
          const latestPrice = parseFloat(latest['4. close']);
          const previousPrice = parseFloat(previous['4. close']);
          const changePercent = isNaN((latestPrice - previousPrice) / previousPrice * 100)
            ? '0.00'
            : ((latestPrice - previousPrice) / previousPrice * 100).toFixed(2);
          const result = {
            symbol,
            price: latestPrice.toString() || '0.00',
            changePercent: `${changePercent}%`
          };
          console.log(`Processed data for ${symbol}:`, result);
          return result;
        } catch (err) {
          console.error(`Error fetching data for ${symbol}:`, err.message, 'Response:', err.response?.data);
          return {
            symbol,
            price: '0.00',
            changePercent: '0.00%',
            error: err.message
          };
        }
      })
    );
    console.log('Final indices data response:', indices);
    res.json(indices);
  } catch (err) {
    console.error('Overall error fetching market indices:', err.message, 'Stack:', err.stack);
    res.status(500).json({ error: `Failed to fetch market indices: ${err.message}` });
  }
};

exports.getTrendingStocks = async (req, res) => {
  try {
    console.log('Fetching trending stocks...');
    const trendingSymbols = ['MSFT', 'NVDA', 'TSLA', 'GOOGL'];
    const trending = await Promise.all(
      trendingSymbols.map(async (symbol, index) => {
        if (index > 0) await new Promise(resolve => setTimeout(resolve, 12000));
        try {
          const response = await axios.get('https://www.alphavantage.co/query', {
            params: {
              function: 'TIME_SERIES_DAILY',
              symbol: symbol,
              apikey: ALPHA_VANTAGE_KEY
            }
          });
          console.log(`Raw API Response for ${symbol}:`, response.data);
          const dailyData = response.data['Time Series (Daily)'];
          if (!dailyData) {
            throw new Error('No daily data returned');
          }
          const latestDate = Object.keys(dailyData)[0];
          const latest = dailyData[latestDate];
          const previousDate = Object.keys(dailyData)[1] || latestDate;
          const previous = dailyData[previousDate];
          const latestPrice = parseFloat(latest['4. close']);
          const previousPrice = parseFloat(previous['4. close']);
          const changePercent = isNaN((latestPrice - previousPrice) / previousPrice * 100)
            ? '0.00'
            : ((latestPrice - previousPrice) / previousPrice * 100).toFixed(2);
          const result = {
            symbol,
            companyName: symbol,
            latestPrice: latestPrice.toString() || '0.00',
            changePercent: `${changePercent}%`
          };
          console.log(`Processed data for ${symbol}:`, result);
          return result;
        } catch (err) {
          console.error(`Error fetching data for ${symbol}:`, err.message, 'Response:', err.response?.data);
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
    console.log('Final trending stocks response:', trending);
    res.json(trending);
  } catch (err) {
    console.error('Overall error fetching trending stocks:', err.message, 'Stack:', err.stack);
    res.status(500).json({ error: `Failed to fetch trending stocks: ${err.message}` });
  }
};

// Remove unused methods for now
exports.getMarketData = async (req, res) => {
  res.status(501).json({ error: 'Not implemented' });
};

exports.getStockHistory = async (req, res) => {
  res.status(501).json({ error: 'Not implemented' });
};