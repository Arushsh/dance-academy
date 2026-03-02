const express = require('express');
const router = express.Router();

const courses = [
    {
        id: 1, name: 'Classical Dance', type: 'Classical', emoji: '🪷',
        description: 'Master the grace and precision of classical Indian dance forms including Bharatanatyam and Kathak.',
        trainer: 'Guru Priya Sharma', experience: '15 years', level: 'Beginner to Advanced',
        duration: '6 months', batchTimings: ['7:00 AM - 8:00 AM', '5:00 PM - 6:00 PM', '6:00 PM - 7:00 PM'],
        fees: { monthly: 1500, registration: 500, annual: 16000 },
        features: ['Classical Mudras', 'Rhythmic Footwork', 'Expressive Storytelling', 'Stage Performance'],
        color: '#ff6b35'
    },
    {
        id: 2, name: 'Bollywood Dance', type: 'Bollywood', emoji: '🎬',
        description: 'Learn the vibrant and energetic dance style inspired by Bollywood films. Great for all ages!',
        trainer: 'Neha Kapoor', experience: '10 years', level: 'Beginner to Intermediate',
        duration: '3 months', batchTimings: ['8:00 AM - 9:00 AM', '4:00 PM - 5:00 PM', '7:00 PM - 8:00 PM'],
        fees: { monthly: 1200, registration: 400, annual: 13000 },
        features: ['Film Choreography', 'Group Performances', 'Expression Training', 'Stage Confidence'],
        color: '#e91e8c'
    },
    {
        id: 3, name: 'Hip-Hop Dance', type: 'Hip-Hop', emoji: '🎤',
        description: 'Dive into the world of Hip-Hop with breaking, locking, popping and freestyle movements.',
        trainer: 'Arjun Mehta', experience: '8 years', level: 'Beginner to Advanced',
        duration: '4 months', batchTimings: ['9:00 AM - 10:00 AM', '5:30 PM - 6:30 PM', '7:30 PM - 8:30 PM'],
        fees: { monthly: 1300, registration: 450, annual: 14000 },
        features: ['Breaking & Popping', 'Freestyle Sessions', 'Battle Training', 'Music Theory'],
        color: '#7c3aed'
    },
    {
        id: 4, name: 'Contemporary Dance', type: 'Contemporary', emoji: '🌊',
        description: 'Explore fluid movements and artistic expression in contemporary dance. A fusion of multiple styles.',
        trainer: 'Riya Desai', experience: '12 years', level: 'Intermediate to Advanced',
        duration: '5 months', batchTimings: ['6:00 AM - 7:00 AM', '6:30 PM - 7:30 PM', '8:00 PM - 9:00 PM'],
        fees: { monthly: 1600, registration: 500, annual: 17000 },
        features: ['Floor Work', 'Improvisation', 'Choreography Skills', 'Acrobatic Elements'],
        color: '#0891b2'
    }
];

// @route GET /api/courses
router.get('/', (req, res) => res.json(courses));

// @route GET /api/courses/:type
router.get('/:type', (req, res) => {
    const course = courses.find(c => c.type.toLowerCase() === req.params.type.toLowerCase());
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
});

module.exports = router;
