import dotenv from 'dotenv';
dotenv.config({ quiet: true });

import mongoose from 'mongoose';
import app from "../app.js";
import dns from "dns";
// Standard fix for MongoDB Atlas node 18+ IPv6 issues
dns.setDefaultResultOrder("ipv4first");

const DB = process.env.DATABASE;

// Global cached connection promise
let cachedConnection = null;

export default async function handler(req, res) {
    if (!cachedConnection) {
        console.log('Creating new MongoDB connection (Singleton Pattern)...');
        cachedConnection = mongoose.connect(DB, {
            serverSelectionTimeoutMS: 10000, // 10s timeout for cold starts
        }).then((mongoose) => {
            console.log('MongoDB connection successful!');
            return mongoose;
        }).catch((err) => {
            console.error('MongoDB connection error:', err);
            cachedConnection = null; // Reset if it fails so next request can retry
            throw err;
        });
    }

    try {
        await cachedConnection;
    } catch (err) {
        return res.status(500).json({ 
            success: false, 
            message: 'Internal Server Error: DB Connection Failed', 
            error: err.message
        });
    }

    // Let the Express app handle the request mapping natively
    return app(req, res);
}
