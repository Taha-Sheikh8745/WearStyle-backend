import dotenv from 'dotenv';
dotenv.config({ quiet: true });

import mongoose from 'mongoose';
import app from "../app.js";
import dns from "dns";

// Fix for potential MongoDB SRV resolution issues on certain networks
dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
dns.setDefaultResultOrder("ipv4first");

const DB = process.env.DATABASE;

// Cache connection state to reuse across serverless function invocations
let isConnected = false;

export default async function handler(req, res) {
    if (!isConnected) {
        try {
            await mongoose.connect(DB);
            isConnected = true;
            console.log('MongoDB connection successful (Serverless Environment)!');
        } catch (err) {
            console.error('MongoDB connection error:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Internal Server Error: DB Connection Failed', 
                error: process.env.NODE_ENV === 'development' ? err.message : undefined 
            });
        }
    }

    // Let the Express app handle the request mapping natively
    return app(req, res);
}
