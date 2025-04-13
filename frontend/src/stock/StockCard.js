// pages/stock/StockCard.js
import React from 'react';

const StockCard = ({ stock, onClick }) => {
  return (
    <div onClick={onClick} className="bg-gray-900 p-4 rounded-xl cursor-pointer hover:bg-gray-800 transition">
      <h2 className="text-xl font-semibold">{stock.symbol}</h2>
      <p className="text-sm text-gray-400">{stock.companyName}</p>
      <p className="text-green-400 mt-2">${stock.latestPrice}</p>
    </div>
  );
};

export default StockCard;
