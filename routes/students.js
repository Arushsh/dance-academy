const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Payment = require('../models/Payment');
const Event = require('../models/Event');

// @route GET /api/students/profile
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route PUT /api/students/profile
router.put('/profile', auth, async (req, res) => {
    try {
        const { name, phone, address, danceType, batchTiming } = req.body;
        const user = await User.findByIdAndUpdate(req.user._id, { name, phone, address, danceType, batchTiming }, { new: true }).select('-password');
        res.json({ message: 'Profile updated!', user });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route GET /api/students/attendance
router.get('/attendance', auth, async (req, res) => {
    try {
        const attendance = await Attendance.find({ student: req.user._id }).sort({ date: -1 }).limit(30);
        const total = attendance.length;
        const present = attendance.filter(a => a.status === 'Present').length;
        const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
        res.json({ attendance, stats: { total, present, absent: total - present, percentage } });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route GET /api/students/fees
router.get('/fees', auth, async (req, res) => {
    try {
        const payments = await Payment.find({ student: req.user._id }).sort({ year: -1, createdAt: -1 });
        const pending = payments.filter(p => p.status === 'Pending' || p.status === 'Overdue').length;
        res.json({ payments, pendingCount: pending });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route GET /api/students/events
router.get('/events', auth, async (req, res) => {
    try {
        const events = await Event.find({ registrations: req.user._id }).sort({ date: -1 });
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
