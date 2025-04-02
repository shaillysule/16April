import React, { useState, useEffect } from 'react';  // Add useEffect here
import axios from 'axios';  // Import axios
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { parse } from 'postcss';
import {Link}from 'react-router-dom';

// Register the chart components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [news, setNews] = useState([]);

  useEffect(() => {
    axios.get('https://newsapi.org/v2/everything?q=stocks%20market&apiKey=a2c806ed7fa7482a8aac5767e0297bd5')
      .then(response => {
        console.log("News API Response:", response.data); // Debugging
        if (response.data.articles) {
          setNews(response.data.articles.slice(0, 5));
        } else {
          console.error("No news articles found in response.");
        }
      })
      .catch(error => console.error('Error fetching news:', error));
  }, []);
  
  const [trendingStocks, setTrendingStocks] = useState([
    {time:"10:00",price:150},
    {time:"10:05",price:152},
    {time:"10.:10",price:149},
  ]);

  useEffect(() => {
    const fetchTrendingStocks = async () => {
      try {
        const response = await axios.get(
          'https://api.twelvedata.com/time_series?symbol=NVDA,META,AMD&interval=1min&apikey=a6fcb818c0bb42659eb4ef8713c42673'
        );
        
        console.log("API Response:", response.data); // Debugging Line
  
        if (!response.data) {
          console.error("No data received");
          return;
        }
  
        const stocks = Object.keys(response.data).map(symbol => {
          const stockData = response.data[symbol]?.values;
          if (!stockData || stockData.length < 2) {
            console.warn(`Insufficient data for ${symbol}`);
            return null;
          }
  
          return {
            symbol,
            price: parseFloat(stockData[0].close), // Latest price
            change: (
              ((parseFloat(stockData[0].close) - parseFloat(stockData[1].close)) /
                parseFloat(stockData[1].close)) *
              100
            ).toFixed(2), // Percentage change
          };
        }).filter(stock => stock !== null); // Remove null entries
  
        setTrendingStocks(stocks);
      } catch (error) {
        console.error('Error fetching trending stocks:', error);
      }
    };
  
    fetchTrendingStocks();
    const interval = setInterval(fetchTrendingStocks, 60000); // Update every 60 seconds
  
    return () => clearInterval(interval); // Cleanup on unmount
  }, []);
  
  const mockWatchlist = [
    { symbol: 'MSFT', price: 305.10 },
    { symbol: 'AMZN', price: 3400.75 },
  ];

  

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isSubscribed');
    localStorage.removeItem('freeAITrials');
    navigate('/');
  };
  // const stockHistory = {
  //   labels: ['10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM'],
  //   datasets: [
  //     {
  //       label: 'AAPL Stock Price ($)',
  //       data: [149, 150, 152, 151, 153, 155],
  //       borderColor: 'rgb(75, 192, 192)',
  //       backgroundColor: 'rgba(75, 192, 192, 0.2)',
  //     },
  //   ],
  // };
  const RealTimeStockChart = ({ symbol }) => {
    const [stockData, setStockData] = useState({
      labels: [],
      datasets: [
        {
          label: `${symbol} Stock Price ($)`,
          data: [],
          borderColor: "rgb(75, 192, 192)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
        },
      ],
    });
  
    const fetchStockData = async () => {
      try {
        const response = await axios.get(
          `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=1min&apikey=YOUR_API_KEY`
        );
  
        if (response.data && response.data.values) {
          const prices = response.data.values.slice(0, 10).reverse(); // Take the latest 10 data points
  
          setStockData({
            labels: prices.map((entry) => entry.datetime.split(" ")[1]), // Extract only time
            datasets: [
              {
                label: `${symbol} Stock Price ($)`,
                data: prices.map((entry) => parseFloat(entry.close)), // Get closing prices
                borderColor: "rgb(75, 192, 192)",
                backgroundColor: "rgba(75, 192, 192, 0.2)",
              },
            ],
          });
        }
      } catch (error) {
        console.error("Error fetching stock data:", error);
      }
    };
  
    useEffect(() => {
      fetchStockData(); // Fetch immediately
      const interval = setInterval(fetchStockData, 60000); // Update every minute
  
      return () => clearInterval(interval); // Cleanup on unmount
    }, [symbol]); // Depend on symbol to update when it changes
  
    return (
      <div className="bg-white p-4 rounded-lg shadow-md">
        <Line data={stockData} />
      c</div>
    );
  };
  
 
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 flex">
      {/* Sidebar */}
      

