// src/Portfolio.js
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';

const Portfolio = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [portfolioData, setPortfolioData] = useState([]);

  // Simulate performance analysis
  const analyzePerformance = (portfolio) => {
    return portfolio.map(stock => {
      const priceChange = (Math.random() * 10 - 5).toFixed(2); // Random -5% to +5%
      const performance = priceChange > 0 ? 'Positive' : 'Negative';
      const totalValue = stock.quantity * stock.avgBuyPrice;
      return { ...stock, priceChange, performance, totalValue };
    });
  };

  const generateRecommendation = (portfolio) => {
    return portfolio.map(stock => {
      let recommendation = 'Hold';
      if (stock.priceChange > 2) recommendation = 'Buy';
      else if (stock.priceChange < -2) recommendation = 'Sell';
      return { ...stock, recommendation };
    });
  };

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found');
          return;
        }

        const res = await axios.get('http://localhost:5000/api/portfolio', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const analyzed = generateRecommendation(analyzePerformance(res.data.portfolio));
        setPortfolioData(analyzed);
      } catch (err) {
        console.error('Error fetching portfolio:', err);
      }
    };

    fetchPortfolio();
  }, []);

  const totalPortfolioValue = portfolioData.reduce((sum, stock) => sum + (stock.totalValue || 0), 0);
  const aiAnalysis = totalPortfolioValue > 1000 ? 'Strong' : 'Weak';

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const getRecommendations = () => {
    if (totalPortfolioValue < 10000) {
      return 'Consider investing in higher-growth stocks like Amazon (AMZN) or Nvidia (NVDA).';
    } else {
      return 'Your portfolio is strong! Diversify with international stocks like Alibaba (BABA) or Tesla (TSLA).';
    }
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const handleExecuteTrade = () => alert('Trade executed! (This is a placeholder).');

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -250 }}
        animate={{ x: isSidebarOpen ? 0 : -250 }}
        transition={{ duration: 0.3 }}
        className="w-64 bg-gray-800 p-6 fixed h-full shadow-lg z-10"
      >
        <h2 className="text-2xl font-bold mb-8 text-blue-400">StockMaster</h2>
        <nav className="space-y-4">
          <Link to="/dashboard" className="block p-2 rounded hover:bg-gray-700 transition">Dashboard</Link>
          <Link to="/portfolio" className="block p-2 rounded hover:bg-gray-700 transition">Portfolio</Link>
          {localStorage.getItem('role') === 'admin' && (
            <Link to="/admin" className="block p-2 rounded hover:bg-gray-700 transition">Admin Panel</Link>
          )}
          <Link to="#" className="block p-2 rounded hover:bg-gray-700 transition">Stocks</Link>
          <Link to="#" className="block p-2 rounded hover:bg-gray-700 transition">Analytics</Link>

          <motion.button
            whileHover={{ scale: 1.05 }}
            className="w-full bg-red-500 p-2 rounded hover:bg-red-600 transition mt-4"
            onClick={handleLogout}
          >
            Logout
          </motion.button>
        </nav>
      </motion.aside>

      {/* Main Content */}
      <main className={`flex-1 p-6 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 p-4 rounded-lg shadow-md mb-6 flex justify-between items-center"
        >
          <h1 className="text-2xl font-bold">Portfolio</h1>
          <span className="text-sm text-gray-400">
            Last updated: {new Date().toLocaleTimeString()}
          </span>
        </motion.header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Portfolio Summary */}
          <section className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-blue-400">Portfolio Summary</h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="bg-green-500 p-2 rounded hover:bg-green-600 transition mb-4"
              onClick={() =>
                setPortfolioData(generateRecommendation(analyzePerformance(portfolioData)))
              }
            >
              Update AI Recommendations
            </motion.button>

            <div className="bg-gray-700 p-4 rounded-lg mb-4">
              <p className="text-sm text-gray-400">Total Portfolio Value</p>
              <p className="text-2xl font-bold">${totalPortfolioValue.toFixed(2)}</p>
              <button
                onClick={handleExecuteTrade}
                className="w-full bg-green-500 p-2 rounded hover:bg-green-600 transition mt-4"
              >
                Execute Trade
              </button>
              <p className="text-sm text-gray-400 mt-4">Performance Analysis (AI):</p>
              <p className={`text-xl font-bold ${aiAnalysis === 'Strong' ? 'text-green-500' : 'text-red-500'}`}>
                {aiAnalysis}
              </p>
              <p className="text-sm text-gray-400 mt-4">Recommendations:</p>
              <p className="text-lg font-semibold text-blue-300">{getRecommendations()}</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-700">
                    <th className="p-3">Symbol</th>
                    <th className="p-3">Shares</th>
                    <th className="p-3">Avg Buy Price</th>
                    <th className="p-3">Total Value</th>
                    <th className="p-3">Performance</th>
                    <th className="p-3">AI Recommendations</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolioData.map((stock, index) => (
                    <motion.tr
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border-t border-gray-700 hover:bg-gray-600"
                    >
                      <td className="p-3">{stock.symbol}</td>
                      <td className="p-3">{stock.quantity}</td>
                      <td className="p-3">${stock.avgBuyPrice?.toFixed(2)}</td>
                      <td className="p-3">${stock.totalValue?.toFixed(2)}</td>
                      <td className="p-3">{stock.performance} ({stock.priceChange}%)</td>
                      <td className="p-3 font-bold">{stock.recommendation}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </motion.div>
      </main>
    </div>
  );
};

export default Portfolio;
