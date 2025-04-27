// backend/controllers/chatbotController.js
const axios = require('axios');
const StockModel = require('../models/stock');
const PortfolioModel = require('../models/Portfolio');
const User = require('../models/User');

// System prompt to instruct the AI
const SYSTEM_PROMPT = `You are an expert stock market and financial advisor AI assistant. Your role is to provide accurate, helpful information about stocks, market trends, portfolio management, and investment strategies.

You have access to:
- Historical stock data and market performance
- Portfolio analysis tools
- Technical and fundamental analysis techniques
- Investment strategies and risk assessment models

Your responses should be:
- Professional and knowledgeable
- Based on financial principles and market data
- Clear and concise
- Educational when appropriate
- Non-speculative and responsible (avoid making specific predictions about future stock prices)

When asked about specific stocks, use your knowledge but remind users that all investments carry risk and they should do their own research before investing.`;

const handleStockQuery = async (req, res) => {
  try {
    const { query, conversationHistory = [] } = req.body;
    const userId = req.user ? req.user.id : null; // Assuming authentication middleware
    
    // Gather context about the user's portfolio if authenticated
    let portfolioContext = '';
    if (userId) {
      try {
        // Get user's portfolio data
        const userPortfolio = await PortfolioModel.findOne({ userId }).populate('stocks');
        
        if (userPortfolio && userPortfolio.stocks.length > 0) {
          const stocks = userPortfolio.stocks.map(stock => 
            `${stock.symbol}: ${stock.quantity} shares, avg price: $${stock.averagePrice}`
          );
          
          portfolioContext = `
User Portfolio Context:
- Portfolio value: $${userPortfolio.totalValue.toFixed(2)}
- Performance (YTD): ${userPortfolio.ytdPerformance.toFixed(2)}%
- Holdings: ${stocks.join(', ')}
`;
        }
      } catch (err) {
        console.error('Error fetching portfolio data:', err);
        // Continue even if portfolio fetch fails
      }
    }
    
    // Get market trends for context
    let marketContext = '';
    try {
      const topStocks = await StockModel.find().sort({ recentPerformance: -1 }).limit(3);
      const marketTrends = [
        'S&P 500: +0.3% today',
        'NASDAQ: +0.5% today',
        'Dow Jones: -0.1% today',
        `Top performing sector: ${topStocks[0] ? topStocks[0].sector : 'Technology'}`
      ];
      
      marketContext = `
Market Context:
${marketTrends.join('\n')}
`;
    } catch (err) {
      console.error('Error fetching market data:', err);
      // Continue even if market fetch fails
    }
    
    // Combine system prompt with context
    const systemPromptWithContext = `${SYSTEM_PROMPT}
${portfolioContext}
${marketContext}`;
    
    // Prepare messages for the OpenAI API
    const messages = [
      { role: 'system', content: systemPromptWithContext },
      ...conversationHistory.slice(-10), // Limit context to last 10 messages
    ];
    
    // Call OpenAI API
    const openaiResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: messages,
        max_tokens: 500,
        temperature: 0.7,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        }
      }
    );
    
    // Extract and send the response
    const aiResponse = openaiResponse.data.choices[0].message.content;
    
    // Log the interaction for analytics
    logInteraction(userId, query, aiResponse);
    
    res.status(200).json({ response: aiResponse });
    
  } catch (error) {
    console.error('Error in chatbot controller:', error);
    
    // Handle different types of errors
    if (error.response && error.response.status === 429) {
      return res.status(429).json({ 
        error: 'Rate limit exceeded. Please try again in a moment.' 
      });
    }
    
    if (error.response && error.response.data && error.response.data.error) {
      return res.status(500).json({ 
        error: 'AI service error. Please try again later.' 
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to process query. Please try again later.' 
    });
  }
};

// Helper function to log interactions for analytics
async function logInteraction(userId, query, response) {
  try {
    // Implement logging to database or analytics service
    console.log(`Logged interaction for user ${userId || 'anonymous'}`);
  } catch (err) {
    console.error('Error logging interaction:', err);
  }
}

module.exports = {
  handleStockQuery
};