#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Ensuring Prisma Client is properly generated...');

const libPath = path.join(__dirname, '..', 'lib');
const generatedPath = path.join(libPath, 'generated');
const prismaClientPath = path.join(generatedPath, 'prisma');

// Ensure directories exist
if (!fs.existsSync(libPath)) {
  console.log('📁 Creating lib directory...');
  fs.mkdirSync(libPath, { recursive: true });
}

if (!fs.existsSync(generatedPath)) {
  console.log('📁 Creating lib/generated directory...');
  fs.mkdirSync(generatedPath, { recursive: true });
}

// Check if Prisma Client exists
if (!fs.existsSync(prismaClientPath)) {
  console.log('❌ Prisma Client not found, generating...');
  try {
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('✅ Prisma Client generated successfully');
  } catch (error) {
    console.error('❌ Failed to generate Prisma Client:', error.message);
    // Don't exit with error in production builds
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  }
} else {
  console.log('✅ Prisma Client already exists');
}

// Verify the generated client
try {
  const indexPath = path.join(prismaClientPath, 'index.js');
  if (fs.existsSync(indexPath)) {
    console.log('✅ Prisma Client index file verified');
  } else {
    console.log('⚠️ Prisma Client index file missing, regenerating...');
    execSync('npx prisma generate', { stdio: 'inherit' });
  }
} catch (error) {
  console.error('❌ Error verifying Prisma Client:', error.message);
  // Don't exit with error in production builds
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
}

console.log('🎉 Prisma Client setup completed successfully'); 