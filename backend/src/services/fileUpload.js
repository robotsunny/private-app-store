
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/apps';
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const safeFilename = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, uniqueSuffix + '-' + safeFilename);
  }
});

// File filter to only allow APK and IPA files
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.apk', '.ipa'];
  const fileExtension = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error('Only APK and IPA files are allowed'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB max file size
  }
});

// Utility functions
const fileService = {
  // Get file size in MB
  getFileSize: (filePath) => {
    const stats = fs.statSync(filePath);
    const fileSizeInBytes = stats.size;
    return (fileSizeInBytes / (1024 * 1024)).toFixed(2); // Convert to MB
  },

  // Delete file
  deleteFile: (filePath) => {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  },

  // Get file info
  getFileInfo: (filePath) => {
    if (!fs.existsSync(filePath)) {
      return null;
    }
    
    const stats = fs.statSync(filePath);
    return {
      size: (stats.size / (1024 * 1024)).toFixed(2) + ' MB',
      created: stats.birthtime,
      modified: stats.mtime
    };
  }
};

module.exports = { upload, fileService };
