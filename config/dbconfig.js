import mongoose from "mongoose";
import dns from 'dns';

let cached = global.mongoose;

// Standard fix for MongoDB Atlas Node.js DNS resolution issues
try {
    dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
    dns.setDefaultResultOrder("ipv4first");
} catch (dnsErr) {
    console.warn('DNS override failed, using default servers.');
}

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  const DB = process.env.DATABASE;
  if (!DB) {
    throw new Error('DATABASE environment variable is not set. Add it in Vercel → Settings → Environment Variables.');
  }

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    cached.promise = mongoose.connect(DB, opts).then((mongoose) => {
      console.log('MongoDB Connected successfully!');
      return mongoose;
    }).catch((err) => {
      console.error('MongoDB Connection Error:', err.message);
      cached.promise = null; // Reset promise if connection fails
      throw err;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
}

export default connectDB;
