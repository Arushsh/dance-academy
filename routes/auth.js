const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'dance_academy_secret_key_2024';

// @route POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, age, gender, phone, address, danceType, batchTiming } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'User already exists with this email' });

        const user = new User({ name, email, password, age, gender, phone, address, danceType, batchTiming, role: 'student' });
        await user.save();

        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        const userObj = user.toObject();
        delete userObj.password;

        res.status(201).json({ message: 'Registration successful!', token, user: userObj });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route POST /api/auth/register-admin
router.post('/register-admin', async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'User already exists with this email' });

        const user = new User({ name, email, password, phone, role: 'admin' });
        await user.save();

        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        const userObj = user.toObject();
        delete userObj.password;

        res.status(201).json({ message: 'Admin registration successful!', token, user: userObj });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        const userObj = user.toObject();
        delete userObj.password;

        res.json({ message: 'Login successful!', token, user: userObj });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
