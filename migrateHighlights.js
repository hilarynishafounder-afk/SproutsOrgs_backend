require('dotenv').config();
const mongoose = require('mongoose');
const Company = require('./models/Company');

// Map known highlight titles to their real image URLs
const imageMap = {
  'Best Entrepreneur Award': [
    'https://ik.imagekit.io/Lourdu/Sprouts/image.png',
    'https://ik.imagekit.io/Lourdu/Sprouts/a1.jpeg'
  ],
  'Workshop at Hope Worldwide Orphanage': ['https://ik.imagekit.io/Lourdu/Sprouts/image.png'],
  'Guest Lecture at Saranathan College': ['https://ik.imagekit.io/Lourdu/Sprouts/image.png'],
  'AI Hackathon Contributions': ['https://ik.imagekit.io/Lourdu/Sprouts/image.png'],
  'AI Tech Interview Podcast': ['https://ik.imagekit.io/Lourdu/Sprouts/image.png'],
  'Government School Lecture': ['https://ik.imagekit.io/Lourdu/Sprouts/image.png'],
  'Data Science Guest Lecture': ['https://ik.imagekit.io/Lourdu/Sprouts/image.png'],
};

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const company = await Company.findOne();
  if (!company) { console.log('No company found'); process.exit(1); }

  let updated = 0;
  company.highlights = company.highlights.map(h => {
    // Find matching image array (partial title match)
    const match = Object.keys(imageMap).find(key => h.title && h.title.toLowerCase().includes(key.toLowerCase().split(' ').slice(0, 2).join(' ').toLowerCase()));
    if (match && (!h.images || h.images.length === 0)) {
      h.images = imageMap[match];
      updated++;
      console.log(`Updated: "${h.title}" → ${h.images.length} image(s)`);
    } else if (!h.images || h.images.length === 0) {
      // Give every highlight at least one default image
      h.images = ['https://ik.imagekit.io/Lourdu/Sprouts/image.png'];
      updated++;
      console.log(`Default image for: "${h.title}"`);
    }
    return h;
  });

  company.markModified('highlights');
  await company.save();
  console.log(`\nDone! Updated ${updated} highlights.`);
  process.exit(0);
}

migrate().catch(err => { console.error(err); process.exit(1); });
