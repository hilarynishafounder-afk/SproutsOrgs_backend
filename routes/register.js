const express = require('express');
const router = express.Router();
const Registration = require('../models/Registration');
const auth = require('../middleware/auth');

// POST register for an event
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, college, course, eventId } = req.body;
    const registration = new Registration({ name, email, phone, college, course, eventId });
    await registration.save();
    res.status(201).json({ message: 'Registration successful', registration });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET all registrations — admin
router.get('/', auth, async (req, res) => {
  try {
    const registrations = await Registration.find().populate('eventId', 'title date').sort({ createdAt: -1 });
    res.json(registrations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE registration — admin
router.delete('/:id', auth, async (req, res) => {
  try {
    const registration = await Registration.findByIdAndDelete(req.params.id);
    if (!registration) return res.status(404).json({ error: 'Registration not found' });
    res.json({ message: 'Registration deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
