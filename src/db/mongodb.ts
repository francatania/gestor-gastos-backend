import mongoose from 'mongoose';
import config from '../config/config.js';

export const init = async () => {
  try {
    const URI = config.MONGO_URI;

    if (!URI) {
      throw new Error('MONGO_URI is required.');
    }

    await mongoose.connect(URI);
    console.log('Database connected');
  } catch (error) {
    console.error('Error to connect to database', error);
    throw error;
  }
};
