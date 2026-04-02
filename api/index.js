import dotenv from 'dotenv';
dotenv.config({ quiet: true });

import mongoose from 'mongoose';
import app from "../app.js";
import dns from "dns";
import User from "../models/User.js";

// Standard fix for MongoDB Atlas node 18+ IPv6 issues
dns.setDefaultResultOrder("ipv4first");

const DB = process.env.DATABASE;

// Global cached connection promise
let cachedConnection = null;

const initAdmin = async () => {
    try {
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminEmail || !adminPassword) {
            console.log('Admin credentials not found in env, skipping init.');
            return;
        }

        const user = await User.findOne({ email: adminEmail });
        if (!user) {
            console.log(`Creating initial admin account: ${adminEmail}`);
            await User.create({
                firstName: 'Admin',
                lastName: 'Owner',
                email: adminEmail,
                password: adminPassword,
                role: 'admin',
                isVerified: true
            });
        }
    } catch (err) {
        console.error('Failed to initialize admin in serverless function:', err.message);
    }
};

export default async function handler(req, res) {
    if (!cachedConnection) {
        console.log('Creating new MongoDB connection (Singleton Pattern)...');
        cachedConnection = mongoose.connect(DB, {
            serverSelectionTimeoutMS: 10000, // 10s timeout for cold starts
        }).then(async (conn) => {
            console.log('MongoDB connection successful!');
            await initAdmin(); // Initialize admin on cold start
            return conn;
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
