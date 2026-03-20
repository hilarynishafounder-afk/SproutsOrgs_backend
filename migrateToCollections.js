require('dotenv').config();
const mongoose = require('mongoose');
const Company = require('./models/Company');
const Highlight = require('./models/Highlight');
const Client = require('./models/Client');

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const company = await Company.findOne();
  if (!company) { console.log('No company found'); process.exit(1); }

  let highlightsMoved = 0;
  let clientsMoved = 0;

  // Move Highlights
  if (company.highlights && company.highlights.length > 0) {
    for (const h of company.highlights) {
      // Create new Highlight document
      const newH = new Highlight({
        title: h.title,
        description: h.description,
        images: h.images,
        tag: h.tag,
        location: h.location,
        date: h.date
      });
      await newH.save();
      highlightsMoved++;
    }
    console.log(`Moved ${highlightsMoved} highlights to new collection.`);
  }

  // Move Clients
  if (company.clients && company.clients.length > 0) {
    for (const c of company.clients) {
      // Create new Client document
      const newC = new Client({
        name: c.name,
        logo: c.logo,
        location: c.location,
        description: c.description
      });
      await newC.save();
      clientsMoved++;
    }
    console.log(`Moved ${clientsMoved} clients to new collection.`);
  }

  console.log('\nMigration complete!');
  process.exit(0);
}

migrate().catch(err => { console.error(err); process.exit(1); });
