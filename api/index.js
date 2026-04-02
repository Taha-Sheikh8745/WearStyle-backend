import dotenv from 'dotenv';
dotenv.config({ quiet: true });

import mongoose from 'mongoose';
import app from "../app.js";
import dns from "dns";

// Standard fix for MongoDB Atlas Node.js DNS resolution issues
try {
    dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
    dns.setDefaultResultOrder("ipv4first");
} catch (dnsErr) {
    console.warn('DNS override failed, using default servers.');
}

const DB = process.env.DATABASE;

// Global cached connection promise
let cachedConnection = null;

export default async function handler(req, res) {
    // 1. Check for basic connectivity setup
    if (!DB) {
        console.error('CRITICAL: DATABASE Environment Variable is missing.');
        return res.status(500).json({
            success: false,
            message: 'DATABASE URL is missing! Add it in Vercel Dashboard → Settings → Env Variables.'
        });
    }

    if (!cachedConnection) {
        console.log('Connecting to MongoDB Atlas...');
        cachedConnection = mongoose.connect(DB, {
            serverSelectionTimeoutMS: 5000, // 5s timeout to catch "IP Whitelist" errors fast
            socketTimeoutMS: 45000,
        }).then((conn) => {
            console.log('MongoDB connection successful!');
            return conn;
        }).catch((err) => {
            console.error('MongoDB connection error:', err.message);
            cachedConnection = null; // Let the next request try again
            throw err;
        });
    }

    try {
        await cachedConnection;
        // Proceed to express app
        return app(req, res);
    } catch (err) {
        console.error('Vercel Function Error Trace:', err.message);
        return res.status(500).json({ 
            success: false, 
            message: 'Database Connection Error', 
            error: err.message,
            tip: 'Check your MongoDB Atlas "Network Access" and ensure 0.0.0.0/0 is whitelisted.'
        });
    }
}
