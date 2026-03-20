import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import User from '../models/User.js';

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nearme');
    console.log('Connected to MongoDB');

    const existingAdmin = await User.findOne({ email: 'admin@nearme.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
    } else {
      await User.create({
        name: 'Admin',
        email: 'admin@nearme.com',
        password: 'admin123',
        age: 25,
        role: 'superadmin',
        bio: 'System Administrator',
        interests: ['tech', 'reading']
      });
      console.log('Admin user created: admin@nearme.com / admin123');
    }

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

seedAdmin();
