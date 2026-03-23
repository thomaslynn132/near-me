import mongoose from 'mongoose';
import config from './index.js';
import { User } from '../models/index.js';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    await User.createIndexes();
    console.log('Geo indexes created');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
