const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  symbol: { type: String, required: true, unique: true },
  name: { type: String },
  currentPrice: { type: Number },
  change: { type: Number },
  changePercent: { type: Number },
  updatedAt: { type: Date, default: Date.now }
});

// ✅ Prevent OverwriteModelError
const Stock = mongoose.models.Stock || mongoose.model('Stock', stockSchema);

module.exports = Stock;
