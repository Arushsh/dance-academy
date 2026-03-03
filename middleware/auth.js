const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'dance_academy_secret_key_2024';

const auth = async (req, res, next) => {
    try {
        const tokenHeader = req.header('Authorization');
        const token = tokenHeader?.replace('Bearer ', '');
        console.log('auth header token:', token); // debug
        if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        if (!user) return res.status(401).json({ message: 'Token is not valid' });

        req.user = user;
        next();
    } catch (error) {
        console.error('auth middleware error:', error.message);
        res.status(401).json({ message: 'Token is not valid' });
    }
};

const adminAuth = async (req, res, next) => {
    try {
        const tokenHeader = req.header('Authorization');
        const token = tokenHeader?.replace('Bearer ', '');
        
        if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) return res.status(401).json({ message: 'Token is not valid' });
        
        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }
        
        req.user = user;
        next();
    } catch (error) {
        console.error('adminAuth middleware error:', error.message);
        res.status(401).json({ message: 'Token is not valid' });
    }
};

module.exports = { auth, adminAuth };
