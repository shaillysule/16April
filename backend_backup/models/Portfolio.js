// models/Portfolio.js
const mongoose = require('mongoose');

const PortfolioSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  stocks: [
    {
      symbol: {
        type: String,
        required: true
      },
      shares: {
        type: Number,
        required: true
      },
      purchasePrice: {
        type: Number,
        required: true
      },
      purchaseDate: {
        type: Date,
        default: Date.now
      }
    }
  ],
  // Add risk metrics
  riskMetrics: {
    beta: {
      type: Number,
      default: 0
    },
    volatility: {
      type: Number,
      default: 0
    },
    sharpeRatio: {
      type: Number,
      default: 0
    },
    lastUpdated: {
      type: Date,
      default: null
    }
  }
});

module.exports = mongoose.model('Portfolio', PortfolioSchema);