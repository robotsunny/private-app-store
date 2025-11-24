
const jwt = require('jsonwebtoken');
const userStore = require('../utils/userStore');

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided, access denied'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-key');
    
    // Get user from token
    const user = userStore.getUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token is not valid'
      });
    }

    // Add user to request
    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    console.log(`🔐 Authenticated: ${user.email} (${user.role})`);
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({
      success: false,
      message: 'Token is not valid'
    });
  }
};

// Admin middleware - ONLY for admins
const adminAuth = async (req, res, next) => {
  try {
    // First authenticate
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-key');
    const user = userStore.getUserById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token is not valid'
      });
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    console.log(`👑 Admin access: ${user.email}`);
    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(401).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

module.exports = { auth, adminAuth };

