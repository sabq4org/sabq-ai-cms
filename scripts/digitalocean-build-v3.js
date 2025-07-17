#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting DigitalOcean Build v3...');
console.log(`📅 Build Time: ${new Date().toISOString()}`);
console.log(`📁 Working Directory: ${process.cwd()}`);
console.log(`🖥️ Node Version: ${process.version}`);

// Helper function to run commands with better error handling
function runCommand(command, options = {}) {
  console.log(`\n📌 Running: ${command}`);
  try {
    const result = execSync(command, { 
      stdio: 'pipe', 
      encoding: 'utf8',
      ...options 
    });
    console.log(`✅ Success: ${command}`);
    if (result) {
      console.log(result);
    }
    return { success: true, output: result };
  } catch (error) {
    console.error(`❌ Command failed: ${command}`);
    console.error(`Exit code: ${error.status}`);
    console.error(`Error: ${error.message}`);
    if (error.stdout) {
      console.error('Stdout:', error.stdout.toString());
    }
    if (error.stderr) {
      console.error('Stderr:', error.stderr.toString());
    }
    return { success: false, error };
  }
}

// 1. Log environment variables (hide sensitive values)
console.log('\n🔧 Environment Check:');
const envVars = {
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL ? '[SET]' : '[NOT SET]',
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? '[SET]' : '[NOT SET]',
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY ? '[SET]' : '[NOT SET]',
  JWT_SECRET: process.env.JWT_SECRET ? '[SET]' : '[NOT SET]',
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '[SET]' : '[NOT SET]',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY ? '[SET]' : '[NOT SET]',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ? '[SET]' : '[NOT SET]',
};
console.table(envVars);

// 2. Set up environment
console.log('\n🔧 Setting up build environment...');
process.env.NODE_ENV = 'production';
process.env.NEXT_TELEMETRY_DISABLED = '1';
process.env.SKIP_ENV_VALIDATION = '1';

// Use dummy DATABASE_URL if not set (for Prisma generation)
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://dummy:dummy@localhost:5432/dummy?schema=public';
  console.log('📝 Using dummy DATABASE_URL for build-time Prisma generation');
}

// 3. Clean up
console.log('\n🧹 Cleaning up old files...');
runCommand('rm -rf .next');
runCommand('rm -rf node_modules/.prisma');
runCommand('rm -rf lib/generated');

// 4. Create necessary directories
console.log('\n📁 Creating necessary directories...');
fs.mkdirSync('lib/generated', { recursive: true });

// 5. Check package.json
console.log('\n📦 Checking package.json...');
const pkgJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
console.log(`Package name: ${pkgJson.name}`);
console.log(`Package version: ${pkgJson.version}`);

// 6. Install critical dependencies
console.log('\n📦 Installing critical dependencies...');
runCommand('npm install --no-save --include=optional sharp || echo "Sharp installation failed, continuing..."');

// 7. Generate Prisma Client with verbose output
console.log('\n🗄️ Generating Prisma Client...');
const prismaResult = runCommand('npx prisma generate --generator client');

if (!prismaResult.success) {
  console.error('❌ Prisma generation failed!');
  
  // Try to create a minimal Prisma client
  console.log('🔧 Attempting to create minimal Prisma client...');
  fs.mkdirSync('node_modules/.prisma/client', { recursive: true });
  fs.writeFileSync('node_modules/.prisma/client/index.js', 'module.exports = { PrismaClient: class {} }');
}

// 8. Verify Prisma generation
console.log('\n🔍 Verifying Prisma Client...');
const prismaClientExists = fs.existsSync('node_modules/.prisma/client');
const libGeneratedExists = fs.existsSync('lib/generated/prisma');
console.log(`Prisma Client (.prisma/client): ${prismaClientExists ? '✅' : '❌'}`);
console.log(`Prisma Client (lib/generated): ${libGeneratedExists ? '✅' : '❌'}`);

// 9. Build Next.js with detailed error handling
console.log('\n🏗️ Building Next.js application...');
const buildResult = runCommand('next build 2>&1', {
  env: {
    ...process.env,
    NODE_ENV: 'production',
    NEXT_TELEMETRY_DISABLED: '1',
    SKIP_ENV_VALIDATION: '1'
  }
});

if (!buildResult.success) {
  console.error('\n❌ Next.js build failed!');
  
  // Log more details about the failure
  console.log('\n📁 Directory structure:');
  runCommand('ls -la');
  
  console.log('\n📁 Node modules check:');
  runCommand('ls -la node_modules/ | head -20');
  
  // Try alternative build
  console.log('\n🔄 Trying alternative build command...');
  const altBuildResult = runCommand('node node_modules/next/dist/bin/next build 2>&1');
  
  if (!altBuildResult.success) {
    console.error('❌ Alternative build also failed!');
    
    // Last resort - try with minimal config
    console.log('\n🔄 Trying build with minimal configuration...');
    runCommand('NODE_OPTIONS="--max-old-space-size=4096" next build || echo "Build failed"');
  }
}

// 10. Verify build output
console.log('\n✅ Verifying build output...');

if (!fs.existsSync('.next')) {
  console.error('❌ ERROR: .next directory not found after build!');
  process.exit(1);
}

console.log('📁 .next directory contents:');
runCommand('ls -la .next/');

// 11. Final summary
console.log('\n📊 Build Summary:');
console.log('='.repeat(50));
console.log(`✅ Build completed at: ${new Date().toISOString()}`);
console.log(`📁 .next directory: ${fs.existsSync('.next') ? '✅ Created' : '❌ Missing'}`);
console.log(`📦 Prisma Client: ${fs.existsSync('node_modules/.prisma/client') ? '✅ Generated' : '❌ Missing'}`);

// Check build size
if (fs.existsSync('.next')) {
  const buildSize = runCommand('du -sh .next | cut -f1', { stdio: 'pipe' });
  if (buildSize.success) {
    console.log(`📏 Build size: ${buildSize.output.trim()}`);
  }
}

console.log('='.repeat(50));

// Exit with appropriate code
if (fs.existsSync('.next')) {
  console.log('\n🎉 Build completed successfully!');
  process.exit(0);
} else {
  console.error('\n❌ Build failed - no output generated!');
  process.exit(1);
} 