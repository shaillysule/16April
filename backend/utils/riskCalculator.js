// utils/riskCalculator.js
const axios = require('axios');

// This is a simplified version - in a real app, you'd use more sophisticated calculations
const calculateBeta = async (portfolioStocks) => {
  // This would typically compare portfolio to market benchmark
  // Simplified version returns a random beta between 0.5 and 1.5
  return 0.5 + Math.random();
};

const calculateVolatility = async (portfolioStocks) => {
  // This would calculate standard deviation of returns
  // Simplified version returns random volatility between 5% and 25%
  return 5 + Math.random() * 20;
};

const calculateSharpeRatio = (returnRate, riskFreeRate, volatility) => {
  // The Sharpe ratio = (Portfolio Return - Risk Free Rate) / Portfolio Standard Deviation
  // Assuming returnRate is 5-15%, riskFreeRate is 2%
  const portfolioReturn = 5 + Math.random() * 10;
  const riskFree = 2;
  
  return (portfolioReturn - riskFree) / volatility;
};

const calculateRiskMetrics = async (portfolio) => {
  try {
    const beta = await calculateBeta(portfolio.stocks);
    const volatility = await calculateVolatility(portfolio.stocks);
    const sharpeRatio = calculateSharpeRatio(10, 2, volatility);
    
    return {
      beta,
      volatility,
      sharpeRatio,
      lastUpdated: new Date()
    };
  } catch (error) {
    console.error('Error calculating risk metrics:', error);
    return null;
  }
};

module.exports = {
  calculateRiskMetrics
};