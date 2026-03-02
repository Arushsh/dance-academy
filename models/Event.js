const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    venue: { type: String, required: true },
    time: { type: String },
    category: { type: String, enum: ['Competition', 'Workshop', 'Performance', 'Festival', 'Other'], default: 'Other' },
    image: { type: String, default: '' },
    maxParticipants: { type: Number, default: 50 },
    registrations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
