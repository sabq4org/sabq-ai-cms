#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🔧 Ensuring Prisma client generation...');

try {
  // Set a placeholder DATABASE_URL for Vercel build if it's not present
  if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
    console.warn('⚠️  DATABASE_URL not found, using a placeholder for generation.');
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db?schema=public';
  }

  console.log('🏗️  Running `npx prisma generate`...');
  // Let prisma find the schema file automatically. It defaults to 'prisma/schema.prisma'
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated successfully!');

} catch (error) {
  console.error('❌ Prisma generation failed:', error.message);
  // Exit with an error code to fail the build, so we know something is wrong.
  process.exit(1);
}