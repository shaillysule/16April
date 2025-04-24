const mongoose = require('mongoose');

const LearningSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  estimatedTime: { type: Number, default: 10 }, // in minutes
  sections: [{
    title: { type: String, required: true },
    content: { type: String, required: true },
    videoUrl: { type: String },
    imageUrl: { type: String }
  }],
  quiz: [{
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: Number, required: true }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Learning', LearningSchema);