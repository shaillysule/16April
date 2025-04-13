import React from 'react';
import Chatbot from './Chatbot'; // Make sure this path is correct
import './Analytics.css';

function Analytics() {
  return (
    <div className="analytics-container">
      <h1>Analytics Dashboard</h1>
      
      <div className="analytics-content">
        <div className="analytics-section">
          <h2>Market Insights</h2>
          {/* Analytics content here */}
        </div>
        
        <div className="chatbot-section">
          <h2>Stock Assistant</h2>
          <p>Ask questions about stocks, dividends, markets, and more.</p>
          <Chatbot />
        </div>
      </div>
    </div>
  );
}

export default Analytics;