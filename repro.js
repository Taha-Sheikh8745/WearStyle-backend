import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import connectDB from './config/db.js';
import sendEmail from './utils/sendEmail.js';

dotenv.config();

const test = async () => {
    try {
        await connectDB();
        const email = 'admin@wearstyle.com'; // or whatever user exists
        console.log('Finding user:', email);
        const user = await User.findOne({ email });

        if (!user) {
            console.error('User not found');
            process.exit(1);
        }

        console.log('User found. Updating OTP...');
        const otp = '123456';
        user.resetPasswordOTP = otp;
        user.resetPasswordOTPExpire = new Date(Date.now() + 10 * 60 * 1000);

        console.log('Attempting user.save()...');
        await user.save();
        console.log('User saved successfully');

        console.log('Attempting to send email...');
        try {
            await sendEmail({
                email: user.email,
                subject: 'Test OTP',
                message: `Your test OTP is ${otp}`,
            });
            console.log('Email sent successfully');
        } catch (emailErr) {
            console.error('Email sending failed:', emailErr.message);
        }

        process.exit(0);
    } catch (err) {
        console.error('General Error:', err);
        process.exit(1);
    }
};

test();
