const mongoose = require('mongoose');

// Optional: You can define this separately if you want to reuse it later,
// but it's currently embedded directly into the userSchema
const stockSchema = new mongoose.Schema({
  stockSymbol: { type: String, required: true },
  quantity: { type: Number, required: true },
  avgBuyPrice: { type: Number, required: true },
  takeProfit: { type: Number }, // Optional
  stopLoss: { type: Number }    // Optional
});



const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    default: 'user'
  },
  subscriptionActive: {
    type: Boolean,
    default: false
  },
  isSubscribed: {
    type: Boolean,
    default: false
  },
  freeAITrials: {
    type: Number,
    default: 3
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', UserSchema);