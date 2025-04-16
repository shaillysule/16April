import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Line } from "react-chartjs-2";

import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
} from "chart.js";
import axios from "axios";
import RealTimeStockChart from "../components/RealTimeStockChart"; // make sure this file exists
import Chatbot from "../components/Chatbot";

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [trendingStocks, setTrendingStocks] = useState([]);
  const [news, setNews] = useState([]);
  const [userRole, setUserRole] = useState("userRole");
  const [mockWatchlist, setMockWatchlist] = useState([]);
  const [stockData, setStockData] = useState(null); // initially null
  const [showChatbot, setShowChatbot]=useState(false);
  const [isSubscribed,setIsSubscribed]=useState(false);
   
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        // Comment out the failing API call
        /* 
        const response = await axios.get('/api/user', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setIsSubscribed(response.data.isSubscribed);
        */
        
        // Use mock data instead
        setIsSubscribed(true); // Set to true to enable chatbot access
        console.log("Using mock subscription data: Subscribed = true");
      } catch (error) {
        console.error('subscription check failed:', error);
      }
    };
    setTrendingStocks([
      { symbol: "AAPL", change: 1.5, price: 189.34 },
      { symbol: "GOOG", change: -0.7, price: 2823.54 },
      { symbol: "TSLA", change: 2.3, price: 765.23 },
    ]);

    setNews([
      {
        title: "Stock Market Rallies",
        source: { name: "Bloomberg" },
        description: "Markets are rallying after tech earnings beat expectations.",
        url: "https://bloomberg.com",
      },
      {
        title: "Tesla Surges 2%",
        source: { name: "Reuters" },
        description: "Tesla stock rose after announcing new battery tech.",
        url: "https://reuters.com",
      },
    ]);

    setMockWatchlist([
      { symbol: "NFLX", price: 356.89 },
      { symbol: "MSFT", price: 234.12 },
    ]);

    // Safe fallback data for line chart
    setStockData({
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
      datasets: [
        {
          label: "AAPL",
          data: [180, 182, 185, 183, 189],
          borderColor: "rgb(75, 192, 192)",
          tension: 0.4,
          fill: false,
        },
        {
          label: "TSLA",
          data: [710, 730, 725, 740, 765],
          borderColor: "rgb(255, 99, 132)",
          tension: 0.4,
          fill: false,
        },
        {
          label: "AMZN",
          data: [3100, 3120, 3150, 3130, 3180],
          borderColor: "rgb(153, 102, 255)",
          tension: 0.4,
          fill: false,
        },
      ],
    });

    const role = localStorage.getItem("role");
    if (role) setUserRole(role);
  }, []);
  const handleChatbotToggle=()=>{
    setShowChatbot(!showChatbot);
    if(!isSubscribed){
      alert('Please subscribe to acces the AI chatbot.');
      return;
    }setShowChatbot(!showChatbot);
  };
  console.log("Subscription status:", isSubscribed);
  console.log("Chatbot visibility:", showChatbot);
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
          <h2 className="text-2xl font-bold text-blue-600">NexgenStocks</h2>
          <nav className="mt-8 space-y-4">
            <Link to="/dashboard" className="block p-3 rounded-md hover:bg-gray-200">
              Dashboard
            </Link>
            <Link to="/portfolio" className="block p-3 rounded-md hover:bg-gray-200">
              Portfolio
            </Link>
            <Link to="/stocks" className="block p-3 rounded-md hover:bg-gray-200">
              Stocks
            </Link>
            <Link to="/analytics" className="block p-3 rounded-md hover:bg-gray-200">
             analytics
            </Link>
            {userRole === "admin" && (
              <Link to="/admin" className="block p-3 rounded-md hover:bg-gray-200 text-red-600">
                Admin Panel
              </Link>
            )}
          </nav>
        </div>
        <div className="p-6">
          <button onClick={handleLogout} className="w-full bg-red-500 text-white p-2 rounded-md">
            Logout
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className={`flex-1 p-6 transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-0"}`}>
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-4 rounded-lg shadow-md mb-6 flex justify-between items-center"
        >
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleSidebar}
              className="text-gray-800"
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
          <span className="text-sm text-gray-500">Last updated: {new Date().toLocaleTimeString()}</span>
        </motion.header>

        {/* Dashboard Sections */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6">
          {/* Trending Stocks */}
          <section className="bg-gray-100 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-blue-600 mb-4">🔥 Trending Stocks</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {trendingStocks.map((stock, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  className="p-5 rounded-lg bg-white shadow-md border-l-4 border-blue-500"
                >
                  <div className="flex justify-between">
                    <h3 className="text-lg font-bold">{stock.symbol}</h3>
                    <p className={`font-semibold ${stock.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {stock.change >= 0 ? "▲" : "▼"} {stock.change}%
                    </p>
                  </div>
                  <p className="text-xl font-semibold">${stock.price.toFixed(2)}</p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* News */}
          <section className="bg-gray-100 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-blue-600 mb-4">📰 Market News</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {news.map((article, i) => (
                <motion.a
                  key={i}
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.02 }}
                  className="bg-white p-4 rounded-lg block shadow-md hover:bg-gray-200 transition"
                >
                  <h3 className="text-lg font-bold">{article.title}</h3>
                  <p className="text-sm text-gray-600">{article.source?.name}</p>
                  <p className="text-sm text-gray-700 mt-2">{article.description}</p>
                </motion.a>
              ))}
            </div>
          </section>

          {/* Real-Time Chart */}
          <section className="bg-gray-100 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-blue-600 mb-4">📈 AAPL Real-Time Stock Chart</h2>
            <div className="bg-white p-4 rounded-lg shadow-md">
              <RealTimeStockChart symbol="AAPL" />
            </div>
          </section>

          <section className="bg-white p-6 rounded-lg shadow-md">
  <h2 className="text-xl font-semibold text-blue-600 mb-4">📊 Weekly Overview</h2>
  <div className="bg-white p-4 rounded-lg">
    {stockData?.datasets?.[0]?.data ? (
      <Line
        data={stockData}
        options={{
          responsive: true,
          plugins: {
            legend: {
              position: "top",
              labels: {
                color: "#333",
                font: {
                  size: 14,
                },
              },
            },
            title: {
              display: true,
              text: "Weekly Stock Comparison",
              color: "#333",
              font: {
                size: 18,
              },
            },
          },
          scales: {
            x: {
              ticks: {
                color: "#333",
              },
              grid: {
                display: false,
              },
            },
            y: {
              ticks: {
                color: "#333",
              },
              grid: {
                color: "#ddd",
              },
            },
          },
        }}
      />
    ) : (
      <p className="text-gray-500">Loading chart data...</p>
    )}
  </div>
</section>

          {/* Stats & Watchlist */}
          <section className="bg-white p-6 rounded-lg shadow-lg border border-gray-300">
            <h2 className="text-xl font-semibold text-blue-600 mb-4">Quick Stats</h2>
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

          <section className="bg-white p-6 rounded-lg shadow-lg border border-gray-300">
            <h2 className="text-xl font-semibold text-blue-600 mb-4">Your Watchlist</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {mockWatchlist.map((stock, index) => (
                <div key={index} className="bg-gray-100 p-4 rounded-lg border">
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
