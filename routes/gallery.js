const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const Gallery = require('../models/Gallery');
const { auth: protect, adminAuth } = require('../middleware/auth');

// Configure multer with Cloudinary storage
const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
        const isVideo = file.mimetype.startsWith('video/');
        return {
            folder: 'dance_academy_gallery',
            resource_type: 'auto',           // let Cloudinary detect image vs video
            use_filename: true,
            unique_filename: true,
            transformation: isVideo ? [] : [{ quality: 'auto', fetch_format: 'auto' }],
        };
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB max
});

// ─── GET /api/gallery ─── List all gallery items (public)
router.get('/', async (req, res) => {
    try {
        const query = {};
        if (req.query.section && req.query.section !== 'All') {
            query.section = req.query.section;
        }
        const items = await Gallery.find(query)
            .sort({ createdAt: -1 })
            .populate('uploadedBy', 'name');
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch gallery', error: err.message });
    }
});

// ─── POST /api/gallery/upload ─── Upload one or more files (admin only)
router.post('/upload', adminAuth, upload.array('media', 10), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }

        const section = req.body.section || 'General';
        const title = req.body.title || '';

        const savedItems = [];
        for (const file of req.files) {
            const isVideo = file.mimetype ? file.mimetype.startsWith('video/') : false;
            // multer-storage-cloudinary puts Cloudinary fields in file.path and file.filename
            const item = new Gallery({
                publicId: file.filename || file.public_id,
                url: file.path,
                secureUrl: file.path,
                name: file.originalname,
                title: title || file.originalname,
                section,
                mediaType: isVideo ? 'video' : 'image',
                format: file.mimetype ? file.mimetype.split('/')[1] : 'unknown',
                bytes: file.size || 0,
                uploadedBy: req.user._id,
            });
            await item.save();
            savedItems.push(item);
        }

        res.status(201).json({ message: 'Upload successful', items: savedItems });
    } catch (err) {
        console.error('Gallery upload error:', err);
        res.status(500).json({ message: 'Upload failed', error: err.message });
    }
});


// ─── DELETE /api/gallery/:id ─── Delete item from Cloudinary + DB (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
    try {
        const item = await Gallery.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Gallery item not found' });

        // Delete from Cloudinary
        try {
            await cloudinary.uploader.destroy(item.publicId, {
                resource_type: item.mediaType === 'video' ? 'video' : 'image',
            });
        } catch (cloudErr) {
            console.warn('Cloudinary deletion warning:', cloudErr.message);
        }

        await Gallery.findByIdAndDelete(req.params.id);
        res.json({ message: 'Gallery item deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Delete failed', error: err.message });
    }
});

// ─── DELETE /api/gallery (bulk delete all) ─── Admin only
router.delete('/', adminAuth, async (req, res) => {
    try {
        const items = await Gallery.find();
        for (const item of items) {
            try {
                await cloudinary.uploader.destroy(item.publicId, {
                    resource_type: item.mediaType === 'video' ? 'video' : 'image',
                });
            } catch (e) { /* ignore */ }
        }
        await Gallery.deleteMany({});
        res.json({ message: 'All gallery items deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Bulk delete failed', error: err.message });
    }
});

module.exports = router;
