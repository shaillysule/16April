
// frontend/src/components/StockDetail.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend } from 'chart.js';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

const StockDetail = ({ symbol }) => {
  const [stock, setStock] = useState(null);
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/stocks/${symbol}`)
      .then(response => {
        const data = response.data;
        setStock(data);
        // Placeholder chart data (replace with history API later)
        setChartData({
          labels: ['10:00', '10:02', '10:04'],
          datasets: [{
            label: 'Price',
            data: [3200, 3241, 3211],
            borderColor: 'red',
            fill: false,
          }],
        });
      })
      .catch(error => {
        console.error('Error fetching stock:', error);
        setError('Failed to load stock details. Please try again.');
      });
  }, [symbol]);

  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!stock) return <div>Loading...</div>;

  return (
    <div style={{ padding: '20px', background: '#1a1a1a', color: '#fff' }}>
      <h2>{stock.name} 24 Apr Fut</h2>
      <p>₹{stock.latestPrice || 'N/A'} {stock.changePercent || 'N/A'} 1D</p>
      <Line data={chartData} />
      <button style={{ backgroundColor: '#1e90ff', color: '#fff', border: 'none', padding: '5px 10px', cursor: 'pointer' }}>Buy</button>
      <div>
        <p>Today's Low: {stock.dayLow || 'N/A'}</p>
        <p>Today's High: {stock.dayHigh || 'N/A'}</p>
        <p>Open: ₹{stock.open || 'N/A'}</p>
        <p>Prev Close: ₹{stock.prevClose || 'N/A'}</p>
        <p>Volume (lots): {stock.volume || 'N/A'}</p>
      </div>
    </div>
  );
};

export default StockDetail;