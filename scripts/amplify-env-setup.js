const fs = require('fs');

console.log('🔧 Setting up environment for Amplify...');

// Force set environment variables from Amplify
const envContent = `
DATABASE_URL="${process.env.DATABASE_URL || ''}"
NEXTAUTH_SECRET="${process.env.NEXTAUTH_SECRET || ''}"
NEXTAUTH_URL="${process.env.NEXTAUTH_URL || ''}"
NODE_ENV="production"
`;

// Write to multiple locations
fs.writeFileSync('.env', envContent.trim());
fs.writeFileSync('.env.production', envContent.trim());
fs.writeFileSync('.env.local', envContent.trim());

console.log('✅ Environment files created');
console.log('📋 DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
console.log('📋 Current directory:', process.cwd());
console.log('📋 Files:', fs.readdirSync('.').filter(f => f.startsWith('.env'))); 