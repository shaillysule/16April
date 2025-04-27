
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const StocksOverview = () => {
  const [stocks, setStocks] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const symbols = ['AAPL', 'TSLA', 'GOOGL'];
        const stockData = await Promise.all(
          symbols.map(symbol =>
            axios.get(`http://localhost:5000/api/stocks/${symbol}`, {
              headers: { 'x-auth-token': localStorage.getItem('token') }
            }).then(res => res.data)
          )
        );
        setStocks(stockData);
      } catch (err) {
        console.error('Error fetching stocks:', err);
        setError('Failed to load stocks. Please try again.');
      }
    };
    fetchStocks();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-4xl mx-auto"
      >
        <h1 className="text-3xl font-bold mb-6">Stocks Overview</h1>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stocks.length > 0 ? (
            stocks.map((stock, idx) => (
              <div key={idx} className="bg-gray-800 p-4 rounded-lg shadow">
                <h2 className="text-xl font-semibold">{stock.symbol}</h2>
                <p>Price: ${parseFloat(stock.latestPrice).toFixed(2)}</p>
                <p>Change: {stock.changePercent}</p>
              </div>
            ))
          ) : (
            <p>Loading stocks...</p>
          )}
        </div>
        <a href="/dashboard" className="mt-6 inline-block text-blue-500 hover:underline">
          Back to Dashboard
        </a>
      </motion.div>
    </div>
  );
};

export default StocksOverview;