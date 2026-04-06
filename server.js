import './config/env.js';
import app from "./app.js";
import User from "./models/User.js";
import connectDB from './config/dbconfig.js';
import fs from 'fs';

// Ensure uploads/ directory exists for Multer
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads', { recursive: true });
    console.log('Created uploads/ directory');
}


connectDB()
    .then(async () => {
        await initAdmin();
    })
    .catch((err) => {
        console.error('Initial DB connection failed:', err.message);
    });

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
        } else if (user.role !== 'admin') {
            user.role = 'admin';
            user.isVerified = true;
            await user.save();
            console.log(`Ensured admin privileges for: ${adminEmail}`);
        }
    } catch (err) {
        console.error('Failed to initialize admin:', err.message);
    }
};

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});



