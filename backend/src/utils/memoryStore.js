// In-memory data store for development without MongoDB
class MemoryStore {
  constructor() {
    this.users = new Map();
    this.apps = new Map();
    this.downloads = new Map();
    this.sessions = new Map();
    this.nextIds = {
      users: 1,
      apps: 1,
      downloads: 1
    };
  }

  // User methods
  createUser(userData) {
    const id = this.nextIds.users++;
    const user = {
      id,
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  getUserById(id) {
    return this.users.get(Number(id));
  }

  getUserByEmail(email) {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  updateUser(id, updates) {
    const user = this.users.get(Number(id));
    if (user) {
      Object.assign(user, updates, { updatedAt: new Date() });
      return user;
    }
    return null;
  }

  // App methods
  createApp(appData) {
    const id = this.nextIds.apps++;
    const app = {
      id,
      ...appData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.apps.set(id, app);
    return app;
  }

  getAppById(id) {
    return this.apps.get(Number(id));
  }

  getAllApps() {
    return Array.from(this.apps.values());
  }

  getAppsByDeveloper(developerId) {
    return Array.from(this.apps.values()).filter(app => app.developerId === developerId);
  }

  updateApp(id, updates) {
    const app = this.apps.get(Number(id));
    if (app) {
      Object.assign(app, updates, { updatedAt: new Date() });
      return app;
    }
    return null;
  }

  deleteApp(id) {
    return this.apps.delete(Number(id));
  }

  // Download methods
  createDownload(downloadData) {
    const id = this.nextIds.downloads++;
    const download = {
      id,
      ...downloadData,
      downloadedAt: new Date()
    };
    this.downloads.set(id, download);
    return download;
  }

  getDownloadsByUser(userId) {
    return Array.from(this.downloads.values()).filter(download => download.userId === userId);
  }

  getDownloadsByApp(appId) {
    return Array.from(this.downloads.values()).filter(download => download.appId === appId);
  }

  // Session methods (for JWT blacklisting, etc.)
  setSession(key, value) {
    this.sessions.set(key, value);
  }

  getSession(key) {
    return this.sessions.get(key);
  }

  deleteSession(key) {
    return this.sessions.delete(key);
  }
}

// Create singleton instance
const memoryStore = new MemoryStore();

// Add some sample data for development
memoryStore.createUser({
  name: 'Admin User',
  email: 'admin@example.com',
  password: '$2a$12$LQv3c1yqBWVHxkd0L6kZrO', // password: admin123
  role: 'admin'
});

memoryStore.createUser({
  name: 'Test Developer',
  email: 'developer@example.com', 
  password: '$2a$12$LQv3c1yqBWVHxkd0L6kZrO', // password: admin123
  role: 'developer'
});

memoryStore.createApp({
  name: 'Sample iOS App',
  description: 'A sample iOS application for testing',
  version: '1.0.0',
  platform: 'ios',
  bundleId: 'com.example.sampleapp',
  developerId: 2,
  downloadUrl: '/downloads/sample.ipa',
  iconUrl: '/icons/sample.png',
  fileSize: 1024000,
  isActive: true
});

memoryStore.createApp({
  name: 'Sample Android App',
  description: 'A sample Android application for testing',
  version: '1.0.0',
  platform: 'android',
  packageName: 'com.example.sampleapp',
  developerId: 2,
  downloadUrl: '/downloads/sample.apk',
  iconUrl: '/icons/sample.png',
  fileSize: 2048000,
  isActive: true
});

module.exports = memoryStore;
