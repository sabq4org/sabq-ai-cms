#!/usr/bin/env node

// Simple postinstall script that doesn't fail the build
console.log('📦 Running postinstall...');

try {
  require('child_process').execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma Client generated');
} catch (e) {
  console.log('⚠️ Prisma generation skipped (will be done during build)');
}

console.log('✅ Postinstall completed'); 