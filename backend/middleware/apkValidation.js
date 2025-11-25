const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

const apkValidation = {
  // Validate APK file structure and integrity
  validateAPKFile: (req, res, next) => {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please select an APK file to upload'
      });
    }

    const { originalname, path: filePath, size } = req.file;

    try {
      // 1. Check file extension
      if (!originalname.toLowerCase().endsWith('.apk')) {
        fs.unlinkSync(filePath); // Clean up invalid file
        return res.status(400).json({
          error: 'Invalid file type',
          message: 'Only APK files are allowed',
          received: originalname
        });
      }

      // 2. Check file size (1MB - 100MB range)
      if (size < 1024 * 1024) { // 1MB minimum
        fs.unlinkSync(filePath);
        return res.status(400).json({
          error: 'File too small',
          message: 'APK file must be at least 1MB',
          currentSize: `${(size / 1024 / 1024).toFixed(2)} MB`
        });
      }

      if (size > 100 * 1024 * 1024) { // 100MB maximum
        fs.unlinkSync(filePath);
        return res.status(400).json({
          error: 'File too large',
          message: 'APK file must be less than 100MB',
          currentSize: `${(size / 1024 / 1024).toFixed(2)} MB`
        });
      }

      const fileBuffer = fs.readFileSync(filePath);

      // 3. Check APK signature (should start with PK header for ZIP)
      const fileHeader = fileBuffer.slice(0, 2).toString('hex');
      if (fileHeader !== '504b') { // PK in hex
        fs.unlinkSync(filePath);
        return res.status(400).json({
          error: 'Invalid APK format',
          message: 'File does not appear to be a valid APK (missing ZIP signature)',
          technical: 'APK files should start with PK header (ZIP format)'
        });
      }

      // 4. Generate SHA-256 checksum
      const checksum = crypto.createHash('sha256').update(fileBuffer).digest('hex');

      // 5. Basic malware scan simulation
      const scanResult = apkValidation.simulateMalwareScan(fileBuffer, originalname);

      if (!scanResult.clean) {
        fs.unlinkSync(filePath);
        return res.status(400).json({
          error: 'Security scan failed',
          message: 'File did not pass security checks',
          threats: scanResult.threats,
          action: 'File has been deleted for security reasons'
        });
      }

      // Add validation results to request
      req.fileValidation = {
        originalName: originalname,
        size: size,
        checksum: checksum,
        scanResult: scanResult,
        validatedAt: new Date().toISOString(),
        security: {
          fileType: 'valid',
          size: 'acceptable',
          signature: 'valid',
          malwareScan: 'clean'
        }
      };

      console.log(`🔍 APK Validation PASSED: ${originalname}, Size: ${(size / 1024 / 1024).toFixed(2)}MB, Checksum: ${checksum.substring(0, 16)}...`);

      next();
    } catch (error) {
      // Clean up on any error
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return res.status(500).json({
        error: 'APK validation failed',
        message: 'Could not process the uploaded file',
        technical: error.message
      });
    }
  },

  // Simulate malware scanning (in production, integrate with ClamAV, VirusTotal, etc.)
  simulateMalwareScan: (fileBuffer, filename) => {
    // Simulate scanning process
    const suspiciousPatterns = [
      'test-malware.apk',
      'suspicious-app.apk',
      'virus-sample.apk'
    ];

    const isSuspicious = suspiciousPatterns.some(pattern => 
      filename.toLowerCase().includes(pattern)
    );

    if (isSuspicious) {
      return {
        clean: false,
        threats: ['Simulated threat detected - suspicious filename pattern'],
        scanner: 'basic_validator',
        confidence: 'high'
      };
    }

    // Check file size for anomalies (very small APKs might be suspicious)
    if (fileBuffer.length < 2 * 1024 * 1024) { // Under 2MB
      return {
        clean: true,
        threats: [],
        scanner: 'basic_validator',
        confidence: 'medium',
        warning: 'APK file is unusually small'
      };
    }

    return {
      clean: true,
      threats: [],
      scanner: 'basic_validator',
      confidence: 'high'
    };
  },

  // Get APK info for display
  getAPKInfo: (filePath) => {
    try {
      const stats = fs.statSync(filePath);
      const fileBuffer = fs.readFileSync(filePath);
      const checksum = crypto.createHash('sha256').update(fileBuffer).digest('hex');

      return {
        size: stats.size,
        checksum: checksum,
        created: stats.birthtime,
        modified: stats.mtime
      };
    } catch (error) {
      return { error: 'Could not read file info' };
    }
  }
};

module.exports = apkValidation;
