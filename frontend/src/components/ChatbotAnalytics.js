// src/components/ChatbotAnalytics.js
import React, { useState, useEffect } from 'react';
import './ChatbotAnalytics.css';

const ChatbotAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    totalInteractions: 0,
    averageResponseTime: 0,
    topQueries: [],
    userSatisfaction: 0,
    dailyUsage: []
  });
  
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/api/chatbot/analytics', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setAnalytics(data);
        }
      } catch (error) {
        console.error('Error fetching chatbot analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAnalytics();
  }, []);
  
  if (isLoading) {
    return <div className="loading-spinner">Loading analytics...</div>;
  }

  return (
    <div className="chatbot-analytics-container">
      <h2>Chatbot Performance Analytics</h2>
      
      <div className="analytics-grid">
        <div className="analytics-card">
          <h3>Total Interactions</h3>
          <div className="analytics-value">{analytics.totalInteractions}</div>
        </div>
        
        <div className="analytics-card">
          <h3>Avg Response Time</h3>
          <div className="analytics-value">{analytics.averageResponseTime}s</div>
        </div>
        
        <div className="analytics-card">
          <h3>User Satisfaction</h3>
          <div className="analytics-value">{analytics.userSatisfaction}%</div>
        </div>
      </div>
      
      <div className="analytics-section">
        <h3>Top Queries</h3>
        <ul className="top-queries-list">
          {analytics.topQueries.map((query, index) => (
            <li key={index}>
              <span className="query-text">{query.text}</span>
              <span className="query-count">{query.count}</span>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="analytics-section">
        <h3>Daily Usage</h3>
        <div className="chart-container">
          {/* Add a chart here using Chart.js or another library */}
          <div className="placeholder-chart">
            {analytics.dailyUsage.map((day, index) => (
              <div 
                key={index} 
                className="chart-bar" 
                style={{ height: `${day.count * 2}px` }}
                title={`${day.date}: ${day.count} interactions`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatbotAnalytics;