// src/components/Analytics.js (Updated)
import React, { useState } from 'react';
import './Analytics.css';
import StockAIChatbot from './StockAIChatbot';
import ChatbotAnalytics from './ChatbotAnalytics';

const Analytics = () => {
  const [activeTab, setActiveTab] = useState('metrics');

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h1>Analytics Dashboard</h1>
        <div className="analytics-tabs">
          <button 
            className={`tab-button ${activeTab === 'metrics' ? 'active' : ''}`}
            onClick={() => setActiveTab('metrics')}
          >
            Market Metrics
          </button>
          <button 
            className={`tab-button ${activeTab === 'chatbot' ? 'active' : ''}`}
            onClick={() => setActiveTab('chatbot')}
          >
            AI Assistant
          </button>
          <button 
            className={`tab-button ${activeTab === 'insights' ? 'active' : ''}`}
            onClick={() => setActiveTab('insights')}
          >
            Trading Insights
          </button>
        </div>
      </div>
      
      <div className="analytics-content">
        {activeTab === 'metrics' && (
          <div className="metrics-container">
            <div className="metrics-grid">
              <div className="metric-card">
                <h3>Market Overview</h3>
                <div className="market-indicators">
                  <div className="indicator up">
                    <span className="indicator-name">S&P 500</span>
                    <span className="indicator-value">+1.2%</span>
                  </div>
                  <div className="indicator up">
                    <span className="indicator-name">NASDAQ</span>
                    <span className="indicator-value">+0.8%</span>
                  </div>
                  <div className="indicator down">
                    <span className="indicator-name">DOW</span>
                    <span className="indicator-value">-0.3%</span>
                  </div>
                </div>
              </div>
              
              <div className="metric-card">
                <h3>Your Portfolio</h3>
                <div className="portfolio-summary">
                  <div className="summary-item">
                    <div className="summary-label">Total Value</div>
                    <div className="summary-value">$32,456.78</div>
                  </div>
                  <div className="summary-item">
                    <div className="summary-label">Day Change</div>
                    <div className="summary-value up">+$324.55 (+1.02%)</div>
                  </div>
                  <div className="summary-item">
                    <div className="summary-label">Total Return</div>
                    <div className="summary-value up">+$2,456.78 (+8.21%)</div>
                  </div>
                </div>
              </div>
              
              <div className="metric-card">
                <h3>Top Performers</h3>
                <div className="stock-list">
                  <div className="stock-item">
                    <span className="stock-symbol">AAPL</span>
                    <span className="stock-change up">+2.34%</span>
                  </div>
                  <div className="stock-item">
                    <span className="stock-symbol">MSFT</span>
                    <span className="stock-change up">+1.89%</span>
                  </div>
                  <div className="stock-item">
                    <span className="stock-symbol">GOOGL</span>
                    <span className="stock-change up">+1.45%</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Add your existing analytics content here */}
          </div>
        )}
        
        {activeTab === 'chatbot' && (
          <div className="chatbot-dashboard">
            <div className="dashboard-grid">
              <div className="chatbot-column">
                <h2>Stock AI Assistant</h2>
                <p>Ask questions about stocks, market trends, or your portfolio</p>
                <StockAIChatbot />
              </div>
              <div className="analytics-column">
                <h2>Chatbot Insights</h2>
                <ChatbotAnalytics />
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'insights' && (
          <div className="insights-container">
            <h2>Trading Insights</h2>
            <p>Advanced analytics and AI-driven insights for your investment decisions</p>
            {/* Add your trading insights content here */}
            <div className="insights-placeholder">
              <p>Trading insights module coming soon...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;