// components/StockCard.js
// components/StockCard.js
import React from 'react';

const StockCard = ({ stock, onClick }) => {
  // Handle different ways the stock data might be formatted
  const symbol = stock.symbol || '';
  const companyName = stock.companyName || stock.name || symbol;
  const price = stock.latestPrice || stock.price || '0.00';
  const changePercent = stock.changePercent || '0.00%';
  
  // Ensure proper formatting for display
  const formattedPrice = typeof price === 'string' && price.includes('₹') 
    ? price 
    : `₹${price}`;
  
  // Parse the percent change for styling
  const percentValue = parseFloat(changePercent);
  const isPositive = percentValue > 0;
  const isNeutral = percentValue === 0 || isNaN(percentValue);
  
  return (
    <div onClick={onClick} className="bg-gray-900 p-4 rounded-xl cursor-pointer hover:bg-gray-800 transition">
      <div className="flex items-center mb-2">
        {stock.logo ? (
          <img src={stock.logo} alt={symbol} className="w-8 h-8 rounded" />
        ) : (
          <div className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center text-xs">
            {symbol.slice(0, 2)}
          </div>
        )}
        <h2 className="ml-2 text-lg font-semibold">{symbol}</h2>
      </div>
      <p className="text-sm text-gray-400">{companyName}</p>
      <div className="mt-2 flex items-baseline">
        <p className="text-lg font-medium">{formattedPrice}</p>
        <p className={`ml-2 text-sm ${isPositive ? 'text-green-400' : isNeutral ? 'text-gray-400' : 'text-red-400'}`}>
          {isPositive ? '+' : ''}{changePercent}
        </p>
      </div>
    </div>
  );
};

export default StockCard;