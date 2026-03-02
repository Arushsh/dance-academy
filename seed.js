const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Event = require('./models/Event');
const Payment = require('./models/Payment');
const Attendance = require('./models/Attendance');
const connectDB = require('./config/db');

const seedDatabase = async () => {
    await connectDB();
    console.log('🌱 Seeding database...');

    // Clear existing data
    await User.deleteMany({});
    await Event.deleteMany({});
    await Payment.deleteMany({});
    await Attendance.deleteMany({});

    // Create Admin
    const admin = new User({
        name: 'Admin User', email: 'admin@danceacademy.com', password: 'admin123',
        role: 'admin', phone: '9999999999'
    });
    await admin.save();
    console.log('✅ Admin created: admin@danceacademy.com / admin123');

    // Create sample students
    const students = [
        { name: 'Priya Sharma', email: 'priya@example.com', password: 'student123', age: 18, gender: 'Female', phone: '9876543210', danceType: 'Classical', batchTiming: '5:00 PM - 6:00 PM', address: 'Mumbai, Maharashtra' },
        { name: 'Rahul Singh', email: 'rahul@example.com', password: 'student123', age: 22, gender: 'Male', phone: '9876543211', danceType: 'Hip-Hop', batchTiming: '7:30 PM - 8:30 PM', address: 'Delhi, India' },
        { name: 'Anjali Patel', email: 'anjali@example.com', password: 'student123', age: 20, gender: 'Female', phone: '9876543212', danceType: 'Bollywood', batchTiming: '4:00 PM - 5:00 PM', address: 'Ahmedabad, Gujarat' },
        { name: 'Rohan Mehta', email: 'rohan@example.com', password: 'student123', age: 25, gender: 'Male', phone: '9876543213', danceType: 'Contemporary', batchTiming: '6:30 PM - 7:30 PM', address: 'Pune, Maharashtra' },
    ];

    const createdStudents = [];
    for (const s of students) {
        const student = new User({ ...s, role: 'student' });
        await student.save();
        createdStudents.push(student);
    }
    console.log(`✅ ${students.length} students created`);

    // Create Events
    const events = [
        { title: 'Annual Dance Championships 2026', description: 'Our biggest annual dance championship featuring all styles — Classical, Bollywood, Hip-Hop, and Contemporary. Open to all students!', date: new Date('2026-04-15'), venue: 'City Auditorium, Mumbai', time: '5:00 PM', category: 'Competition', maxParticipants: 200 },
        { title: 'Spring Bollywood Blast', description: 'A vibrant Bollywood-themed dance extravaganza celebrating spring. Come dressed in colorful attire!', date: new Date('2026-03-20'), venue: 'Academy Main Hall', time: '6:30 PM', category: 'Performance', maxParticipants: 100 },
        { title: 'Hip-Hop Battle Night', description: 'Freestyle and organized battle rounds for Hip-Hop dancers. Show your skills on the dance floor!', date: new Date('2026-03-28'), venue: 'Urban Dance Studio', time: '7:00 PM', category: 'Competition', maxParticipants: 60 },
        { title: 'Classical Dance Workshop', description: 'Intensive 2-day workshop by Guest Guru from Kalakshetra covering advanced Bharatanatyam techniques.', date: new Date('2026-04-05'), venue: 'Academy Studio A', time: '9:00 AM', category: 'Workshop', maxParticipants: 30 },
    ];

    for (const e of events) {
        const event = new Event({ ...e, registrations: [createdStudents[0]._id, createdStudents[2]._id] });
        await event.save();
    }
    console.log(`✅ ${events.length} events created`);

    // Create Payment records
    const months = ['January', 'February', 'March'];
    for (const student of createdStudents) {
        for (let i = 0; i < months.length; i++) {
            const payment = new Payment({
                student: student._id, amount: 1500, month: months[i], year: 2026,
                status: i < 2 ? 'Paid' : 'Pending',
                paymentDate: i < 2 ? new Date(`2026-0${i + 1}-05`) : null,
                paymentMethod: 'UPI'
            });
            await payment.save();
        }
    }
    console.log('✅ Payment records created');

    // Create Attendance
    const today = new Date();
    for (const student of createdStudents) {
        for (let i = 0; i < 10; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const attendance = new Attendance({
                student: student._id, date, status: Math.random() > 0.2 ? 'Present' : 'Absent',
                danceType: student.danceType, batchTiming: student.batchTiming
            });
            await attendance.save();
        }
    }
    console.log('✅ Attendance records created');

    console.log('\n🎉 Database seeded successfully!');
    console.log('📧 Admin Login: admin@danceacademy.com | Password: admin123');
    console.log('📧 Student Login: priya@example.com | Password: student123');
    process.exit(0);
};

seedDatabase().catch(err => { console.error(err); process.exit(1); });
