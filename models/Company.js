const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  about: { type: String, default: '' },
  vision: { type: String, default: '' },
  mission: { type: String, default: '' },
  contactEmail: { type: String, default: 'sproutsorgs.official@gmail.com' },
  contactPhones: [{ type: String }],
  instagram: { type: String, default: '' },
  linkedin: { type: String, default: '' },
  logo: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Company', companySchema);
