const { body, validationResult, param } = require('express-validator');
const xss = require('xss');

// XSS sanitization
const sanitizeInput = (req, res, next) => {
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = xss(req.body[key]);
      }
    });
  }
  
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = xss(req.query[key]);
      }
    });
  }
  
  next();
};

// Common validation rules
const validationRules = {
  // Authentication validations
  login: [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 })
  ],
  
  register: [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
    body('name').isLength({ min: 2, max: 50 }).trim().escape()
  ],
  
  appUpload: [
    body('name').isLength({ min: 2, max: 100 }).trim().escape(),
    body('version').matches(/^\d+\.\d+\.\d+$/), // semver format
    body('description').optional().isLength({ max: 500 }).trim().escape()
  ],
  
  idParam: [
    param('id').isInt({ min: 1 })
  ]
};

// Validation middleware
const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value
    }));

    res.status(400).json({
      error: 'Validation failed',
      message: 'Please check your input data',
      details: errorMessages
    });
  };
};

module.exports = {
  sanitizeInput,
  validationRules,
  validate
};
