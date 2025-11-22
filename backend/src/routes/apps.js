const express = require('express');
const router = express.Router();

// Sample apps data
const apps = [
  {
    id: 1,
    name: 'Sample iOS App',
    platform: 'ios',
    version: '1.0.0',
    bundleId: 'com.example.app'
  },
  {
    id: 2, 
    name: 'Sample Android App',
    platform: 'android', 
    version: '1.0.0',
    packageName: 'com.example.app'
  }
];

// Get all apps
router.get('/', (req, res) => {
  res.json({ success: true, data: apps });
});

// Get app by ID
router.get('/:id', (req, res) => {
  const app = apps.find(a => a.id === parseInt(req.params.id));
  if (!app) {
    return res.status(404).json({ success: false, message: 'App not found' });
  }
  res.json({ success: true, data: app });
});

module.exports = router;
