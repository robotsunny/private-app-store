const express = require('express');
const app = express();

app.use(express.json());

// TEST ROUTE - Verify this works first
app.get('/api/test', (req, res) => {
  res.json({ message: 'TEST ROUTE WORKS!', timestamp: new Date().toISOString() });
});

// AUTH ROUTES
app.post('/api/auth/register', (req, res) => {
  console.log('Register endpoint hit!');
  res.json({ success: true, message: 'Register endpoint working!' });
});

app.post('/api/auth/login', (req, res) => {
  console.log('Login endpoint hit!');
  res.json({ success: true, message: 'Login endpoint working!' });
});


// APPS ROUTES
app.use('/api/apps', require('./routes/apps'));



// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API running' });
});

module.exports = app;
