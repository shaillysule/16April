// models/BuySellModel.js
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  symbol: {
    type: String,
    required: true,
    uppercase: true
  },
  companyName: {
    type: String
  },
  type: {
    type: String,
    enum: ['BUY', 'SELL'],
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true
  },
  takeProfit: {
    type: Number,
    min: 0
  },
  stopLoss: {
    type: Number,
    min: 0
  },
  status: {
    type: String,
    enum: ['COMPLETED', 'PENDING', 'CANCELLED'],
    default: 'COMPLETED'
  },
  transactionDate: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Virtual for calculating profit/loss
transactionSchema.virtual('profitLoss').get(function() {
  if (this.type === 'BUY' || !this.currentPrice) return 0;
  
  return (this.currentPrice - this.price) * this.quantity;
});

// Add a method to check if takeProfit or stopLoss was triggered
transactionSchema.methods.checkPriceTriggers = function(currentPrice) {
  if (this.type !== 'BUY' || this.status !== 'COMPLETED') return null;
  
  if (this.takeProfit && currentPrice >= this.takeProfit) {
    return 'TAKE_PROFIT';
  }
  
  if (this.stopLoss && currentPrice <= this.stopLoss) {
    return 'STOP_LOSS';
  }
  
  return null;
};

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;