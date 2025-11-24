
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userStore = require('./utils/userStore');
const path = require('path');
const app = express();

console.log('🔧 app.js loaded successfully!');

// Fix CORS - allow frontend to connect
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Register route
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log('Register:', email);

    const existingUser = userStore.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = userStore.createUser({
      name,
      email,
      password: hashedPassword,
      role: 'user'
    });

    const token = jwt.sign(
      { userId: user.id },
      'dev-secret-key',
      { expiresIn: '30d' }
    );

    console.log('User registered successfully:', user.email);
    
    res.json({
      success: true,
      message: 'Registered successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Login route
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt:', email);

    const user = userStore.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = jwt.sign(
      { userId: user.id },
      'dev-secret-key',
      { expiresIn: '30d' }
    );

    console.log('Login successful:', user.email);
    
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// API routes
app.use('/api/apps', require('./routes/apps'));
app.use('/api/uploads', require('./routes/uploads'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API running' });
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'TEST ROUTE WORKS!' });
});

module.exports = app;
