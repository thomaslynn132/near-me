import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/index.js';
import config from '../config/index.js';

dotenv.config();

const seedDev = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('Connected to DB');

    await User.createIndexes();
    console.log('Indexes created');

    const existingUser = await User.findOne({ email: 'test@test.com' });
    if (existingUser) {
      await User.updateMany({}, { 
        $set: { location: { type: 'Point', coordinates: [96.1268653, 16.7968553], isOnline: true } } 
      });
      console.log('Updated user locations');
      await mongoose.disconnect();
      return;
    }

    const user = await User.create({
      name: 'Test User',
      email: 'test@test.com',
      password: 'testing',
      age: 25,
      bio: 'Test user for development',
      interests: ['music', 'travel'],
      visibility: 'public',
      role: 'user',
      location: { type: 'Point', coordinates: [96.1268653, 16.7968553] },
      isOnline: true,
    });
    console.log('Created user account:', user.email);

    const admin = await User.create({
      name: 'Admin',
      email: 'admin@test.com',
      password: 'testing',
      age: 30,
      bio: 'Admin account for development',
      interests: ['tech'],
      visibility: 'public',
      role: 'admin',
      location: { type: 'Point', coordinates: [96.1268653, 16.7968553] },
      isOnline: true,
    });
    console.log('Created admin account:', admin.email);

    console.log('Dev accounts seeded successfully');
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
    await mongoose.disconnect();
  }
};

seedDev();