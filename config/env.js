import dotenv from 'dotenv';
dotenv.config({ quiet: true });

// Log for confirmation during startup (optional, but helpful for debugging)
if (process.env.NODE_ENV === 'development') {
    console.log('Environment variables successfully initialized.');
}
