// server.js - FIXED VERSION
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const http = require('http'); // Added missing import
dotenv.config();

const app = express();
const server = http.createServer(app);

// Import WebSocket service
const websocketService = require('./services/websocketServices');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(helmet());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// Routes
const authRoutes = require('./routes/api/auth');
const userRoutes = require('./routes/User');
const adminRoutes = require('./routes/api/admin');
const stockRoutes = require('./routes/stockRoutes'); // Consolidated stock routes
const chatbotRoutes = require('./routes/chatbot');
const portfolioRoutes = require('./routes/portfolioRoutes');
// Optional: Uncomment any routes you need
// const paymentRoutes = require('./routes/subscription');
const learningRoutes = require('./routes/learning');
const chatbot = require('./routes/chatbot');
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', stockRoutes); // Single stock route
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/chatbot', chatbotRoutes);
// Optional: Uncomment any routes you need
app.use('/api/learning', learningRoutes);
app.use('/api/chatbot',chatbot);
// app.use('/api/subscription', paymentRoutes);

// Initialize WebSocket services
websocketService.initializeWebSocketServer(server);
websocketService.startBroadcasting();

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
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
app.use(cors({
  origin: 'http://localhost:3000' ,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('something wrong'+err.message);
});

// MongoDB connection
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
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));