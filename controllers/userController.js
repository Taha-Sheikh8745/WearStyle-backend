import User from '../models/User.js';

// @desc   Get all users (Admin)
// @route  GET /api/users
export const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        res.json({ success: true, users });
    } catch (err) { next(err); }
};

// @desc   Get user by ID (Admin)
// @route  GET /api/users/:id
export const getUserById = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
        res.json({ success: true, user });
    } catch (err) { next(err); }
};

// @desc   Update user role (Admin)
// @route  PUT /api/users/:id
export const updateUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
        user.name = req.body.name || user.name;
        user.role = req.body.role || user.role;
        const updated = await user.save();
        res.json({ success: true, user: { _id: updated._id, name: updated.name, email: updated.email, role: updated.role } });
    } catch (err) { next(err); }
};

// @desc   Delete user (Admin)
// @route  DELETE /api/users/:id
export const deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
        await user.deleteOne();
        res.json({ success: true, message: 'User removed.' });
    } catch (err) { next(err); }
};
