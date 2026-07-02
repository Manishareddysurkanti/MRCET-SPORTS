const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { checkConnection } = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const teamRoutes = require('./routes/teamRoutes');
const tournamentRoutes = require('./routes/tournamentRoutes');
const matchRoutes = require('./routes/matchRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware (for development)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'College Sports Management API is running.' });
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/notifications', notificationRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack);
  res.status(500).json({
    message: 'Something went wrong on the server',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

const PORT = process.env.PORT || 5000;

// Start Server
const startServer = async () => {
  // Check MySQL connection before starting server
  const dbConnected = await checkConnection();
  
  if (!dbConnected) {
    console.warn('⚠️ Server is starting, but database connection is currently unavailable.');
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
};

startServer();
