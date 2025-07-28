#!/usr/bin/env node

/**
 * Script to fix environment variables for AWS Amplify deployment
 * This ensures DATABASE_URL is available during build time
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing environment variables for Amplify...');
console.log('📍 Current environment:', process.env.NODE_ENV);
console.log('📍 AWS Region:', process.env.AWS_REGION || 'Not set');

// Force set environment variables
const envVars = {
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:%2A7gzOMPcDco8l4If%3AO-CVb9Ehztq@database-1.cluster-cluyg244y2cj.eu-north-1.rds.amazonaws.com:5432/sabqcms',
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'sabq-ai-cms-secret-key-2025',
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'https://production-branch.dvdwfd4vy831i.amplifyapp.com',
  NODE_ENV: 'production',
  PRISMA_QUERY_ENGINE_BINARY: '/var/task/node_modules/.prisma/client/libquery_engine-rhel-openssl-1.0.x.so.node'
};

// Write all env vars to .env file
let envContent = '';
for (const [key, value] of Object.entries(envVars)) {
  process.env[key] = value;
  envContent += `${key}=${value}\n`;
  console.log(`✅ ${key} set`);
}

// Write to multiple locations to ensure Next.js finds it
fs.writeFileSync(path.join(process.cwd(), '.env'), envContent);
fs.writeFileSync(path.join(process.cwd(), '.env.production'), envContent);
fs.writeFileSync(path.join(process.cwd(), '.env.local'), envContent);

console.log('✅ Environment variables written to .env files');

// Fix Prisma binary target
const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
if (fs.existsSync(schemaPath)) {
  let schema = fs.readFileSync(schemaPath, 'utf-8');
  
  // Update binary targets
  schema = schema.replace(
    /binaryTargets\s*=\s*\[[^\]]+\]/,
    'binaryTargets = ["native", "rhel-openssl-1.0.x", "rhel-openssl-3.0.x", "debian-openssl-1.1.x", "debian-openssl-3.0.x"]'
  );
  
  fs.writeFileSync(schemaPath, schema);
  console.log('✅ Updated Prisma binary targets');
}

console.log('✅ Environment fix complete'); 