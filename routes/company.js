const express = require('express');
const router = express.Router();
const Company = require('../models/Company');
const Highlight = require('../models/Highlight');
const Client = require('../models/Client');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// GET company data — public (Full Profile + Highlights + Clients)
router.get('/', async (req, res) => {
  try {
    const [company, highlights, clients] = await Promise.all([
      Company.findOne(),
      Highlight.find().sort({ createdAt: -1 }),
      Client.find().sort({ createdAt: -1 })
    ]);

    if (!company) {
      const newCompany = new Company();
      return res.json({ 
        ...newCompany.toObject(), 
        highlights: highlights || [], 
        clients: clients || [] 
      });
    }

    res.json({
      ...company.toObject(),
      highlights: highlights || [],
      clients: clients || []
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update company — admin
router.put('/', auth, upload.single('logo'), async (req, res) => {
  try {
    let company = await Company.findOne();
    if (!company) company = new Company();
    
    const data = { ...req.body };
    if (req.file) data.logo = `/uploads/${req.file.filename}`;
    
    // Ensure we don't accidentally save nested arrays if old frontend sends them
    delete data.highlights;
    delete data.clients;

    Object.assign(company, data);
    await company.save();
    res.json(company);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- HIGHLIGHTS ROUTES ---

// DELETE highlight
router.delete('/highlights/:id', auth, async (req, res) => {
  try {
    const highlight = await Highlight.findByIdAndDelete(req.params.id);
    if (!highlight) return res.status(404).json({ error: 'Highlight not found' });
    res.json({ message: 'Highlight deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add highlight
router.post('/highlights', auth, async (req, res) => {
  try {
    const highlight = new Highlight(req.body);
    await highlight.save();
    res.status(201).json(highlight);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update highlight
router.put('/highlights/:id', auth, async (req, res) => {
  try {
    const highlight = await Highlight.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!highlight) return res.status(404).json({ error: 'Highlight not found' });
    res.json(highlight);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST upload highlight images
router.post('/highlights/upload', auth, upload.array('images', 10), async (req, res) => {
  try {
    const urls = req.files.map(f => `/uploads/${f.filename}`);
    res.json({ urls });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- CLIENTS ROUTES ---

// DELETE client
router.delete('/clients/:id', auth, async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);
    if (!client) return res.status(404).json({ error: 'Client not found' });
    res.json({ message: 'Client deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add client
router.post('/clients', auth, upload.single('logo'), async (req, res) => {
  try {
    const clientData = { ...req.body };
    if (req.file) clientData.logo = `/uploads/${req.file.filename}`;
    const client = new Client(clientData);
    await client.save();
    res.status(201).json(client);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update client
router.put('/clients/:id', auth, upload.single('logo'), async (req, res) => {
  try {
    const clientData = { ...req.body };
    if (req.file) clientData.logo = `/uploads/${req.file.filename}`;
    const client = await Client.findByIdAndUpdate(req.params.id, clientData, { new: true });
    if (!client) return res.status(404).json({ error: 'Client not found' });
    res.json(client);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
