import dotenv from 'dotenv';
dotenv.config({ quiet: true });

import app from "../app.js";
import connectDB from "../config/dbconfig.js";

export default async function handler(req, res) {
    try {
        await connectDB();
        // Proceed to express app
        return app(req, res);
    } catch (err) {
        console.error('Vercel Function Connection Error:', err.message);
        return res.status(500).json({ 
            success: false, 
            message: 'Database Connection Error', 
            error: err.message,
            tip: 'Check your MongoDB Atlas "Network Access" and environment variables.'
        });
    }
}
