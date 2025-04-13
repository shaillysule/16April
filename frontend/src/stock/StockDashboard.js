// pages/stock/StockPage.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import StockCard from './StockCard';

const StockPage = () => {
  const [stocks, setStocks] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const res = await axios.get('/api/stocks'); // From backend route
        setStocks(res.data);
      } catch (err) {
        console.error('Error fetching stock data:', err);
        setError('Failed to load stocks. Please try again.');
      }
    };
    fetchStocks();
  }, []);

  return (
    <div className="bg-black min-h-screen text-white p-6">
      <h1 className="text-3xl font-bold mb-4">Stock Dashboard</h1>
      {error && <p className="text-red-500">{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stocks.map((stock) => (
          <StockCard key={stock.symbol} stock={stock} />
        ))}
      </div>
    </div>
  );
};

export default StockPage;
