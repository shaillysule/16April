// frontend/src/components/StockList.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const StockList = () => {
  const [stocks, setStocks] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:5000/api/stocks', {
      headers: { 'x-auth-token': localStorage.getItem('token') }
    })
      .then(response => {
        if (Array.isArray(response.data)) {
          setStocks(response.data);
        } else {
          setStocks([response.data]);
        }
      })
      .catch(error => {
        console.error('Error fetching stocks:', error);
        if (error.response?.status === 401) {
          setError('Please log in to view stock data.');
        } else if (error.response?.status === 404) {
          setError('Stock data not found.');
        } else {
          setError('Failed to load market data. Please try again.');
        }
      });
  }, []);

  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div style={{ padding: '20px', background: '#1a1a1a', color: '#fff' }}>
      <h2>Stocks in News</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
        {stocks.map(stock => (
          <div key={stock.symbol} style={{ padding: '10px', border: '1px solid #333' }}>
            <h3>{stock.companyName || stock.symbol}</h3>
            <p>₹{stock.latestPrice || 'N/A'}</p>
            <p>{stock.changePercent || 'N/A'}</p>
            {stock.error && <p style={{ color: 'red' }}>Error: {stock.error}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StockList;