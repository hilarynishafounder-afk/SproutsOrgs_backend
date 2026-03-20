require('dotenv').config();
const mongoose = require('mongoose');
const Company = require('./models/Company');

async function addMultiImages() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const company = await Company.findOne();
  if (!company) { console.log('No company found'); process.exit(1); }

  // Add multiple images to the first highlight (Best Entrepreneur Award)
  company.highlights = company.highlights.map((h, idx) => {
    if (idx === 0) {
      h.images = [
        'https://ik.imagekit.io/Lourdu/Sprouts/image.png',
        'https://ik.imagekit.io/Lourdu/Sprouts/a1.jpeg',
        'https://ik.imagekit.io/Lourdu/Sprouts/image.png',
      ];
      console.log(`Set 3 images for: "${h.title}"`);
    }
    return h;
  });

  company.markModified('highlights');
  await company.save();
  console.log('Done!');
  process.exit(0);
}

addMultiImages().catch(err => { console.error(err); process.exit(1); });
