


const jwt = require('jsonwebtoken');
const userStore = require('../utils/userStore');

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    console.log('🔐 Auth Middleware:');
    console.log(' - Path:', req.path);
    console.log(' - Method:', req.method);
    console.log(' - Authorization header exists:', !!req.header('Authorization'));
    console.log(' - Token exists:', !!token);

    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({
        success: false,
        message: 'No token provided, access denied'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-key');
    console.log(' - Token decoded user ID:', decoded.userId);
    
    // Get user from token
    const user = userStore.getUserById(decoded.userId);
    console.log(' - User found:', !!user);
    console.log(' - User role:', user?.role);
    
    if (!user) {
      console.log('❌ User not found for token');
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

    console.log(`✅ Authenticated: ${user.email} (${user.role})`);
    next();
  } catch (error) {
    console.error('❌ Auth middleware error:', error.message);
    res.status(401).json({
      success: false,
      message: 'Token is not valid'
    });
  }
};

// Admin middleware
const adminAuth = async (req, res, next) => {
  try {
    console.log('👑 Admin Auth Middleware:');
    
    // First authenticate
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    console.log(' - Token exists:', !!token);
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-key');
    const user = userStore.getUserById(decoded.userId);
    
    console.log(' - User found:', !!user);
    console.log(' - User role:', user?.role);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token is not valid'
      });
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      console.log('❌ User is not admin:', user.email);
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

    console.log(`✅ Admin access granted: ${user.email}`);
    next();
  } catch (error) {
    console.error('❌ Admin auth error:', error.message);
    res.status(401).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

module.exports = { auth, adminAuth };

