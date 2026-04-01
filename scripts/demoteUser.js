import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const demoteUser = async () => {
    try {
        await mongoose.connect(process.env.DATABASE);
        console.log('Connected to database');

        const email = 'tahaanwar234@gmail.com';
        const user = await User.findOne({ email });

        if (!user) {
            console.log('User not found:', email);
            process.exit(1);
        }

        user.role = 'user';
        await user.save();

        console.log(`User ${email} has been demoted to 'user' role.`);
        process.exit(0);
    } catch (error) {
        console.error('Error demoting user:', error.message);
        process.exit(1);
    }
};

demoteUser();
