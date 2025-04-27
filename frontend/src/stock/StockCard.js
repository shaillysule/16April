// pages/stock/StockCard.js
import React from 'react';

const StockCard = ({ stock, onClick }) => {
  return (
    <div 
      className="bg-gray-900 p-4 rounded-xl cursor-pointer hover:bg-gray-800 transition"
      onClick={onClick}
    >
      <h3 className="text-lg font-semibold">{stock.symbol}</h3>
      <p className="text-xl">₹{stock.latestPrice || 'N/A'}</p>
      <p className={`text-sm ${parseFloat(stock.changePercent) > 0 ? 'text-green-400' : parseFloat(stock.changePercent) < 0 ? 'text-red-400' : 'text-gray-400'}`}>
        {stock.changePercent || '0.00%'}
      </p>
    </div>
  );
};

export default StockCard;
