const basicValidation = {
  // Email validation
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Password strength validation
  isValidPassword: (password) => {
    return password && password.length >= 8;
  },

  // Name validation
  isValidName: (name) => {
    return name && name.trim().length >= 2 && name.trim().length <= 50;
  },

  // Version validation (semver format)
  isValidVersion: (version) => {
    const versionRegex = /^\d+\.\d+\.\d+$/;
    return versionRegex.test(version);
  },

  // ID validation (positive integer)
  isValidId: (id) => {
    return /^\d+$/.test(id) && parseInt(id) > 0;
  },

  // Basic XSS prevention
  sanitizeString: (input) => {
    if (typeof input !== 'string') return input;
    return input
      .trim()
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/'/g, '&#x27;')
      .replace(/"/g, '&quot;')
      .slice(0, 500); // Limit length
  },

  // Middleware for login validation
  validateLogin: (req, res, next) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Email and password are required'
      });
    }

    if (!basicValidation.isValidEmail(email)) {
      return res.status(400).json({
        error: 'Invalid email',
        message: 'Please provide a valid email address'
      });
    }

    if (!basicValidation.isValidPassword(password)) {
      return res.status(400).json({
        error: 'Invalid password',
        message: 'Password must be at least 8 characters long'
      });
    }

    // Sanitize inputs
    req.body.email = basicValidation.sanitizeString(email);
    next();
  },

  // Middleware for registration validation
  validateRegister: (req, res, next) => {
    const { email, password, name } = req.body;
    
    const errors = [];

    if (!email || !basicValidation.isValidEmail(email)) {
      errors.push({ field: 'email', message: 'Valid email is required' });
    }

    if (!password || !basicValidation.isValidPassword(password)) {
      errors.push({ field: 'password', message: 'Password must be at least 8 characters' });
    }

    if (!name || !basicValidation.isValidName(name)) {
      errors.push({ field: 'name', message: 'Name must be between 2-50 characters' });
    }

    if (errors.length > 0) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Please check your input',
        details: errors
      });
    }

    // Sanitize inputs
    req.body.email = basicValidation.sanitizeString(email);
    req.body.name = basicValidation.sanitizeString(name);
    next();
  },

  // Middleware for app upload validation
  validateAppUpload: (req, res, next) => {
    const { name, version, description } = req.body;
    
    const errors = [];

    if (!name || !basicValidation.isValidName(name)) {
      errors.push({ field: 'name', message: 'App name must be between 2-100 characters' });
    }

    if (!version || !basicValidation.isValidVersion(version)) {
      errors.push({ field: 'version', message: 'Version must be in format: 1.0.0' });
    }

    if (description && description.length > 500) {
      errors.push({ field: 'description', message: 'Description must be less than 500 characters' });
    }

    if (errors.length > 0) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Please check your app information',
        details: errors
      });
    }

    // Sanitize inputs
    req.body.name = basicValidation.sanitizeString(name);
    req.body.version = basicValidation.sanitizeString(version);
    req.body.description = description ? basicValidation.sanitizeString(description) : '';
    next();
  },

  // Middleware for ID parameter validation
  validateIdParam: (req, res, next) => {
    const { id } = req.params;
    
    if (!basicValidation.isValidId(id)) {
      return res.status(400).json({
        error: 'Invalid ID',
        message: 'ID must be a positive number'
      });
    }

    req.params.id = parseInt(id);
    next();
  }
};

module.exports = basicValidation;
