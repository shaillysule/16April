// controllers/portfolioController.js
const Transaction = require('../models/BuySellModel');
const User = require('../models/User'); // Assuming you have a User model
const axios = require('axios');

const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;

// Buy a stock
exports.buyStock = async (req, res) => {
  const { symbol, quantity = 1, price, takeProfit, stopLoss } = req.body;
  const userId = req.user.id; // Assuming auth middleware sets req.user
  
  if (!symbol || !price) {
    return res.status(400).json({ error: 'Symbol and price are required' });
  }
  
  try {
    // Verify the stock exists
    const response = await axios.get(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`
    );
    
    const quote = response.data['Global Quote'];
    if (!quote || Object.keys(quote).length === 0) {
      return res.status(404).json({ error: 'Stock not found' });
    }
    
    // Get company info
    const overviewResponse = await axios.get(
      `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${API_KEY}`
    );
    
    const companyName = overviewResponse.data.Name || symbol;
    
    // Calculate total amount
    const totalAmount = price * quantity;
    
    // Create transaction
    const transaction = new Transaction({
      userId,
      symbol,
      companyName,
      type: 'BUY',
      quantity,
      price,
      totalAmount,
      takeProfit: takeProfit || undefined,
      stopLoss: stopLoss || undefined,
      status: 'COMPLETED',
      transactionDate: new Date()
    });
    
    await transaction.save();
    
    // Return success
    res.status(201).json({
      message: 'Stock purchased successfully',
      transaction: {
        id: transaction._id,
        symbol,
        companyName,
        quantity,
        price,
        totalAmount,
        takeProfit,
        stopLoss,
        type: 'BUY',
        status: 'COMPLETED',
        transactionDate: transaction.transactionDate
      }
    });
  } catch (error) {
    console.error('Buy stock error:', error.message);
    res.status(500).json({ error: 'Failed to buy stock' });
  }
};

// Sell a stock
exports.sellStock = async (req, res) => {
  const { symbol, quantity = 1, price } = req.body;
  const userId = req.user.id;
  
  if (!symbol || !price) {
    return res.status(400).json({ error: 'Symbol and price are required' });
  }
  
  try {
    // Check if user owns the stock
    const userStocks = await Transaction.aggregate([
      { $match: { userId: userId, symbol, type: 'BUY', status: 'COMPLETED' } },
      { $group: { _id: '$symbol', totalQuantity: { $sum: '$quantity' } } }
    ]);
    
    const userStock = userStocks.find(stock => stock._id === symbol);
    if (!userStock || userStock.totalQuantity < quantity) {
      return res.status(400).json({ error: 'Insufficient stock quantity to sell' });
    }
    
    // Get company info
    const overviewResponse = await axios.get(
      `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${API_KEY}`
    );
    
    const companyName = overviewResponse.data.Name || symbol;
    
    // Calculate total amount
    const totalAmount = price * quantity;
    
    // Create transaction
    const transaction = new Transaction({
      userId,
      symbol,
      companyName,
      type: 'SELL',
      quantity,
      price,
      totalAmount,
      status: 'COMPLETED',
      transactionDate: new Date()
    });
    
    await transaction.save();
    
    // Return success
    res.status(201).json({
      message: 'Stock sold successfully',
      transaction: {
        id: transaction._id,
        symbol,
        companyName,
        quantity,
        price,
        totalAmount,
        type: 'SELL',
        status: 'COMPLETED',
        transactionDate: transaction.transactionDate
      }
    });
  } catch (error) {
    console.error('Sell stock error:', error.message);
    res.status(500).json({ error: 'Failed to sell stock' });
  }
};

// Get user portfolio
exports.getPortfolio = async (req, res) => {
  const userId = req.user.id;
  
  try {
    // Get all buy transactions
    const buyTransactions = await Transaction.find({ 
      userId, 
      type: 'BUY',
      status: 'COMPLETED'
    });
    
    // Get all sell transactions
    const sellTransactions = await Transaction.find({ 
      userId, 
      type: 'SELL',
      status: 'COMPLETED'
    });
    
    // Calculate current holdings
    const portfolio = {};
    
    // Add buy transactions
    buyTransactions.forEach(transaction => {
      if (!portfolio[transaction.symbol]) {
        portfolio[transaction.symbol] = {
          symbol: transaction.symbol,
          companyName: transaction.companyName,
          quantity: 0,
          avgBuyPrice: 0,
          totalInvestment: 0,
          currentValue: 0,
          profitLoss: 0,
          profitLossPercentage: 0
        };
      }
      
      portfolio[transaction.symbol].quantity += transaction.quantity;
      portfolio[transaction.symbol].totalInvestment += transaction.totalAmount;
    });
    
    // Subtract sell transactions
    sellTransactions.forEach(transaction => {
      if (portfolio[transaction.symbol]) {
        portfolio[transaction.symbol].quantity -= transaction.quantity;
        // We don't subtract from totalInvestment because that's the cost basis
      }
    });
    
    // Calculate average buy price for each stock
    Object.keys(portfolio).forEach(symbol => {
      if (portfolio[symbol].quantity > 0) {
        portfolio[symbol].avgBuyPrice = portfolio[symbol].totalInvestment / portfolio[symbol].quantity;
      }
    });
    
    // Remove stocks with zero quantity
    Object.keys(portfolio).forEach(symbol => {
      if (portfolio[symbol].quantity <= 0) {
        delete portfolio[symbol];
      }
    });
    
    // Get current prices for each stock
    const portfolioList = Object.values(portfolio);
    if (portfolioList.length > 0) {
      await Promise.all(
        portfolioList.map(async (stock) => {
          try {
            const response = await axios.get(
              `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${stock.symbol}&apikey=${API_KEY}`
            );
            
            const quote = response.data['Global Quote'];
            if (quote && Object.keys(quote).length > 0) {
              const currentPrice = parseFloat(quote['05. price']);
              stock.currentPrice = currentPrice;
              stock.currentValue = currentPrice * stock.quantity;
              stock.profitLoss = stock.currentValue - stock.totalInvestment;
              stock.profitLossPercentage = (stock.profitLoss / stock.totalInvestment) * 100;
            }
          } catch (err) {
            console.error(`Error fetching current price for ${stock.symbol}:`, err.message);
          }
        })
      );
    }
    
    // Calculate total portfolio value
    const totalInvestment = portfolioList.reduce((total, stock) => total + stock.totalInvestment, 0);
    const totalCurrentValue = portfolioList.reduce((total, stock) => total + stock.currentValue, 0);
    const totalProfitLoss = totalCurrentValue - totalInvestment;
    const totalProfitLossPercentage = totalInvestment > 0 ? (totalProfitLoss / totalInvestment) * 100 : 0;
    
    res.json({
      portfolio: portfolioList,
      summary: {
        totalInvestment,
        totalCurrentValue,
        totalProfitLoss,
        totalProfitLossPercentage
      }
    });
  } catch (error) {
    console.error('Get portfolio error:', error.message);
    res.status(500).json({ error: 'Failed to fetch portfolio' });
  }
};

// Get transaction history
exports.getTransactionHistory = async (req, res) => {
  const userId = req.user.id;
  
  try {
    const transactions = await Transaction.find({ userId })
      .sort({ transactionDate: -1 })
      .lean();
    
    res.json(transactions);
  } catch (error) {
    console.error('Get transaction history error:', error.message);
    res.status(500).json({ error: 'Failed to fetch transaction history' });
  }
};