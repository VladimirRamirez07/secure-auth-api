const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/database');
const { connectRedis } = require('./config/redis');

dotenv.config();

const app = express();

// ── Security Middlewares ──────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// ── Body Parsers ──────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ── Health Check ──────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Secure Auth API running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// ── Routes ────────────────────────────────────────────────────
// (las iremos agregando aquí)
const authRoutes = require('./routes/auth.routes');
app.use('/api/auth', authRoutes);

// ── 404 Handler ───────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`
  });
});

// ── Global Error Handler ──────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal server error'
  });
});

// ── Connect to services ───────────────────────────────────────
connectDB();
connectRedis();

// ── Start Server ──────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔒 Secure Auth API ready`);
});

module.exports = app;