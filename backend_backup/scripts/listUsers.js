const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') }); // Explicit path

const mongoose = require('mongoose');
const User = require('../models/User');

console.log("MONGO_URI:", process.env.MONGO_URI); // Debug

const listUsers = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error('MONGO_URI not found in .env');

    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const users = await User.find();
    console.log('Users:', users);
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error listing users:', err);
  }
};

listUsers();
