const express = require('express');
const { setupSecurity } = require('./middleware/security');
const path = require('path');
require('dotenv').config();

const app = express();

// Security setup - THIS MUST COME FIRST
setupSecurity(app);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    security: 'Enabled',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Security test endpoint
app.get('/api/security-test', (req, res) => {
  res.json({
    message: 'Security test endpoint',
    security: 'All security middleware is active',
    timestamp: new Date().toISOString()
  });
});

// Specific endpoints for testing
app.get('/api/auth/test', (req, res) => {
  res.json({
    message: 'Auth test endpoint',
    security: 'Rate limiting active on auth endpoints'
  });
});

app.post('/api/auth/login', (req, res) => {
  res.json({
    message: 'Login endpoint - rate limiting active',
    note: 'Try this endpoint multiple times to test rate limiting'
  });
});

app.post('/api/auth/register', (req, res) => {
  res.json({
    message: 'Register endpoint - rate limiting active'
  });
});

app.get('/api/apps/test', (req, res) => {
  res.json({
    message: 'Apps test endpoint',
    security: 'Security middleware active'
  });
});

app.post('/api/apps/upload', (req, res) => {
  res.json({
    message: 'Upload endpoint - rate limiting active'
  });
});

app.get('/api/users/test', (req, res) => {
  res.json({
    message: 'Users test endpoint',
    security: 'Security middleware active'
  });
});

// Catch-all handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `The route ${req.originalUrl} does not exist.`,
    availableEndpoints: [
      'GET  /health',
      'GET  /api/security-test',
      'GET  /api/auth/test',
      'POST /api/auth/login',
      'POST /api/auth/register',
      'GET  /api/apps/test',
      'POST /api/apps/upload',
      'GET  /api/users/test'
    ]
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔒 Security middleware enabled`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✅ Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Security test: http://localhost:${PORT}/api/security-test`);
  console.log(`⚡ Test rate limiting: http://localhost:${PORT}/api/auth/login`);
  console.log('');
  console.log(`📋 Available endpoints:`);
  console.log(`   GET  http://localhost:${PORT}/health`);
  console.log(`   GET  http://localhost:${PORT}/api/security-test`);
  console.log(`   GET  http://localhost:${PORT}/api/auth/test`);
  console.log(`   POST http://localhost:${PORT}/api/auth/login`);
  console.log(`   POST http://localhost:${PORT}/api/auth/register`);
  console.log(`   GET  http://localhost:${PORT}/api/apps/test`);
  console.log(`   POST http://localhost:${PORT}/api/apps/upload`);
  console.log(`   GET  http://localhost:${PORT}/api/users/test`);
});

module.exports = app;
