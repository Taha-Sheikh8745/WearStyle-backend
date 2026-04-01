import dotenv from 'dotenv';
dotenv.config({ quiet: true });

import mongoose from 'mongoose';
import app from "../app.js";
import dns from "dns";

// Fix for potential MongoDB SRV resolution issues on certain networks
dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
dns.setDefaultResultOrder("ipv4first");

const DB = process.env.DATABASE;

export default async function handler(req, res) {
    // Check if we have a connection and if it's already connecting or connected
    if (mongoose.connection.readyState !== 1) {
        try {
            console.log('Attaching new MongoDB connection (Serverless Environment)...');
            await mongoose.connect(DB, {
                serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of default 30s
            });
            console.log('MongoDB connection successful!');
        } catch (err) {
            console.error('MongoDB connection error:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Internal Server Error: DB Connection Failed', 
                error: err.message
            });
        }
    }

    // Let the Express app handle the request mapping natively
    return app(req, res);
}
