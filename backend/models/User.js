const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  stockSymbol: String,
  quantity: Number,
  avgBuyPrice: Number,
});

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  loginCount: {
    type: Number,
    default: 0
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  subscriptionActive: {
    type: Boolean,
    default: false
  },
  portfolio: [
    {
      stockSymbol: { type: String, required: true },
      quantity: { type: Number, required: true },
      avgBuyPrice: { type: Number, required: true },
      takeProfit: { type: Number }, // Optional, user may skip
      stopLoss: { type: Number }    // Optional, user may skip
    }
  ]
});

module.exports = mongoose.model('User', userSchema);