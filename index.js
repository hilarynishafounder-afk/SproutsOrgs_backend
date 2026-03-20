const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// ━━━━━━━━━━━━━━━━━━━━━━━
// 🚀 BACKEND CONFIGURATION
// ━━━━━━━━━━━━━━━━━━━━━━━

// Database Connections
const LOCAL_DB = "mongodb://127.0.0.1:27017/sprouts"; // Local MongoDB
const CLOUD_DB = process.env.MONGODB_URI || "mongodb+srv://hilarynishafounder:Nisha%40123@cluster0.rkhws5w.mongodb.net/sprouts?retryWrites=true&w=majority&appName=Cluster0";

// SWITCH: Auto-detect based on environment
const USE_CLOUD = process.env.NODE_ENV === 'production';

// Port Handling for deployment
const PORT = process.env.PORT || 5000;

// Middlewares
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., mobile apps, curl)
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json({ limit: '50mb' })); // Body Parser
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Created uploads directory');
}

// Process-level crash handlers
process.on('uncaughtException', (err) => {
  console.error('[CRITICAL] Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('[CRITICAL] Unhandled Rejection at:', promise, 'reason:', reason);
});

// Logging Middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Static Files
app.use('/uploads', express.static(uploadsDir));

// Routes
app.use('/api/events', require('./routes/events'));
app.use('/api/register', require('./routes/register'));
app.use('/api/company', require('./routes/company'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/internships', require('./routes/internships'));

// Root route
app.get('/', (req, res) => res.send('🚀 Sprouts Backend API is running... Use /api/health for status.'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', environment: USE_CLOUD ? 'Cloud' : 'Local' }));

// 404 Handler for debugging
app.use((req, res) => {
  console.log(`[404 NOT FOUND] ${req.method} ${req.url}`);
  res.status(404).json({ error: `Route ${req.method} ${req.url} not found` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[GLOBAL ERROR]:', err);
  res.status(500).json({ 
    error: 'Something went wrong on the server', 
    message: err.message,
    stack: err.stack
  });
});

// Connect and start
const dbURI = USE_CLOUD ? CLOUD_DB : (process.env.MONGODB_LOCAL_URI || LOCAL_DB);

mongoose.connect(dbURI)
  .then(() => {
    console.log(`✅ Connected to MongoDB (${USE_CLOUD ? 'Cloud' : 'Local'})`);
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    // Start server anyway for development without DB
    app.listen(PORT, () => console.log(`⚠️ Server running on port ${PORT} (no DB)`));
  });

