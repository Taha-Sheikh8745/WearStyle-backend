export const adminAuth = (req, res, next) => {
    const adminKey = req.headers['x-admin-key'];
    const validKey = process.env.ADMIN_SECRET_KEY || 'mysecret123';
    
    if (adminKey && adminKey === validKey) {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Access denied. Invalid or missing admin key.' });
    }
};
