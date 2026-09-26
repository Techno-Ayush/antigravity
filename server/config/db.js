import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryServer = null;

export const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/peer-skill-exchange';
  
  try {
    // Attempt standard connection with 2-second timeout
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`[MongoDB] Connected to database: ${mongoose.connection.host}`);
  } catch (err) {
    console.warn(`[MongoDB] Standard connection to ${uri} failed (${err.message}).`);
    console.log(`[MongoDB] Initializing in-memory Mongo server for zero-setup local execution...`);
    
    try {
      mongoMemoryServer = await MongoMemoryServer.create({
        binary: {
          version: process.env.MONGOMS_VERSION || '8.2.1'
        }
      });
      const memoryUri = mongoMemoryServer.getUri();
      await mongoose.connect(memoryUri);
      console.log(`[MongoDB] Connected to In-Memory MongoDB at: ${memoryUri}`);
    } catch (memErr) {
      console.error('[MongoDB] Fatal: Could not initialize database:', memErr.message);
      process.exit(1);
    }
  }

  mongoose.connection.on('error', (err) => {
    console.error(`[MongoDB] Runtime connection error: ${err.message}`);
  });
};

export const closeDB = async () => {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
};
