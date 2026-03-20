require('dotenv').config();
const mongoose = require('mongoose');
const Company = require('./models/Company');

const allHighlights = [
  {
    title: "Best Entrepreneur Award – STARTUP TN",
    tag: "Award",
    images: [
      "https://ik.imagekit.io/Lourdu/Sprouts/image.png",
      "https://ik.imagekit.io/Lourdu/Sprouts/a1.jpeg"
    ],
    description: "Recognized by Startup TN for outstanding entrepreneurial initiative and impact.",
    location: "Trichy"
  },
  {
    title: "Lecture @ Saranathan College of Engineering",
    tag: "Lecture",
    images: ["https://ik.imagekit.io/Lourdu/Sprouts/image.png"],
    description: "Delivered session on AI and industry trends.",
    location: "Trichy"
  },
  {
    title: "Data Science Guest Lecture @ MS University, Tirunelveli",
    tag: "Lecture",
    images: ["https://ik.imagekit.io/Lourdu/Sprouts/image.png"],
    description: "Covered data science fundamentals and real-world applications.",
    location: "Tirunelveli"
  },
  {
    title: "Lecture @ Vellur Govt Higher Secondary School",
    tag: "Lecture",
    images: ["https://ik.imagekit.io/Lourdu/Sprouts/image.png"],
    description: "Introduced students to AI and future technologies.",
    location: "Vellur"
  },
  {
    title: "One Day Skill Development Workshop",
    tag: "Workshop",
    images: ["https://ik.imagekit.io/Lourdu/Sprouts/image.png"],
    description: "Conducted skill-based training for students.",
    location: "Hope Worldwide Orphanage, Trichy"
  },
  {
    title: "Contributing Awards for AI Hackathon Winners",
    tag: "Award",
    images: ["https://ik.imagekit.io/Lourdu/Sprouts/image.png"],
    description: "Recognized and awarded top AI innovators at Dhanalakshmi Srinivasan University.",
    location: "DSU, on behalf of Sprouts"
  },
  {
    title: "AI Tech Interview Podcast @ MS University Radio",
    tag: "Podcast",
    images: ["https://ik.imagekit.io/Lourdu/Sprouts/image.png"],
    description: "Discussed AI trends, career paths, and industry insights.",
    location: "MSU Radio, Tirunelveli"
  }
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const company = await Company.findOne();
  if (!company) { console.log('No company found'); process.exit(1); }

  // Replace highlights with the full set
  company.highlights = allHighlights;
  company.markModified('highlights');
  await company.save();
  console.log('Restored all 7 highlights successfully!');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