<motion.aside
  initial={{ x: -250 }}
  animate={{ x: isSidebarOpen ? 0 : -250 }}
  transition={{ duration: 0.3, ease: "easeInOut" }}
  className="w-64 bg-white shadow-md fixed h-full z-50 flex flex-col justify-between border-r border-gray-300"
>
  <div className="p-6">
    <h2 className="text-2xl font-bold text-blue-600">StockMaster</h2>
    <nav className="mt-8 space-y-4">
      <Link to="/dashboard" className="block p-3 rounded-md text-gray-800 hover:bg-gray-200 transition">
        Dashboard
      </Link>
      <Link to="/portfolio" className="block p-3 rounded-md text-gray-800 hover:bg-gray-200 transition">
        Portfolio
      </Link>
      <Link to="/stocks" className="block p-3 rounded-md text-gray-800 hover:bg-gray-200 transition">
        Stocks
      </Link>
      <Link to="/analytics" className="block p-3 rounded-md text-gray-800 hover:bg-gray-200 transition">
        Analytics
      </Link>
    </nav>
  </div>

  <motion.button
    whileHover={{ scale: 1.1 }}
    className="w-full bg-red-500 text-white p-3 rounded-md hover:bg-red-600 transition"
    onClick={handleLogout}
  >
    Logout
  </motion.button>
</motion.aside>

      {/* Main Content */}
      <main className={`flex-1 p-6 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-4 rounded-lg shadow-md mb-6 flex justify-between items-center border border-gray-300"
        >
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleSidebar}
              className="text-gray-800 focus:outline-none"
            >
              {isSidebarOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </motion.button>
            <h1 className="text-2xl font-bold">Dashboard</h1>
          </div>
          <span className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleTimeString()}
          </span>
        </motion.header>

        {/* Content Sections */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6">
          

          {/* Market News */}
          <section className="bg-gray-100 p-6 rounded-lg shadow-md">
  <h2 className="text-xl font-semibold mb-4 text-blue-600">🔥 Trending Stocks</h2>
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
    {trendingStocks.map((stock, index) => (
      <motion.div
        key={index}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        transition={{ delay: index * 0.1, duration: 0.3 }}
        className="p-5 rounded-lg shadow-md bg-white border-l-4 border-blue-500"
      >
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800">{stock.symbol}</h3>
          <p
            className={`text-sm font-semibold ${
              stock.change >= 0 ? "text-green-500" : "text-red-500"
            }`}
          >
            {stock.change >= 0 ? "▲" : "▼"} {stock.change}%
          </p>
        </div>
        <p className="text-xl font-semibold text-gray-700">${stock.price.toFixed(2)}</p>
      </motion.div>
    ))}
  </div>
</section>
  {/* Market News */}
  <section className="bg-gray-100 p-6 rounded-lg shadow-md">
  <h2 className="text-xl font-semibold mb-4 text-blue-600">📰 Market News</h2>
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {news.map((article, index) => (
      <motion.a
        key={index}
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="bg-white p-4 rounded-lg hover:bg-gray-200 transition block"
      >
        <h3 className="text-lg font-semibold text-gray-800">{article.title}</h3>
        <p className="text-sm text-gray-600">{article.source.name}</p>
        <p className="text-sm text-gray-700 mt-2">{article.description}</p>
      </motion.a>
    ))}
  </div>
</section>

{/* Real-Time Stock Chart */}
<section className="bg-gray-100 p-6 rounded-lg shadow-md">
  <h2 className="text-xl font-semibold mb-4 text-blue-600">📈 AAPL Real-Time Stock Chart</h2>
  <div className="bg-white p-4 rounded-lg shadow-md">
    <RealTimeStockChart symbol="AAPL" />
  </div>
</section>



          {/* Quick Stats */}
          <section className="bg-white p-6 rounded-lg shadow-lg border border-gray-300">
            <h2 className="text-xl font-semibold mb-4 text-blue-600">Quick Stats</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Portfolio Value</p>
                <p className="text-lg font-bold">$12,345.67</p>
              </div>
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Daily Gain/Loss</p>
                <p className="text-lg font-bold text-green-500">+$123.45</p>
              </div>
            </div>
          </section>

 {/* Your Watchlist */}
 <section className="bg-white p-6 rounded-lg shadow-lg border border-gray-300">
            <h2 className="text-xl font-semibold mb-4 text-blue-600">Your Watchlist</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {mockWatchlist.map((stock, index) => (
                <div key={index} className="bg-gray-100 p-4 rounded-lg border border-gray-300">
                  <h3 className="text-lg font-bold">{stock.symbol}</h3>
                  <p className="text-xl font-semibold">${stock.price.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </section>
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;
