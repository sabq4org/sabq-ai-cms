#!/usr/bin/env node

/**
 * Script to fix environment variables for AWS Amplify deployment
 * This ensures DATABASE_URL is available during build time
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing environment variables for Amplify...');

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set!');
  
  // Try to set it from known value
  const dbUrl = 'postgresql://postgres:%2A7gzOMPcDco8l4If%3AO-CVb9Ehztq@database-1.cluster-cluyg244y2cj.eu-north-1.rds.amazonaws.com:5432/sabqcms';
  process.env.DATABASE_URL = dbUrl;
  
  // Write to .env file for Next.js to pick up
  const envContent = `DATABASE_URL=${dbUrl}\nNEXTAUTH_SECRET=sabq-ai-cms-secret-key-2025\n`;
  fs.writeFileSync(path.join(process.cwd(), '.env'), envContent);
  
  console.log('✅ DATABASE_URL has been set');
} else {
  console.log('✅ DATABASE_URL is already set');
}

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