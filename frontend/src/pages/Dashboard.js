import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const navigate = useNavigate();

  // Avoid infinite redirects
  useEffect(() => {
    // Uncomment this if you need to navigate away under a specific condition
    // navigate('/');
  }, [navigate]);

  // Mock data for stocks and watchlist
  const mockStocks = [
    { symbol: 'AAPL', price: 150.25, change: 1.5 },
    { symbol: 'TSLA', price: 700.80, change: -0.8 },
    { symbol: 'GOOGL', price: 2800.50, change: 0.9 },
  ];
  const mockWatchlist = [
    { symbol: 'MSFT', price: 305.10 },
    { symbol: 'AMZN', price: 3400.75 },
  ];

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isSubscribed');
    localStorage.removeItem('freeAITrials');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -250 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.5 }}
        className="w-64 bg-gray-800 p-6 fixed h-full shadow-lg"
      >
        <h2 className="text-2xl font-bold mb-8 text-blue-400">StockMaster</h2>
        <nav className="space-y-4">
          <a href="#" className="block p-2 rounded hover:bg-gray-700 transition">Dashboard</a>
          <a href="#" className="block p-2 rounded hover:bg-gray-700 transition">Portfolio</a>
          <a href="#" className="block p-2 rounded hover:bg-gray-700 transition">Stocks</a>
          <a href="#" className="block p-2 rounded hover:bg-gray-700 transition">Analytics</a>
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="w-full bg-red-500 p-2 rounded hover:bg-red-600 transition mt-4"
            onClick={handleLogout}
          >
            Logout
          </motion.button>
        </nav>
      </motion.aside>

      <main className='flex-1 ml-64 p-6'>
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className='bg-gray-800 p-4 rounded-lg shadow-md mb-6 flex justify-between items-center'
        >
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <span className='text-sm text-gray-400'>Last updated: {new Date().toLocaleTimeString()}</span>
        </motion.header>

        {/* Content Sections */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='space-y-6'
        >
          {/* Stock Market Snapshot */}
          <section className='bg-gray-800 p-6 rounded-lg shadow-lg'>
            <h2 className='text-xl font-semibold mb-4 text-blue-400'>Stock Market Snapshot</h2>
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
              {mockStocks.map((stock, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className='bg-gray-700 p-4 rounded-lg hover:bg-gray-600 transition'
                >
                  <h3 className='text-lg font-bold'>{stock.symbol}</h3>
                  <p className="text-xl">${stock.price.toFixed(2)}</p>
                  <p className={`text-sm ${stock.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%
                  </p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Watchlist */}
          <section className='bg-gray-800 p-6 rounded-lg shadow-lg'>
            <h2 className='text-xl font-semibold mb-4 text-blue-400'>Your Watchlist</h2>
            <div className="space-y-4">
              {mockWatchlist.map((stock, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className='flex justify-between items-center bg-gray-700 p-3 rounded-lg hover:bg-gray-600 transition'
                >
                  <span className='font-semibold'>{stock.symbol}</span>
                  <span>${stock.price.toFixed(2)}</span>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Quick Stats */}
          <section className='bg-gray-800 p-6 rounded-lg shadow-lg'>
            <h2 className="text-xl font-semibold mb-4 text-blue-400">Quick Stats</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-400">Portfolio Value</p>
                <p className="text-lg font-bold">$12,345.67</p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-400">Daily Gain/Loss</p>
                <p className="text-lg font-bold text-green-500">+$123.45</p>
              </div>
            </div>
          </section>
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;
