// pages/stock/StockDetail.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const StockDetail = () => {
  const { symbol } = useParams();
  const [stock, setStock] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStockDetail = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`/api/stocks/${symbol}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStock(response.data);
      } catch (err) {
        setError('Failed to fetch stock detail.');
        console.error(err);
      }
    };

    fetchStockDetail();
  }, [symbol]);

  if (error) return <p className="text-red-500">{error}</p>;
  if (!stock) return <p className="text-white">Loading...</p>;

  return (
    <div className="bg-black text-white p-6 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">{stock.companyName} ({stock.symbol})</h1>
      <p>Price: ${stock.latestPrice}</p>
      <p>Today Change: {stock.changePercent}%</p>
      <p className="mt-2 text-gray-400">{stock.description}</p>
      {/* Chart and Buy/Sell buttons can be added here later */}
    </div>
  );
};

export default StockDetail;
