import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI; 

if (!MONGODB_URI) {
  throw new Error('MongoDB URI is not defined in environment variables');
}

let cachedDb = null;

export async function connectToDatabase() {
  if (cachedDb) {
    return { db: cachedDb };
  }

  try {
    const client = await mongoose.connect(MONGODB_URI);
    cachedDb = client.connection.db;
    return { db: cachedDb };
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw new Error('Failed to connect to MongoDB');
  }
}

module.exports = { connectToDatabase }; 