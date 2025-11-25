const fs = require('fs');
const path = require('path');

class AuditLogger {
  constructor() {
    this.logDir = path.join(__dirname, '../logs');
    this.ensureLogDirectory();
  }

  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  getLogFilePath() {
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    return path.join(this.logDir, `audit-${date}.log`);
  }

  log(event) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      ...event
    };

    const logFile = this.getLogFilePath();
    
    // Write to file
    fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
    
    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔐 AUDIT: ${timestamp} - ${event.action} - ${event.userId || 'anonymous'}`);
    }
  }

  // Middleware function
  middleware() {
    return (req, res, next) => {
      const startTime = Date.now();
      
      // Log the request
      this.log({
        action: 'REQUEST',
        method: req.method,
        path: req.path,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: req.user?.id || 'anonymous'
      });

      // Override res.end to log response
      const originalEnd = res.end;
      res.end = function(chunk, encoding) {
        const duration = Date.now() - startTime;
        
        // Log response
        auditLogger.log({
          action: 'RESPONSE',
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          duration: `${duration}ms`,
          ip: req.ip,
          userId: req.user?.id || 'anonymous'
        });

        originalEnd.call(this, chunk, encoding);
      };

      next();
    };
  }

  // Security-specific logging
  securityLog(action, details) {
    this.log({
      action: `SECURITY_${action.toUpperCase()}`,
      ...details
    });
  }
}

const auditLogger = new AuditLogger();

// Export middleware and logger
module.exports = {
  auditLogger: auditLogger.middleware(),
  securityLog: auditLogger.securityLog.bind(auditLogger),
  AuditLogger
};
