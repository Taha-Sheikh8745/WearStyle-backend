import './config/env.js';
import app from "./app.js";
import connectDB from './config/dbconfig.js';
import fs from 'fs';

// Ensure uploads/ directory exists for Multer
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads', { recursive: true });
    console.log('Created uploads/ directory');
}

connectDB().catch((err) => {
    console.error('Initial DB connection failed:', err.message);
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});
