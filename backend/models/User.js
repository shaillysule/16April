// backend/models/User.js
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
  subscriptionActive: {
    type: Boolean,
    default: false
  },
  portfolio: [stockSchema],
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }
});

module.exports = mongoose.model('User', userSchema);
