import './config/env.js';
import app from "./app.js";
import connectDB from './config/dbconfig.js';
import fs from 'fs';

// connect to DB
connectDB().catch((err) => {
    console.error('Initial DB connection failed:', err.message);
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});
