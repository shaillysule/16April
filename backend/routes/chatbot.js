const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Your auth middleware
const User = require('../models/User');
const nlp = require('compromise');
const axios = require('axios');

router.post('/chatbot', auth, async (req, res) => {
  try {
    // Check if user is subscribed
    const user = await User.findById(req.user);
    if (!user || !user.subscriptionActive) {
      return res.status(403).json({ error: 'Subscription required to use the chatbot.' });
    }

    // Get user message
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Please enter a message.' });
    }

    // Parse message with compromise
    const doc = nlp(message.toLowerCase());
    let responseText = '';

    // Check for stock price query (e.g., "price of AAPL")
    const stockTerms = ['price', 'stock', 'quote', 'value'];
    const hasStockTerm = stockTerms.some((term) => doc.has(term));
    const stockSymbol = doc.match('#UpperCase{1,5}').text();

    if (hasStockTerm && stockSymbol) {
      // Fetch stock data from Alpha Vantage
      const stockResponse = await axios.get(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${stockSymbol}&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`
      );

      const stockData = stockResponse.data['Global Quote'];
      if (!stockData || !stockData['01. symbol']) {
        responseText = `Sorry, I couldn't find data for ${stockSymbol}. Please check the symbol.`;
      } else {
        responseText = `${stockSymbol} is trading at $${stockData['05. price']} as of ${stockData['07. latest trading day']}.`;
      }
    } else if (doc.has('dividend')) {
      responseText = 'A dividend is a payment made by a company to its shareholders, usually from profits.';
    } else if (doc.has('market')) {
      responseText = 'The stock market is where shares of companies are bought and sold, like the NYSE or NASDAQ.';
    } else if (doc.has('ipo')) {
      responseText = 'An IPO (Initial Public Offering) is when a company first sells its shares to the public.';
    } else {
      responseText = 'I can help with stock prices (e.g., "price of AAPL"), dividends, markets, or IPOs. What would you like to know?';
    }

    res.json({ response: responseText });
  } catch (error) {
    console.error('Chatbot error:', error.message);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

module.exports = router;