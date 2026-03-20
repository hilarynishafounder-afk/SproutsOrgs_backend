const express = require('express');
const router = express.Router();
const Internship = require('../models/Internship');
const auth = require('../middleware/auth');

// POST submit internship application
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, college, course, track } = req.body;
    const application = new Internship({ name, email, phone, college, course, track });
    await application.save();
    res.status(201).json({ message: 'Application submitted successfully', application });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET all applications — admin
router.get('/', auth, async (req, res) => {
  try {
    const applications = await Internship.find().sort({ createdAt: -1 });
    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE application — admin
router.delete('/:id', auth, async (req, res) => {
  try {
    const application = await Internship.findByIdAndDelete(req.params.id);
    if (!application) return res.status(404).json({ error: 'Application not found' });
    res.json({ message: 'Application deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
