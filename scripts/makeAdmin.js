import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import connectDB from '../config/db.js';

dotenv.config({ path: './.env' });

const email = process.argv[2];

if (!email) {
    console.error('Please provide an email address as an argument.');
    process.exit(1);
}

const makeAdmin = async () => {
    try {
        await connectDB();

        const user = await User.findOne({ email });

        if (!user) {
            console.error(`User with email ${email} not found.`);
            process.exit(1);
        }

        user.role = 'admin';
        await user.save();

        console.log(`User ${email} is now an admin!`);
        process.exit();
    } catch (error) {
        console.error('Error making user admin:', error);
        process.exit(1);
    }
};

makeAdmin();
