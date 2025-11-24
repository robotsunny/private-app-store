
// App model for iOS/Android applications
class App {
  constructor(appData) {
    this.id = appData.id;
    this.name = appData.name;
    this.description = appData.description;
    this.version = appData.version;
    this.platform = appData.platform; // 'ios' or 'android'
    this.bundleId = appData.bundleId; // iOS Bundle ID or Android Package Name
    this.developerId = appData.developerId;
    this.downloadUrl = appData.downloadUrl;
    this.iconUrl = appData.iconUrl;
    this.fileSize = appData.fileSize;
    this.fileName = appData.fileName;
    this.originalFileName = appData.originalFileName;
    this.minOsVersion = appData.minOsVersion;
    this.isActive = appData.isActive !== false;
    this.createdAt = appData.createdAt || new Date();
    this.updatedAt = appData.updatedAt || new Date();
  }
}

// In-memory storage for apps
const apps = new Map();
let nextAppId = 1;

// Sample data - updated with file info
apps.set(1, new App({
  id: 1,
  name: 'Sample iOS App',
  description: 'A sample iOS application for demonstration',
  version: '1.0.0',
  platform: 'ios',
  bundleId: 'com.example.sampleapp',
  developerId: 1,
  downloadUrl: '/api/apps/1/download',
  iconUrl: '/icons/sample.png',
  fileSize: '2.5',
  fileName: 'sample.ipa',
  originalFileName: 'SampleApp.ipa',
  minOsVersion: '14.0',
  isActive: true
}));

apps.set(2, new App({
  id: 2,
  name: 'Sample Android App', 
  description: 'A sample Android application for demonstration',
  version: '1.0.0',
  platform: 'android',
  packageName: 'com.example.sampleapp',
  developerId: 1,
  downloadUrl: '/api/apps/2/download',
  iconUrl: '/icons/sample.png', 
  fileSize: '3.2',
  fileName: 'sample.apk',
  originalFileName: 'SampleApp.apk',
  minOsVersion: '8.0',
  isActive: true
}));

module.exports = { App, apps, nextAppId };
