
const express = require('express');
const { upload, fileService } = require('../services/fileUpload');
const { apps, nextAppId } = require('../models/App');
const { auth } = require('../middleware/auth');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Upload app file - PROTECTED ROUTE
router.post('/upload', auth, upload.single('appFile'), (req, res) => {
  try {
    console.log('Upload request received from user:', req.user.userId);
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { name, description, version, platform, bundleId, minOsVersion } = req.body;
    
    if (!name || !platform || !bundleId) {
      // Delete uploaded file if validation fails
      fileService.deleteFile(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Name, platform, and bundle ID are required'
      });
    }

    if (!['ios', 'android'].includes(platform)) {
      fileService.deleteFile(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Platform must be "ios" or "android"'
      });
    }

    // Validate file extension matches platform
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    if ((platform === 'ios' && fileExtension !== '.ipa') || 
        (platform === 'android' && fileExtension !== '.apk')) {
      fileService.deleteFile(req.file.path);
      return res.status(400).json({
        success: false,
        message: `File extension doesn't match platform. ${platform.toUpperCase()} requires ${platform === 'ios' ? '.ipa' : '.apk'} files`
      });
    }

    // Create new app with file info
    const newApp = {
      id: nextAppId++,
      name,
      description: description || '',
      version: version || '1.0.0',
      platform,
      bundleId,
      developerId: req.user.userId,
      downloadUrl: `/api/uploads/download/${nextAppId}`,
      iconUrl: '',
      fileSize: fileService.getFileSize(req.file.path),
      fileName: req.file.filename,
      originalFileName: req.file.originalname,
      minOsVersion: minOsVersion || (platform === 'ios' ? '14.0' : '8.0'),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    apps.set(newApp.id, newApp);

    console.log(`✅ App uploaded by user ${req.user.userId}: ${newApp.name} (${newApp.fileSize} MB)`);

    res.status(201).json({
      success: true,
      message: 'App uploaded successfully',
      data: newApp
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    // Clean up file if error occurs
    if (req.file) {
      fileService.deleteFile(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      message: 'Error uploading file'
    });
  }
});

// Download app file - PUBLIC ROUTE (no auth required for download)
router.get('/download/:appId', (req, res) => {
  try {
    const appId = parseInt(req.params.appId);
    const app = apps.get(appId);
    
    if (!app || !app.isActive) {
      return res.status(404).json({
        success: false,
        message: 'App not found'
      });
    }

    const filePath = path.join('uploads/apps', app.fileName);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    console.log(`📥 Download: ${app.name}`);

    // Set headers for file download
    res.setHeader('Content-Disposition', `attachment; filename="${app.originalFileName}"`);
    res.setHeader('Content-Type', 'application/octet-stream');

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({
      success: false,
      message: 'Error downloading file'
    });
  }
});

// Get upload statistics - PROTECTED ROUTE
router.get('/stats', auth, (req, res) => {
  try {
    const userApps = Array.from(apps.values()).filter(app => app.developerId === req.user.userId);
    
    const stats = {
      totalApps: userApps.length,
      totalSize: userApps.reduce((sum, app) => sum + parseFloat(app.fileSize || 0), 0).toFixed(2),
      iosApps: userApps.filter(app => app.platform === 'ios').length,
      androidApps: userApps.filter(app => app.platform === 'android').length
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching upload statistics'
    });
  }
});

module.exports = router;

