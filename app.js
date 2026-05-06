import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

// Route imports
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
const app = express();

// Middleware
// CORS Configuration

const allowedOrigins = [
    process.env.CLIENT_URL,
    'http://localhost:5173',
    'https://wearstylewithimtisall.com/'
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);

        // Check if origin is allowed or if it's a Vercel preview branch
        if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/contact', contactRoutes);

// Health check
app.get('/', async (req, res) => {
    try {
        const readyState = mongoose.connection.readyState;
        const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
        
        let dbPing = 'failed';
        if (readyState === 1) {
            // Try a quick ping/count to verify the connection is alive
            await mongoose.connection.db.admin().ping();
            dbPing = 'pong';
        }

        res.json({ 
            message: 'Wear Style API Running',
            database: {
                status: states[readyState] || 'unknown',
                readyState: readyState,
                ping: dbPing
            },
            version: '1.0.1',
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        res.json({
            message: 'Wear Style API Running',
            database: {
                status: 'error',
                error: err.message
            },
            version: '1.0.1'
        });
    }
});

// 404 Handler for undefined routes
app.use((req, res, next) => {
    console.log(`404 Not Found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// Global Error Handler
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || 'Internal Server Error',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
});

export default app;
