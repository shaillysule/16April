// pages/stock/StockDetail.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const StockDetail = () => {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const [stock, setStock] = useState({});
  const [chartData, setChartData] = useState({ dates: [], prices: [] });
  const [interval, setInterval] = useState('daily'); // daily, weekly, monthly
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [takeProfit, setTakeProfit] = useState("");
  const [stopLoss, setStopLoss] = useState("");

  useEffect(() => {
    const fetchStockDetail = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          setError('Authentication required. Please log in.');
          setLoading(false);
          return;
        }

        const headers = {
          Authorization: `Bearer ${token}`
        };

        // Fetch stock details
        const stockResponse = await axios.get(`/api/stocks/${symbol}`, { headers });
        setStock(stockResponse.data || {});

        // Fetch stock history for chart
        const historyResponse = await axios.get(`/api/stocks/${symbol}/history?interval=${interval}`, { headers });
        setChartData({
          dates: historyResponse.data.dates || [],
          prices: historyResponse.data.prices || [],
        });

        setLoading(false);
        setError(null);
      } catch (error) {
        console.error("Error fetching stock details:", error);
        setError(error.response?.data?.error || 'Failed to load stock data');
        setLoading(false);
      }
    };

    fetchStockDetail();
  }, [symbol, interval]);

  const handleBuyStock = async () => {
    try {
      if (!stock.latestPrice) {
        setError('Stock price is not available');
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        setError('Authentication required. Please log in.');
        return;
      }

      const response = await axios.post(
        "/api/portfolio/buy",
        {
          symbol,
          price: stock.latestPrice,
          takeProfit,
          stopLoss,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Stock bought successfully!");
    } catch (error) {
      console.error("Error buying stock:", error);
      setError(error.response?.data?.error || 'Failed to buy stock');
    }
  };

  const handleRefresh = () => {
    // Function to refresh the stock data
    const fetchStockDetail = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError('Authentication required. Please log in.');
          return;
        }

        const headers = {
          Authorization: `Bearer ${token}`
        };

        // Fetch stock details
        const stockResponse = await axios.get(`/api/stocks/${symbol}`, { headers });
        setStock(stockResponse.data || {});

        // Fetch stock history for chart
        const historyResponse = await axios.get(`/api/stocks/${symbol}/history?interval=${interval}`, { headers });
        setChartData({
          dates: historyResponse.data.dates || [],
          prices: historyResponse.data.prices || [],
        });

        setError(null);
      } catch (error) {
        console.error("Error refreshing stock details:", error);
        setError(error.response?.data?.error || 'Failed to refresh stock data');
      }
    };

    fetchStockDetail();
  };

  // Custom Line Chart Component
  const LineChart = ({ data, labels }) => {
    if (!data || data.length === 0) return <div>No chart data available</div>;

    const width = 800;
    const height = 300;
    const padding = 40;
    
    // Calculate min and max for scaling
    const minValue = Math.min(...data);
    const maxValue = Math.max(...data);
    
    // Scale data points to fit in the chart area
    const getX = (index) => padding + (index * (width - 2 * padding)) / (data.length - 1);
    const getY = (value) => height - padding - ((value - minValue) * (height - 2 * padding)) / (maxValue - minValue);
    
    // Create the path for the line
    let path = "";
    data.forEach((value, index) => {
      if (index === 0) {
        path += `M ${getX(index)} ${getY(value)} `;
      } else {
        path += `L ${getX(index)} ${getY(value)} `;
      }
    });

    return (
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
        {/* Grid lines */}
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#444" strokeWidth="1" />
        <line x1={padding} y1={height - padding} x2={padding} y2={padding} stroke="#444" strokeWidth="1" />
        
        {/* Y-axis labels */}
        <text x={padding - 10} y={padding} textAnchor="end" fill="#aaa" fontSize="12">{maxValue.toFixed(2)}</text>
        <text x={padding - 10} y={height - padding} textAnchor="end" fill="#aaa" fontSize="12">{minValue.toFixed(2)}</text>
        
        {/* X-axis labels (show first, middle and last date) */}
        {labels && labels.length > 0 && (
          <>
            <text x={padding} y={height - padding + 20} textAnchor="middle" fill="#aaa" fontSize="12">{labels[0]}</text>
            {labels.length > 2 && (
              <text 
                x={getX(Math.floor(labels.length / 2))} 
                y={height - padding + 20} 
                textAnchor="middle" 
                fill="#aaa" 
                fontSize="12"
              >
                {labels[Math.floor(labels.length / 2)]}
              </text>
            )}
            <text 
              x={getX(labels.length - 1)} 
              y={height - padding + 20} 
              textAnchor="middle" 
              fill="#aaa" 
              fontSize="12"
            >
              {labels[labels.length - 1]}
            </text>
          </>
        )}
        
        {/* Line */}
        <path d={path} fill="none" stroke="#4CAF50" strokeWidth="2" />
        
        {/* Data points */}
        {data.map((value, index) => (
          <circle 
            key={index} 
            cx={getX(index)} 
            cy={getY(value)} 
            r="3" 
            fill="#4CAF50" 
          />
        ))}
      </svg>
    );
  };

  if (loading) {
    return (
      <div className="bg-black min-h-screen text-white p-6 flex items-center justify-center">
        <div className="text-xl">Loading stock data...</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-black text-white min-h-screen">
      {/* Header with navigation */}
      <div className="flex items-center mb-6">
        <button onClick={() => navigate(-1)} className="mr-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-3xl font-bold">{stock.name || symbol}</h1>
        <button onClick={handleRefresh} className="ml-auto">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Price and change */}
      <div className="mb-6">
        <div className="flex items-baseline">
          <h2 className="text-4xl font-bold">₹{stock.latestPrice || '0.00'}</h2>
          <p className={`ml-3 text-lg ${
            parseFloat(stock.changePercent) > 0 
              ? 'text-green-400' 
              : parseFloat(stock.changePercent) < 0 
                ? 'text-red-400' 
                : 'text-gray-400'
          }`}>
            {stock.changePercent || '0.00%'}
          </p>
        </div>
        <p className="text-sm text-gray-400 mt-1">Last updated: {new Date().toLocaleTimeString()}</p>
      </div>

      {/* Chart Section */}
      <div className="bg-gray-900 p-4 rounded-lg mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Price History</h3>
          <div className="flex space-x-2">
            <button 
              className={`px-3 py-1 rounded ${interval === 'daily' ? 'bg-green-600' : 'bg-gray-800'}`}
              onClick={() => setInterval('daily')}
            >
              1D
            </button>
            <button 
              className={`px-3 py-1 rounded ${interval === 'weekly' ? 'bg-green-600' : 'bg-gray-800'}`}
              onClick={() => setInterval('weekly')}
            >
              1W
            </button>
            <button 
              className={`px-3 py-1 rounded ${interval === 'monthly' ? 'bg-green-600' : 'bg-gray-800'}`}
              onClick={() => setInterval('monthly')}
            >
              1M
            </button>
          </div>
        </div>
        <LineChart data={chartData.prices} labels={chartData.dates} />
      </div>

      {/* TP / SL Section */}
      <div className="bg-gray-900 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-semibold mb-2">Set TP / SL</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-400">Take Profit (₹)</label>
            <input
              type="number"
              value={takeProfit}
              onChange={(e) => setTakeProfit(e.target.value)}
              placeholder={`e.g., ${(parseFloat(stock.latestPrice || 0) * 1.05).toFixed(2)}`}
              className="w-full mt-1 p-2 bg-gray-800 text-white rounded"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400">Stop Loss (₹)</label>
            <input
              type="number"
              value={stopLoss}
              onChange={(e) => setStopLoss(e.target.value)}
              placeholder={`e.g., ${(parseFloat(stock.latestPrice || 0) * 0.95).toFixed(2)}`}
              className="w-full mt-1 p-2 bg-gray-800 text-white rounded"
            />
          </div>
        </div>
      </div>

      {/* Stock Info Section */}
      <div className="bg-gray-900 p-4 rounded-lg mb-6">
        <h3 className="text-xl font-semibold mb-2">Performance</h3>
        <div className="grid grid-cols-2 gap-y-2">
          <div>
            <p className="text-sm text-gray-400">Price</p>
            <p>₹{stock.latestPrice || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Day High</p>
            <p>₹{stock.dayHigh || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Day Low</p>
            <p>₹{stock.dayLow || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">52W High</p>
            <p>₹{stock.yearHigh || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">52W Low</p>
            <p>₹{stock.yearLow || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Company info */}
      <div className="bg-gray-900 p-4 rounded-lg mb-6">
        <h3 className="text-xl font-semibold mb-2">About {stock.name || symbol}</h3>
        <div className="mb-3">
          <p className="text-sm text-gray-400">Sector</p>
          <p>{stock.sector || 'N/A'}</p>
        </div>
        <div className="mb-3">
          <p className="text-sm text-gray-400">Industry</p>
          <p>{stock.industry || 'N/A'}</p>
        </div>
        <div className="mb-3">
          <p className="text-sm text-gray-400">Description</p>
          <p className="text-sm">{stock.description || `No description available for ${symbol}`}</p>
        </div>
      </div>

      {/* Buy Button */}
      <div className="flex justify-center">
        <button
          onClick={handleBuyStock}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-2xl shadow-md transition-all"
        >
          Buy Stock
        </button>
      </div>

      {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
    </div>
  );
};

export default StockDetail;