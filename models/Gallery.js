const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
    publicId: { type: String, required: true, unique: true },
    url: { type: String, required: true },
    secureUrl: { type: String, required: true },
    title: { type: String, default: '' },
    name: { type: String, required: true },
    section: { type: String, enum: ['General', 'Performance', 'Workshop', 'Competition', 'Festival', 'Behind the Scenes'], default: 'General' },
    mediaType: { type: String, enum: ['image', 'video'], default: 'image' },
    format: { type: String },
    width: { type: Number },
    height: { type: Number },
    bytes: { type: Number },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Gallery', gallerySchema);
