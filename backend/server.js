require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 5000;

console.log('🚀 Starting Private App Store API...');
console.log('📁 Loading app configuration...');

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log('📋 Available endpoints:');
  console.log('   GET  /api/health');
  console.log('   GET  /api/test'); 
  console.log('   POST /api/auth/register');
  console.log('   POST /api/auth/login');
});
