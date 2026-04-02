import dotenv from 'dotenv';
dotenv.config({ quiet: true });

import app from "../app.js";
import connectDB from "../config/dbconfig.js";

export default async function handler(req, res) {
    try {
        await connectDB();
        return app(req, res);
    } catch (err) {
        console.error('[Vercel Handler] Error:', err.stack || err.message);

        const isEnvError = err.message.includes('DATABASE environment variable');
        return res.status(500).json({
            success: false,
            message: isEnvError ? err.message : 'Database connection failed.',
            error: err.message,
            tip: isEnvError
                ? 'Go to Vercel Dashboard → Your Project → Settings → Environment Variables and add DATABASE.'
                : 'Check MongoDB Atlas Network Access and ensure 0.0.0.0/0 is whitelisted.',
        });
    }
}
