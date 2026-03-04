const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middleware/auth');
const User = require('../models/User');
const Event = require('../models/Event');
const Attendance = require('../models/Attendance');
const Payment = require('../models/Payment');

// @route GET /api/admin/stats
router.get('/stats', adminAuth, async (req, res) => {
    try {
        const totalStudents = await User.countDocuments({ role: 'student' });
        const activeStudents = await User.countDocuments({ role: 'student', isActive: true });
        const totalEvents = await Event.countDocuments();
        const upcomingEvents = await Event.countDocuments({ date: { $gte: new Date() } });
        const pendingPayments = await Payment.countDocuments({ status: { $in: ['Pending', 'Overdue'] } });
        const paidThisMonth = await Payment.countDocuments({ status: 'Paid', month: new Date().toLocaleString('default', { month: 'long' }) });

        const danceTypeStats = await User.aggregate([
            { $match: { role: 'student' } },
            { $group: { _id: '$danceType', count: { $sum: 1 } } }
        ]);

        res.json({ totalStudents, activeStudents, totalEvents, upcomingEvents, pendingPayments, paidThisMonth, danceTypeStats });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route GET /api/admin/students
router.get('/students', adminAuth, async (req, res) => {
    try {
        const students = await User.find({ role: 'student' }).select('-password').sort({ createdAt: -1 });
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route PUT /api/admin/students/:id
router.put('/students/:id', adminAuth, async (req, res) => {
    try {
        const student = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
        res.json({ message: 'Student updated', student });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route DELETE /api/admin/students/:id
router.delete('/students/:id', adminAuth, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'Student removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route POST /api/admin/events
router.post('/events', adminAuth, async (req, res) => {
    try {
        const event = new Event(req.body);
        await event.save();
        res.status(201).json({ message: 'Event created!', event });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route PUT /api/admin/events/:id
router.put('/events/:id', adminAuth, async (req, res) => {
    try {
        const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ message: 'Event updated!', event });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route DELETE /api/admin/events/:id
router.delete('/events/:id', adminAuth, async (req, res) => {
    try {
        await Event.findByIdAndDelete(req.params.id);
        res.json({ message: 'Event deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route GET /api/admin/payments
router.get('/payments', adminAuth, async (req, res) => {
    try {
        const payments = await Payment.find().populate('student', 'name email danceType batchTiming').sort({ createdAt: -1 });
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route POST /api/admin/payments — Create a fee record for a student
router.post('/payments', adminAuth, async (req, res) => {
    try {
        const payment = new Payment(req.body);
        await payment.save();
        const populated = await Payment.findById(payment._id).populate('student', 'name email danceType batchTiming');
        res.status(201).json({ message: 'Payment record created!', payment: populated });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route PUT /api/admin/payments/:id
router.put('/payments/:id', adminAuth, async (req, res) => {
    try {
        const payment = await Payment.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ message: 'Payment updated!', payment });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route DELETE /api/admin/payments/:id
router.delete('/payments/:id', adminAuth, async (req, res) => {
    try {
        await Payment.findByIdAndDelete(req.params.id);
        res.json({ message: 'Payment record deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route GET /api/admin/attendance — All attendance records
router.get('/attendance', adminAuth, async (req, res) => {
    try {
        const filter = {};
        if (req.query.studentId) filter.student = req.query.studentId;
        if (req.query.date) {
            const d = new Date(req.query.date);
            d.setHours(0, 0, 0, 0);
            const end = new Date(d); end.setHours(23, 59, 59, 999);
            filter.date = { $gte: d, $lte: end };
        }
        const records = await Attendance.find(filter)
            .populate('student', 'name email danceType batchTiming')
            .populate('markedBy', 'name')
            .sort({ date: -1 })
            .limit(200);
        res.json(records);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route POST /api/admin/attendance — Mark attendance
router.post('/attendance', adminAuth, async (req, res) => {
    try {
        const { student, date, status, danceType, batchTiming } = req.body;
        // Prevent duplicate: same student + same date
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        const end = new Date(d); end.setHours(23, 59, 59, 999);
        const existing = await Attendance.findOne({ student, date: { $gte: d, $lte: end } });
        if (existing) {
            // Update existing
            existing.status = status || existing.status;
            existing.markedBy = req.user._id;
            await existing.save();
            const populated = await Attendance.findById(existing._id)
                .populate('student', 'name email danceType batchTiming')
                .populate('markedBy', 'name');
            return res.json({ message: 'Attendance updated!', attendance: populated });
        }
        const attendance = new Attendance({ student, date, status, danceType, batchTiming, markedBy: req.user._id });
        await attendance.save();
        const populated = await Attendance.findById(attendance._id)
            .populate('student', 'name email danceType batchTiming')
            .populate('markedBy', 'name');
        res.status(201).json({ message: 'Attendance marked!', attendance: populated });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route DELETE /api/admin/attendance/:id
router.delete('/attendance/:id', adminAuth, async (req, res) => {
    try {
        await Attendance.findByIdAndDelete(req.params.id);
        res.json({ message: 'Attendance record deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route GET /api/admin/export/students
router.get('/export/students', adminAuth, async (req, res) => {
    try {
        const students = await User.find({ role: 'student' }).select('-password');
        const csv = [
            'Name,Email,Phone,Age,Gender,Dance Type,Batch Timing,Address,Joining Date',
            ...students.map(s => `"${s.name}","${s.email}","${s.phone || ''}","${s.age || ''}","${s.gender || ''}","${s.danceType || ''}","${s.batchTiming || ''}","${s.address || ''}","${s.joiningDate ? s.joiningDate.toLocaleDateString() : ''}"`)
        ].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=students.csv');
        res.send(csv);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
