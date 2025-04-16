// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// Fix for helmet issue
app.use(helmet());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// Routes
const authRoutes = require('./routes/auth');
const learningRoutes = require('./routes/learning');
const userRoutes = require('./routes/User');
const paymentRoutes = require('./routes/subscription');
const adminRoutes = require('./routes/adminRoutes');
const stockRoutes = require('./routes/stocks');
const stockAltRoutes = require('./routes/stockRoutes'); // if different
const chatbotRoutes = require('./routes/chatbot');
const portfolioRoutes = require('./routes/portfolioRoutes');

// Route Mounting
app.use('/api/auth', authRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/user', userRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/stocks', stockRoutes);       // Main stock route
app.use('/api/stock-alt', stockAltRoutes); // If needed separately
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static('client/build'));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}
console.log("API Key loaded:", process.env.ALPHA_VANTAGE_API_KEY ? "Yes" : "No");
// Default route
app.get('/', (req, res) => {
  res.send('🚀 API is running...');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Server error' });
});

// MongoDB connection with improved error handling
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  }
};
connectDB();

// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));