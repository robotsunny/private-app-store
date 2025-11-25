

const fs = require('fs');
const path = require('path');

const simpleAuditLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('User-Agent') || 'unknown',
    statusCode: res.statusCode
  };

  // Log to console
  console.log(`🔐 [${timestamp}] ${req.method} ${req.path} - ${req.ip} - ${res.statusCode}`);
  
  // Log to file
  const logDir = path.join(__dirname, '../logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  
  const logFile = path.join(logDir, 'audit.log');
  fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
  
  next();
};

module.exports = simpleAuditLogger;
