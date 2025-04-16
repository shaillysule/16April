require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const makeAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB');
    
    // Replace with your email
    const email = 'shaillysule821@gmail.com';
    
    const updatedUser = await User.findOneAndUpdate(
      { email: email },
      { role: 'admin' },
      { new: true }
    );
    
    if (updatedUser) {
      console.log(`User ${email} is now an admin`);
    } else {
      console.log(`User ${email} not found`);
    }
    
    mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (err) {
    console.error('Error making admin:', err);
  }
};

makeAdmin();