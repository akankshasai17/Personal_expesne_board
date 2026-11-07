import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure .env is always loaded from backend/.env
dotenv.config({ path: path.join(__dirname, '..', '.env') });

/**
 * Connect to MongoDB Atlas database with automatic retry
 */
export const connectDB = async () => {
  // If not already set, reload
  if (!process.env.MONGODB_URI) {
    dotenv.config({ path: path.join(__dirname, '..', '.env') });
  }

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI environment variable is not defined in backend/.env');
  }

  let lastError;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const conn = await mongoose.connect(mongoUri, {
        tls: true,
        tlsInsecure: true,
        serverSelectionTimeoutMS: 15000,
        autoIndex: true
      });

      console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host} / Database: ${conn.connection.name}`);
      return conn;
    } catch (error) {
      lastError = error;
      console.warn(`⚠️  MongoDB connection attempt ${attempt} failed: ${error.message}`);
      if (attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
  }

  console.error(`❌ MongoDB Connection Error after retries: ${lastError.message}`);
  throw lastError;
};
