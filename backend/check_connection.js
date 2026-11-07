import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env explicitly from backend directory
dotenv.config({ path: path.join(__dirname, '.env') });

const uri = process.env.MONGODB_URI;

console.log('====================================================');
console.log('       SpendWise MongoDB Atlas Connection Test      ');
console.log('====================================================');

if (!uri) {
  console.error('❌ Error: MONGODB_URI is not defined in backend/.env');
  process.exit(1);
}

console.log(`📡 Connecting to MongoDB Atlas cluster...`);
const maskedUri = uri.replace(/:([^@]+)@/, (match, p1) => {
  return p1 === '<db_password>' ? ':<db_password>@' : ':****@';
});
console.log(`   Target URI: ${maskedUri}`);

async function connectWithRetry() {
  let lastErr;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const conn = await mongoose.connect(uri, {
        tls: true,
        tlsInsecure: true,
        serverSelectionTimeoutMS: 15000
      });

      console.log('✅ Connection Successful!');
      console.log(`   Host:     ${conn.connection.host}`);
      console.log(`   Database: ${conn.connection.name}`);

      const pingResult = await mongoose.connection.db.admin().ping();
      console.log(`   Ping:     ${JSON.stringify(pingResult)}`);
      console.log('\n🎉 MongoDB Atlas is fully connected and ready for user and expense operations!');

      await mongoose.disconnect();
      return true;
    } catch (err) {
      lastErr = err;
      if (attempt < 3) {
        await new Promise((r) => setTimeout(r, 1500));
      }
    }
  }

  console.log(`\n❌ Connection Failed: ${lastErr.message}`);
  process.exit(1);
}

connectWithRetry();
