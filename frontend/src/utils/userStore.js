
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_FILE = path.join(__dirname, '..', 'data', 'users.json');

// Ensure data directory exists
const dataDir = path.dirname(DATA_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Load users from file
let users = [];
let nextUserId = 1;

try {
  if (fs.existsSync(DATA_FILE)) {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    users = JSON.parse(data);
    nextUserId = Math.max(...users.map(u => u.id), 0) + 1;
    console.log(`📁 Loaded ${users.length} users from file`);
  }
} catch (error) {
  console.error('Error loading users:', error);
}

// Add demo admin user if not exists
const adminUser = users.find(u => u.email === 'admin@example.com');
if (!adminUser) {
  const adminPassword = bcrypt.hashSync('admin123', 12);
  users.push({
    id: nextUserId++,
    name: 'Admin User',
    email: 'admin@example.com',
    password: adminPassword,
    role: 'admin',
    createdAt: new Date().toISOString()
  });
  console.log('👑 Admin user created: admin@example.com / admin123');
}

// Add demo regular user if not exists
const demoUser = users.find(u => u.email === 'demo@example.com');
if (!demoUser) {
  const demoPassword = bcrypt.hashSync('demo123', 12);
  users.push({
    id: nextUserId++,
    name: 'Demo User',
    email: 'demo@example.com',
    password: demoPassword,
    role: 'user',
    createdAt: new Date().toISOString()
  });
  console.log('👤 Demo user created: demo@example.com / demo123');
}

// Save users to file
function saveUsers() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error saving users:', error);
  }
}

// User store methods
const userStore = {
  createUser: (userData) => {
    const user = {
      id: nextUserId++,
      ...userData,
      role: 'user', // Default role for new registrations
      createdAt: new Date().toISOString()
    };
    users.push(user);
    saveUsers();
    return user;
  },

  getUserByEmail: (email) => {
    return users.find(u => u.email === email);
  },

  getUserById: (id) => {
    return users.find(u => u.id === id);
  },

  getAllUsers: () => {
    return [...users];
  },

  // Admin methods
  isAdmin: (userId) => {
    const user = users.find(u => u.id === userId);
    return user && user.role === 'admin';
  },

  promoteToAdmin: (userId) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      user.role = 'admin';
      user.updatedAt = new Date().toISOString();
      saveUsers();
      return true;
    }
    return false;
  }
};

module.exports = userStore;

