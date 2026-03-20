const mongoose = require('mongoose');
const Event = require('./models/Event');
require('dotenv').config();

const events = [
  {
    title: "AI & Machine Learning Masterclass",
    description: "A deep dive into neural networks and predictive modeling using Python and TensorFlow.",
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    duration: "2 Days",
    price: "₹499",
    category: "Upcoming",
    topics: ["Neural Networks", "TensorFlow", "Pandas", "Sklearn"],
    benefits: ["Certificate", "Study Material", "Hands-on Projects"],
    trainerName: "Dr. Arun Kumar",
    trainerBio: "AI Researcher with 10+ years experience."
  },
  {
    title: "Data Science with Python Workshop",
    description: "Learn to clean, analyze, and visualize data like a pro.",
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    duration: "3 Hours",
    price: "Free",
    category: "Upcoming",
    topics: ["Numpy", "Matplotlib", "Seaborn", "SQL"],
    benefits: ["Career Guidance", "Certificate"],
    trainerName: "Smitha Raj",
    trainerBio: "Data Scientist at Roriri."
  },
  {
    title: "Web Development Bootcamp",
    description: "Build modern, responsive websites using MERN stack.",
    date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
    duration: "5 Days",
    price: "₹999",
    category: "Upcoming",
    topics: ["React", "Node.js", "Express", "MongoDB"],
    benefits: ["Project Portfolio", "Placement Support"],
    trainerName: "John Doe",
    trainerBio: "Senior Full Stack Dev."
  },
  {
    title: "Deep Learning Foundations (2025)",
    description: "Completed workshop on advanced neural networks.",
    date: new Date("2025-10-15"),
    duration: "2 Days",
    price: "₹799",
    category: "Completed",
    topics: ["CNN", "RNN", "GANs"],
    benefits: ["Certificate"],
    trainerName: "AI Specialist",
    trainerBio: "Industry Expert."
  },
  {
    title: "Intro to Robotics & IoT",
    description: "Exploring the world of connected devices and hardware.",
    date: new Date("2026-02-10"),
    duration: "1 Day",
    price: "₹299",
    category: "Completed",
    topics: ["Arduino", "Sensors", "MQTT"],
    benefits: ["Kit Demo", "Certificate"],
    trainerName: "Eng. Vikram",
    trainerBio: "Robotics Lead."
  }
];

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    await Event.deleteMany({}); // Clear existing
    await Event.insertMany(events);
    console.log('Events seeded successfully');
    process.exit();
  })
  .catch(err => {
    console.error('Error seeding events:', err);
    process.exit(1);
  });
