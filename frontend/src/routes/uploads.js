
const express = require('express');
const { upload, fileService } = require('../services/fileUpload');
const { apps, nextAppId } = require('../models/App');
const { adminAuth } = require('../middleware/auth'); // Changed to adminAuth
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Upload app file - ADMIN ONLY
router.post('/upload', adminAuth, upload.single('appFile'), (req, res) => {
  try {
    console.log('📤 Upload request from admin:', req.user.email);
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { name, description, version, platform, bundleId, minOsVersion } = req.body;
    
    if (!name || !platform || !bundleId) {
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

    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    if ((platform === 'ios' && fileExtension !== '.ipa') || 
        (platform === 'android' && fileExtension !== '.apk')) {
      fileService.deleteFile(req.file.path);
      return res.status(400).json({
        success: false,
        message: `File extension doesn't match platform. ${platform.toUpperCase()} requires ${platform === 'ios' ? '.ipa' : '.apk'} files`
      });
    }

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

    console.log(`✅ App uploaded by admin ${req.user.email}: ${newApp.name}`);

    res.status(201).json({
      success: true,
      message: 'App uploaded successfully',
      data: newApp
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    if (req.file) {
      fileService.deleteFile(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      message: 'Error uploading file'
    });
  }
});

// Download app file - AVAILABLE TO ALL USERS
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

    res.setHeader('Content-Disposition', `attachment; filename="${app.originalFileName}"`);
    res.setHeader('Content-Type', 'application/octet-stream');

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

// Get upload statistics - ADMIN ONLY
router.get('/stats', adminAuth, (req, res) => {
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

