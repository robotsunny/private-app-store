const express = require('express');
const { setupSecurity } = require('./middleware/security');
const simpleAuditLogger = require('./middleware/simpleAuditLogger');
const path = require('path');
require('dotenv').config();

const app = express();

// ========================
// SECURITY MIDDLEWARE STACK
// ========================

// 1. Core Security (Helmet, Rate Limiting, CORS)
setupSecurity(app);

// 2. Audit Logging - Track all requests
app.use(simpleAuditLogger);

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
      auditLogging: true, // Updated to true
      inputSanitization: false,
      apkValidation: false
    },
    audit: {
      enabled: true,
      location: './logs/audit.log',
      tracking: 'All requests logged'
    }
  });
});

// Security test endpoint
app.get('/api/security-test', (req, res) => {
  res.json({
    message: 'Security test endpoint',
    security: 'All security middleware is active',
    timestamp: new Date().toISOString(),
    middleware: [
      'Helmet.js Security Headers',
      'Rate Limiting',
      'CORS Protection',
      'Audit Logging' // Added audit logging
    ],
    auditNote: 'This request has been logged to the audit system'
  });
});

// Audit logs status endpoint
app.get('/api/audit/status', (req, res) => {
  const fs = require('fs');
  const logDir = path.join(__dirname, 'logs');
  const logFile = path.join(logDir, 'audit.log');
  
  let logStats = {};
  try {
    if (fs.existsSync(logFile)) {
      const stats = fs.statSync(logFile);
      const logContent = fs.readFileSync(logFile, 'utf8');
      const logLines = logContent.trim().split('\n');
      
      logStats = {
        fileExists: true,
        size: `${(stats.size / 1024).toFixed(2)} KB`,
        entries: logLines.length,
        lastModified: stats.mtime
      };
    } else {
      logStats = {
        fileExists: false,
        message: 'No audit logs yet. Make some requests first.'
      };
    }
  } catch (error) {
    logStats = {
      error: 'Could not read audit logs',
      message: error.message
    };
  }
  
  res.json({
    message: 'Audit logging system status',
    enabled: true,
    logFile: './logs/audit.log',
    stats: logStats
  });
});

// ========================
// AUTHENTICATION ENDPOINTS
// ========================

// Auth test endpoint
app.get('/api/auth/test', (req, res) => {
  res.json({
    message: 'Auth test endpoint',
    security: 'Rate limiting active on auth endpoints',
    audit: 'This authentication attempt has been logged'
  });
});

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  res.json({
    message: 'Login endpoint - rate limiting active',
    note: 'Try this endpoint multiple times to test rate limiting',
    security: {
      rateLimiting: '5 attempts per 15 minutes',
      audit: 'All login attempts are logged'
    }
  });
});

// Register endpoint
app.post('/api/auth/register', (req, res) => {
  res.json({
    message: 'Register endpoint - rate limiting active',
    security: {
      rateLimiting: '5 attempts per 15 minutes',
      audit: 'Registration attempts are logged'
    }
  });
});

// ========================
// APPS ENDPOINTS
// ========================

// Apps test endpoint
app.get('/api/apps/test', (req, res) => {
  res.json({
    message: 'Apps test endpoint',
    security: 'Security middleware active',
    audit: 'App access logged'
  });
});

// App upload endpoint
app.post('/api/apps/upload', (req, res) => {
  res.json({
    message: 'Upload endpoint - rate limiting active',
    note: 'APK validation will be implemented next',
    security: {
      rateLimiting: '5 uploads per hour',
      audit: 'File upload attempts are logged'
    }
  });
});

// Get app by ID
app.get('/api/apps/:id', (req, res) => {
  res.json({
    message: `App details for ID: ${req.params.id}`,
    appId: req.params.id,
    security: 'Input validation coming soon',
    audit: `App access logged for ID: ${req.params.id}`
  });
});

// ========================
// USERS ENDPOINTS
// ========================

// Users test endpoint
app.get('/api/users/test', (req, res) => {
  res.json({
    message: 'Users test endpoint',
    security: 'Security middleware active',
    audit: 'User access logged'
  });
});

// Get user by ID
app.get('/api/users/:id', (req, res) => {
  res.json({
    message: `User details for ID: ${req.params.id}`,
    userId: req.params.id,
    audit: `User access logged for ID: ${req.params.id}`
  });
});

// ========================
// ADMIN ENDPOINTS
// ========================

// Admin test endpoint
app.get('/api/admin/test', (req, res) => {
  res.json({
    message: 'Admin endpoint - enhanced security active',
    security: 'Strict rate limiting applied',
    audit: 'Admin access logged'
  });
});

// Admin audit logs viewer (basic version)
app.get('/api/admin/audit-logs', (req, res) => {
  const fs = require('fs');
  const logFile = path.join(__dirname, 'logs', 'audit.log');
  
  try {
    if (fs.existsSync(logFile)) {
      const logContent = fs.readFileSync(logFile, 'utf8');
      const logEntries = logContent.trim().split('\n').map(line => {
        try {
          return JSON.parse(line);
        } catch {
          return { raw: line };
        }
      });
      
      res.json({
        message: 'Audit logs retrieved',
        count: logEntries.length,
        logs: logEntries.reverse().slice(0, 50) // Last 50 entries
      });
    } else {
      res.status(404).json({
        error: 'No audit logs found',
        message: 'Make some requests first to generate audit logs'
      });
    }
  } catch (error) {
    res.status(500).json({
      error: 'Failed to read audit logs',
      message: error.message
    });
  }
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
      retryAfter: err.retryAfter,
      audit: 'Rate limit violation logged'
    });
  }
  next(err);
});

// Validation error handler
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: 'Invalid JSON',
      message: 'The request contains invalid JSON format',
      audit: 'Invalid JSON request logged'
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
        'GET    /api/audit/status',
        'GET    /api/auth/test',
        'POST   /api/auth/login',
        'POST   /api/auth/register',
        'GET    /api/apps/test',
        'POST   /api/apps/upload',
        'GET    /api/apps/:id',
        'GET    /api/users/test',
        'GET    /api/users/:id',
        'GET    /api/admin/test',
        'GET    /api/admin/audit-logs'
      ],
      audit: '404 route not found logged'
    });
  }
  next();
});

// ========================
// SERVER STARTUP
// ========================

const PORT = process.env.PORT || 5000;

// Ensure logs directory exists on startup
const fs = require('fs');
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
  console.log('📁 Created logs directory');
}

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
   ✅ Audit Logging

🔄 COMING SOON:
   🛡️ Input Sanitization & Validation
   🔍 APK File Validation

📋 AVAILABLE ENDPOINTS:
   Health & Security:
      GET  /health
      GET  /api/security-test
      GET  /api/audit/status

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
      GET  /api/admin/audit-logs

📊 AUDIT SYSTEM:
   Location: ./logs/audit.log
   Status: Active - All requests are logged
   View: GET /api/admin/audit-logs

⚡ QUICK TESTS:
   Health:    curl http://localhost:${PORT}/health
   Security:  curl http://localhost:${PORT}/api/security-test
   Audit:     curl http://localhost:${PORT}/api/audit/status
   Rate Limit: curl -X POST http://localhost:${PORT}/api/auth/login
  `);
});

module.exports = app;
