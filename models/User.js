import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
    {
        firstName: { type: String, required: true, trim: true },
        lastName: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true },
        password: { type: String, required: true, minlength: 6 },
        role: { type: String, enum: ['user', 'admin'], default: 'user' },
        avatar: { type: String, default: '' },
        phone: { type: String, default: '' },
        address: {
            street: String,
            city: String,
            state: String,
            zipCode: String,
            country: String,
        },
        isVerified: { type: Boolean, default: false },
        verificationOTP: { type: String },
        verificationOTPExpire: { type: Date },
        wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
        resetPasswordOTP: { type: String },
        resetPasswordOTPExpire: { type: Date },
    },
    { timestamps: true }
);

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
