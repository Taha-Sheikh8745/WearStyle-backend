import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import connectDB from '../config/db.js';

dotenv.config({ path: './.env' });

const setupAdmin = async () => {
    try {
        await connectDB();

        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminEmail || !adminPassword) {
            console.error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env');
            process.exit(1);
        }

        let user = await User.findOne({ email: adminEmail });

        if (!user) {
            console.log(`Creating new admin user: ${adminEmail}`);
            user = new User({
                firstName: 'Admin',
                lastName: 'User',
                email: adminEmail,
                password: adminPassword,
                role: 'admin',
                isVerified: true
            });
        } else {
            console.log(`Updating existing user to admin: ${adminEmail}`);
            user.password = adminPassword;
            user.role = 'admin';
            user.isVerified = true;
        }

        await user.save();
        console.log(`Admin account ${adminEmail} setup successfully!`);
        process.exit(0);
    } catch (error) {
        console.error('Error setting up admin account:', error);
        process.exit(1);
    }
};

setupAdmin();
