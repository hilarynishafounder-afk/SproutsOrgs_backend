const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Multer config for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', 'uploads');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// GET all events — public
router.get('/', async (req, res) => {
  try {
    const events = await Event.find().sort({ date: -1 });
    const eventsWithStatus = events.map(e => {
      const obj = e.toObject();
      obj.computedStatus = e.getComputedStatus();
      return obj;
    });
    res.json(eventsWithStatus);
  } catch (err) {
    console.error(`[GET /api/events] Error:`, err);
    res.status(500).json({ error: 'Failed to fetch events', details: err.message });
  }
});

// GET single event — public
router.get('/:id', async (req, res) => {
  console.log(`[GET /api/events/${req.params.id}] Fetching single event...`);
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      console.log(`[GET /api/events/${req.params.id}] Event not found`);
      return res.status(404).json({ error: 'Event not found' });
    }
    const obj = event.toObject();
    console.log(`[GET /api/events/${req.params.id}] Calculating status...`);
    obj.computedStatus = event.getComputedStatus();
    console.log(`[GET /api/events/${req.params.id}] Success! Sending response.`);
    res.json(obj);
  } catch (err) {
    console.error(`[GET /api/events/${req.params.id}] Error:`, err);
    if (err.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid event ID format' });
    }
    res.status(500).json({ error: 'Internal server error', details: err.message, stack: err.stack });
  }
});

// POST create event — admin
router.post('/', auth, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'certificateImage', maxCount: 1 },
  { name: 'galleryImages', maxCount: 10 }
]), async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.files?.image) data.image = '/uploads/' + req.files.image[0].filename;
    if (req.files?.certificateImage) data.certificateImage = '/uploads/' + req.files.certificateImage[0].filename;
    if (req.files?.galleryImages) data.galleryImages = req.files.galleryImages.map(f => '/uploads/' + f.filename);
    
    ['topics', 'benefits', 'galleryImages'].forEach(key => {
      if (typeof data[key] === 'string' && data[key].startsWith('[')) {
        try { data[key] = JSON.parse(data[key]); } catch (e) {}
      }
    });

    const event = new Event(data);
    await event.save();
    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update event — admin
router.put('/:id', auth, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'certificateImage', maxCount: 1 },
  { name: 'galleryImages', maxCount: 10 }
]), async (req, res) => {
  console.log(`[PUT /api/events/${req.params.id}] Request body keys:`, Object.keys(req.body));
  console.log(`[PUT /api/events/${req.params.id}] Files keys:`, Object.keys(req.files || {}));
  try {
    const data = { ...req.body };
    if (req.files?.image) data.image = '/uploads/' + req.files.image[0].filename;
    if (req.files?.certificateImage) data.certificateImage = '/uploads/' + req.files.certificateImage[0].filename;
    if (req.files?.galleryImages) data.galleryImages = req.files.galleryImages.map(f => '/uploads/' + f.filename);
    
    ['topics', 'benefits', 'galleryImages'].forEach(key => {
      if (data[key] && typeof data[key] === 'string' && data[key].startsWith('[')) {
        console.log(`[PUT /api/events/${req.params.id}] Parsing JSON for key: ${key}`);
        try { data[key] = JSON.parse(data[key]); } catch (e) { console.warn(`Failed to parse ${key}:`, e.message); }
      }
    });

    console.log(`[PUT /api/events/${req.params.id}] Updating document...`);
    const event = await Event.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!event) {
      console.log(`[PUT /api/events/${req.params.id}] Event to update not found`);
      return res.status(404).json({ error: 'Event not found' });
    }
    console.log(`[PUT /api/events/${req.params.id}] Update success!`);
    res.json(event);
  } catch (err) {
    console.error(`[PUT /api/events/${req.params.id}] CRITICAL ERROR:`, err);
    res.status(400).json({ error: 'Update failed', details: err.message, stack: err.stack });
  }
});

// DELETE event — admin
router.delete('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json({ message: 'Event deleted' });
  } catch (err) {
    console.error(`[DELETE /api/events/${req.params.id}] Error:`, err);
    if (err.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid event ID format' });
    }
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

module.exports = router;
