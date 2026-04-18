import mongoose from 'mongoose';
import dotenv from 'dotenv';
import config from '../config/index.js';

dotenv.config();

const createIndex = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('Connected to DB');

    const db = mongoose.connection.db;
    const collection = db.collection('users');

    await collection.dropIndex('location_2dsphere');
    console.log('Dropped old index');

    await collection.createIndex({ location: '2dsphere' });
    console.log('2dsphere index created');

    const indexes = await collection.indexes();
    console.log('Current indexes:', indexes.map(i => i.key).filter(Boolean));

    await mongoose.disconnect();
    console.log('Done');
  } catch (error) {
    console.error('Error:', error.message);
    await mongoose.disconnect();
  }
};

createIndex();