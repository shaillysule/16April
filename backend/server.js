const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const app = express();
dotenv.config();

const { router: authRoutes } = require('./routes/auth'); // Importing auth routes
const learningRoutes = require('./routes/learning');
const UserRoutes=require('./routes/User');
const  paymentRoutes=require('./routes/subscription');
const adminRoutes = require('./routes/adminRoutes');
const stock=require('./routes/stockRoutes');
const stockRoutes = require('./routes/stocks');
const chatbotRoutes = require('./routes/chatbot');
const portfolioRoutes = require('./routes/portfolio'); 

app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));
  app.use(stockRoutes);
  app.use('/api/admin', adminRoutes);
app.use('/api/stocks',stock);
  app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/payment',paymentRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/users',UserRoutes);
app.use('/api', chatbotRoutes);

app.get('/',(req,res)=>{
  res.send('Api is runing..')
})
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
