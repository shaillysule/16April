const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  stocks: [{ symbol: String, shares: Number, purchasePrice: Number }],
  balance: { type: Number, default: 10000 },
});

module.exports = mongoose.model('Portfolio', portfolioSchema);