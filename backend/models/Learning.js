const mongoose = require('mongoose');

const learningSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  challengesCompleted: { type: Number, default: 0 },
  quizScore: { type: Number, default: 0 },
});

module.exports = mongoose.model('Learning', learningSchema);