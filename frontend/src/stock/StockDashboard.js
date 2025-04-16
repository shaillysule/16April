// pages/stock/StockDashboard.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import StockCard from './StockCard';

const StockDashboard = () => {
  const [stocks, setStocks] = useState([]);
  const [marketIndices, setMarketIndices] = useState([]);
  const [activeTab, setActiveTab] = useState('explore');
  const [newsStocks, setNewsStocks] = useState([]);
  const [trendingStocks, setTrendingStocks] = useState([]);
  const [gainers, setGainers] = useState([]);
  const [gainersCategory, setGainersCategory] = useState('large');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  


  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication required. Please log in.');
          setLoading(false);
          return;
        }

        const headers = {
          Authorization: `Bearer ${token}`
        };

        // Fetch regular stocks
        const stocksResponse =axios.get('http://localhost:5000/api/stocks', { headers });
        setStocks(stocksResponse.data || []);

        // Fetch market indices
        const indicesResponse = await axios.get('http://localhost:5000/api/stocks/indices/market', { headers });
        setMarketIndices(indicesResponse.data || []);

        // Fetch trending stocks
        const trendingResponse = await axios.get('http://localhost:5000/api/stocks/trending/stocks', { headers });
        setTrendingStocks(trendingResponse.data || []);

        // For stocks in news and gainers, we'll use filtered data from the main stocks list
        // In a real app, you might have separate endpoints for these
        
        // Simulate stocks in news (first 4 stocks for demo)
        setNewsStocks(stocksResponse.data.slice(0, 4) || []);
        
        // Simulate gainers (filter stocks with positive change)
        const gainersData = stocksResponse.data
          .filter(stock => parseFloat(stock.changePercent) > 0)
          .map(stock => ({
            ...stock,
            category: 'large' // Add a category for filtering
          }));
        setGainers(gainersData || []);
        
        setLoading(false);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load market data. Please try again.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleStockClick = (symbol) => {
    navigate(`/stock/${symbol}`);
  };

  const handleRefresh = () => {
    // Add a refresh function to get the latest data
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication required. Please log in.');
          return;
        }

        const headers = {
          Authorization: `Bearer ${token}`
        };

        // Fetch regular stocks again for refresh
        const stocksResponse = await axios.get('http://localhost:5000/api/stocks', { headers });
        setStocks(stocksResponse.data || []);
        
        // Update other sections as needed
        
        setError(null);
      } catch (err) {
        console.error('Error refreshing data:', err);
        setError('Failed to refresh market data. Please try again.');
      }
    };
    
    fetchData();
  };

  if (loading) {
    return (
      <div className="bg-black min-h-screen text-white p-4 flex items-center justify-center">
        <div className="text-xl">Loading market data...</div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen text-white p-4">
      {/* App header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-green-500 mr-3"></div>
          <h1 className="text-2xl font-bold">Stocks</h1>
        </div>
        <div className="flex items-center">
          <button className="mr-4" onClick={handleRefresh}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button className="mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <div className="w-8 h-8 rounded-full bg-gray-400"></div>
        </div>
      </div>

      {/* Market indices */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {marketIndices.map((index) => (
          <div key={index.symbol} className="bg-gray-900 p-4 rounded-xl">
            <h2 className="text-lg font-semibold">{index.symbol}</h2>
            <div className="flex items-end">
              <p className="text-xl">{index.price}</p>
              <p className={`ml-2 text-sm ${
                parseFloat(index.changePercent) > 0 
                  ? 'text-green-400' 
                  : parseFloat(index.changePercent) < 0 
                    ? 'text-red-400' 
                    : 'text-gray-400'
              }`}>
                {index.changePercent}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation tabs */}
      <div className="flex space-x-4 mb-6 overflow-x-auto pb-2">
        <button
          className={`px-6 py-2 rounded-full ${activeTab === 'explore' ? 'bg-gray-700 text-white' : 'bg-gray-900 text-gray-400'}`}
          onClick={() => setActiveTab('explore')}
        >
          Explore
        </button>
        <button
          className={`px-6 py-2 rounded-full ${activeTab === 'holdings' ? 'bg-gray-700 text-white' : 'bg-gray-900 text-gray-400'}`}
          onClick={() => setActiveTab('holdings')}
        >
          Holdings
        </button>
        <button
          className={`px-6 py-2 rounded-full ${activeTab === 'watchlist' ? 'bg-gray-700 text-white' : 'bg-gray-900 text-gray-400'}`}
          onClick={() => setActiveTab('watchlist')}
        >
          My Watchlist
        </button>
        <button className="px-6 py-2 rounded-full bg-transparent text-green-400 flex items-center">
          <span className="mr-1">+</span> Watch
        </button>
      </div>

      {/* Real-time Status Indicator */}
      <div className="mb-4 flex items-center">
        <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
        <span className="text-sm text-gray-400">Live Market Data</span>
        <span className="ml-2 text-xs bg-gray-800 rounded px-2 py-1">Last updated: {new Date().toLocaleTimeString()}</span>
      </div>

      {/* Stocks in news section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Stocks in news</h2>
          <button className="text-green-400">See more</button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {newsStocks.map((stock) => (
            <StockCard
              key={stock.symbol}
              stock={stock}
              onClick={() => handleStockClick(stock.symbol)}
            />
          ))}
        </div>
      </div>

      {/* Most traded section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Most traded stocks</h2>
        <div className="grid grid-cols-2 gap-4">
          {trendingStocks.map((stock) => (
            <StockCard
              key={stock.symbol}
              stock={stock}
              onClick={() => handleStockClick(stock.symbol)}
            />
          ))}
        </div>
      </div>

      {/* Gainers section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <div className="flex space-x-4 border-b border-gray-800">
            <button 
              className={`pb-2 ${gainersCategory === 'large' ? 'text-green-400 border-b-2 border-green-400' : 'text-gray-500'}`}
              onClick={() => setGainersCategory('large')}
            >
              Gainers
            </button>
            <button 
              className={`pb-2 ${gainersCategory === 'losers' ? 'text-green-400 border-b-2 border-green-400' : 'text-gray-500'}`}
              onClick={() => setGainersCategory('losers')}
            >
              Losers
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {gainers
            .filter(stock => stock.category === gainersCategory)
            .slice(0, 3) // Show only first 3
            .map((stock) => (
              <StockCard
                key={stock.symbol}
                stock={stock}
                onClick={() => handleStockClick(stock.symbol)}
              />
            ))}
          <div 
            className="bg-gray-900 p-4 rounded-xl flex items-center justify-center cursor-pointer hover:bg-gray-800 transition"
            onClick={() => alert('View more gainers')}
          >
            <div className="text-center">
              <p className="text-lg font-semibold">See more &gt;</p>
              <p className="text-sm text-gray-400">Gainers</p>
            </div>
          </div>
        </div>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}
    </div>
  );
};

export default StockDashboard;