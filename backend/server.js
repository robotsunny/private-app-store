const express = require('express');
const { setupSecurity } = require('./middleware/security');
const path = require('path');
require('dotenv').config();

const app = express();

// ========================
// SECURITY MIDDLEWARE STACK
// ========================

// 1. Core Security (Helmet, Rate Limiting, CORS)
setupSecurity(app);

// ========================
// APPLICATION MIDDLEWARE
// ========================

// Body parsing middleware (after security)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ========================
// HEALTH & SECURITY ENDPOINTS
// ========================

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    security: 'Enabled',
    environment: process.env.NODE_ENV || 'development',
    features: {
      securityHeaders: true,
      rateLimiting: true,
      cors: true,
      auditLogging: false, // Temporarily disabled
      inputSanitization: false, // Temporarily disabled
      apkValidation: false // Temporarily disabled
    }
  });
});

// Security test endpoint
app.get('/api/security-test', (req, res) => {
  res.json({
    message: 'Security test endpoint',
    security: 'Core security middleware is active',
    timestamp: new Date().toISOString(),
    middleware: [
      'Helmet.js Security Headers',
      'Rate Limiting', 
      'CORS Protection'
    ]
  });
});

// ========================
// AUTHENTICATION ENDPOINTS
// ========================

// Auth test endpoint
app.get('/api/auth/test', (req, res) => {
  res.json({
    message: 'Auth test endpoint',
    security: 'Rate limiting active on auth endpoints'
  });
});

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  res.json({
    message: 'Login endpoint - rate limiting active',
    note: 'Try this endpoint multiple times to test rate limiting'
  });
});

// Register endpoint
app.post('/api/auth/register', (req, res) => {
  res.json({
    message: 'Register endpoint - rate limiting active'
  });
});

// ========================
// APPS ENDPOINTS
// ========================

// Apps test endpoint
app.get('/api/apps/test', (req, res) => {
  res.json({
    message: 'Apps test endpoint',
    security: 'Security middleware active'
  });
});

// App upload endpoint
app.post('/api/apps/upload', (req, res) => {
  res.json({
    message: 'Upload endpoint - rate limiting active',
    note: 'APK validation will be implemented next'
  });
});

// Get app by ID
app.get('/api/apps/:id', (req, res) => {
  res.json({
    message: `App details for ID: ${req.params.id}`,
    appId: req.params.id,
    security: 'Input validation coming soon'
  });
});

// ========================
// USERS ENDPOINTS
// ========================

// Users test endpoint
app.get('/api/users/test', (req, res) => {
  res.json({
    message: 'Users test endpoint', 
    security: 'Security middleware active'
  });
});

// Get user by ID
app.get('/api/users/:id', (req, res) => {
  res.json({
    message: `User details for ID: ${req.params.id}`,
    userId: req.params.id
  });
});

// ========================
// ADMIN ENDPOINTS
// ========================

// Admin test endpoint
app.get('/api/admin/test', (req, res) => {
  res.json({
    message: 'Admin endpoint - enhanced security active',
    security: 'Strict rate limiting applied'
  });
});

// ========================
// ERROR HANDLING
// ========================

// Error handling for rate limits
app.use((err, req, res, next) => {
  if (err.status === 429) {
    return res.status(429).json({
      error: 'Rate limit exceeded',
      message: err.message,
      retryAfter: err.retryAfter
    });
  }
  next(err);
});

// 404 handler - SIMPLIFIED without wildcard
app.use((req, res, next) => {
  if (!req.route) {
    return res.status(404).json({
      error: 'Route not found',
      message: `The route ${req.method} ${req.originalUrl} does not exist.`,
      availableEndpoints: [
        'GET    /health',
        'GET    /api/security-test', 
        'GET    /api/auth/test',
        'POST   /api/auth/login',
        'POST   /api/auth/register',
        'GET    /api/apps/test',
        'POST   /api/apps/upload',
        'GET    /api/apps/:id',
        'GET    /api/users/test',
        'GET    /api/users/:id',
        'GET    /api/admin/test'
      ]
    });
  }
  next();
});

// ========================
// SERVER STARTUP
// ========================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
🚀 Private App Store Backend Started
====================================
📍 Port: ${PORT}
🔒 Security: ENABLED
🌐 Environment: ${process.env.NODE_ENV || 'development'}

🔐 ACTIVE SECURITY FEATURES:
   ✅ Helmet.js Security Headers
   ✅ Rate Limiting (Auth: 5/15min, API: 100/15min) 
   ✅ CORS Protection

🔄 COMING SOON:
   📝 Audit Logging
   🛡️ Input Sanitization & Validation
   🔍 APK File Validation

📋 AVAILABLE ENDPOINTS:
   Health & Security:
      GET  /health
      GET  /api/security-test

   Authentication (Rate Limited):
      GET  /api/auth/test
      POST /api/auth/login
      POST /api/auth/register

   Applications:
      GET  /api/apps/test
      POST /api/apps/upload
      GET  /api/apps/:id

   Users:
      GET  /api/users/test
      GET  /api/users/:id

   Admin:
      GET  /api/admin/test

⚡ QUICK TESTS:
   Health:    curl http://localhost:${PORT}/health
   Security:  curl http://localhost:${PORT}/api/security-test
   Rate Limit: curl -X POST http://localhost:${PORT}/api/auth/login
  `);
});

module.exports = app;
