import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import sendEmail from '../utils/sendEmail.js';
import crypto from 'crypto';

const generateToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// @desc   Register new user
// @route  POST /api/auth/register
export const register = async (req, res, next) => {
    try {
        console.log('Register request body:', req.body);
        const { firstName, lastName, email, password, confirmPassword } = req.body;
        if (!firstName || !lastName || !email || !password || !confirmPassword) {
            return res.status(400).json({ success: false, message: 'All fields required.' });
        }
        if (password !== confirmPassword) {
            return res.status(400).json({ success: false, message: 'Passwords do not match.' });
        }
        const exists = await User.findOne({ email });
        if (exists) {
            return res.status(400).json({ success: false, message: 'Email already registered.' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        const user = await User.create({
            firstName,
            lastName,
            email,
            password,
            verificationOTP: otp,
            verificationOTPExpire: otpExpire,
            isVerified: false
        });
        console.log('User created successfully:', user._id);

        try {
            await sendEmail({
                email: user.email,
                subject: 'Email Verification OTP',
                message: `Your verification code is: ${otp}. It expires in 10 minutes.`,
            });
            res.status(201).json({
                success: true,
                message: 'OTP sent to email. Please verify.',
                email: user.email
            });
        } catch (emailError) {
            console.log('Email sending error:', emailError.message);
            user.verificationOTP = undefined;
            user.verificationOTPExpire = undefined;
            await user.save({ validateBeforeSave: false });
            return res.status(500).json({ success: false, message: 'Email could not be sent.' });
        }
    } catch (err) {
        console.error('Registration error catch:', err);
        next(err);
    }
};

// @desc   Verify email with OTP
// @route  POST /api/auth/verify
export const verifyEmail = async (req, res, next) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({
            email,
            verificationOTP: otp,
            verificationOTPExpire: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP.' });
        }

        user.isVerified = true;
        user.verificationOTP = undefined;
        user.verificationOTPExpire = undefined;
        await user.save();

        res.json({
            success: true,
            message: 'Email verified successfully.',
            user: { _id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role },
            token: generateToken(user._id),
        });
    } catch (err) { next(err); }
};

// @desc   Resend OTP
// @route  POST /api/auth/resend-otp
export const resendOTP = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email, isVerified: false });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found or already verified.' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.verificationOTP = otp;
        user.verificationOTPExpire = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();

        await sendEmail({
            email: user.email,
            subject: 'Email Verification OTP',
            message: `Your new verification code is: ${otp}. It expires in 10 minutes.`,
        });

        res.json({ success: true, message: 'OTP resent to email.' });
    } catch (err) { next(err); }
};

// @desc   Login user
// @route  POST /api/auth/login
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }
        if (!user.isVerified) {
            return res.status(401).json({ success: false, message: 'Please verify your email first.', isVerified: false });
        }
        res.json({
            success: true,
            user: { _id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role },
            token: generateToken(user._id),
        });
    } catch (err) { next(err); }
};

// @desc   Get logged in user profile
// @route  GET /api/auth/profile
export const getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json({ success: true, user });
    } catch (err) { next(err); }
};

// @desc   Update user profile
// @route  PUT /api/auth/profile
export const updateProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
        user.firstName = req.body.firstName || user.firstName;
        user.lastName = req.body.lastName || user.lastName;
        user.phone = req.body.phone || user.phone;
        user.address = req.body.address || user.address;
        if (req.body.password) user.password = req.body.password;
        const updated = await user.save();
        res.json({
            success: true,
            user: { _id: updated._id, firstName: updated.firstName, lastName: updated.lastName, email: updated.email, role: updated.role },
            token: generateToken(updated._id),
        });
    } catch (err) { next(err); }
};
// @desc   Get all users (Admin)
// @route  GET /api/auth/users
export const getUsers = async (req, res, next) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json({ success: true, users });
    } catch (err) { next(err); }
};

// @desc   Update user role (Admin)
// @route  PUT /api/auth/users/:id/role
export const updateUserRole = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

        // Restrict role modification to the primary admin only
        if (req.user.email !== process.env.ADMIN_EMAIL) {
            return res.status(403).json({ success: false, message: 'Only the primary administrator can modify roles.' });
        }

        user.role = req.body.role || user.role;
        await user.save();
        res.json({ success: true, message: 'User role updated.', user: { _id: user._id, role: user.role } });
    } catch (err) { next(err); }
};

// @desc   Delete user (Admin)
// @route  DELETE /api/auth/users/:id
export const deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
        await user.deleteOne();
        res.json({ success: true, message: 'User deleted.' });
    } catch (err) { next(err); }
};

// @desc   Update user password
// @route  PUT /api/auth/update-password
export const updatePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword, confirmNewPassword } = req.body;
        if (!currentPassword || !newPassword || !confirmNewPassword) {
            return res.status(400).json({ success: false, message: 'All password fields are required.' });
        }
        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({ success: false, message: 'New passwords do not match.' });
        }

        const user = await User.findById(req.user._id).select('+password');
        if (!user || !(await user.comparePassword(currentPassword))) {
            return res.status(401).json({ success: false, message: 'Invalid current password.' });
        }

        user.password = newPassword;
        await user.save();

        res.json({ success: true, message: 'Password updated successfully.' });
    } catch (err) { next(err); }
};

// @desc   Forgot password - Send OTP
// @route  POST /api/auth/forgot-password
export const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        console.log('Forgot password request for:', email);
        const user = await User.findOne({ email });

        if (!user) {
            console.log('User not found for forgot password:', email);
            return res.status(400).json({ success: false, message: 'There is no user with that email.' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetPasswordOTP = otp;
        user.resetPasswordOTPExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
        await user.save();

        try {
            await sendEmail({
                email: user.email,
                subject: 'Password Reset OTP',
                message: `Your password reset code is: ${otp}. It expires in 10 minutes.`,
            });

            res.status(200).json({ success: true, message: 'OTP sent to email.' });
        } catch (err) {
            user.resetPasswordOTP = undefined;
            user.resetPasswordOTPExpire = undefined;
            await user.save();
            return res.status(500).json({ success: false, message: 'Email could not be sent.' });
        }
    } catch (err) { next(err); }
};

// @desc   Reset password
// @route  POST /api/auth/reset-password
export const resetPassword = async (req, res, next) => {
    try {
        const { email, otp, password } = req.body;

        const user = await User.findOne({
            email,
            resetPasswordOTP: otp,
            resetPasswordOTPExpire: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP.' });
        }

        user.password = password;
        user.resetPasswordOTP = undefined;
        user.resetPasswordOTPExpire = undefined;
        await user.save();

        res.status(200).json({ success: true, message: 'Password reset successful. You can now login.' });
    } catch (err) { next(err); }
};
