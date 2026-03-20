const mongoose = require('mongoose');

const highlightSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  images: [{ type: String }],
  tag: { type: String, default: 'Award' }, // Award, Lecture, Workshop, Podcast
  location: { type: String, default: '' },
  date: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Highlight', highlightSchema);
