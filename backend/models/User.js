const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isSubscribed: { type: Boolean, default: false },
  freeAITrials: { type: Number, default: 3 },
});

module.exports = mongoose.model('User', userSchema);