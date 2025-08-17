#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting DigitalOcean Build v2...');

// Helper function to run commands
function runCommand(command, options = {}) {
  console.log(`📌 Running: ${command}`);
  try {
    execSync(command, { stdio: 'inherit', ...options });
    return true;
  } catch (error) {
    console.error(`❌ Command failed: ${command}`);
    console.error(error.message);
    return false;
  }
}

// 1. Set up environment
console.log('🔧 Setting up environment...');
process.env.NODE_ENV = 'production';
process.env.NEXT_TELEMETRY_DISABLED = '1';
process.env.SKIP_ENV_VALIDATION = '1';

// Ensure required build-time env vars
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://dummy:dummy@localhost:5432/dummy';
  console.log('📝 Using dummy DATABASE_URL for build');
}

// 2. Clean up
console.log('🧹 Cleaning up old files...');
runCommand('rm -rf .next');
runCommand('rm -rf node_modules/.prisma');
runCommand('rm -rf lib/generated/prisma');

// 3. Create necessary directories
console.log('📁 Creating directories...');
fs.mkdirSync('lib/generated', { recursive: true });

// 4. Generate Prisma Client
console.log('🗄️ Generating Prisma Client...');
const prismaGenerated = runCommand('npx prisma generate');

if (!prismaGenerated) {
  console.error('❌ Prisma generation failed!');
  process.exit(1);
}

// 5. Install sharp if needed (ignore errors)
console.log('📸 Attempting to install sharp...');
runCommand('npm install --no-save --include=optional sharp || true');

// 6. Build Next.js
console.log('🏗️ Building Next.js application...');
const buildSuccess = runCommand('next build', {
  env: {
    ...process.env,
    NODE_ENV: 'production',
    NEXT_TELEMETRY_DISABLED: '1'
  }
});

if (!buildSuccess) {
  console.error('❌ Next.js build failed!');
  
  // Try alternative build method
  console.log('🔄 Trying alternative build method...');
  const altBuildSuccess = runCommand('node node_modules/next/dist/bin/next build');
  
  if (!altBuildSuccess) {
    console.error('❌ Alternative build also failed!');
    process.exit(1);
  }
}

// 7. Verify build output
console.log('✅ Verifying build output...');

if (!fs.existsSync('.next')) {
  console.error('❌ ERROR: .next directory not found after build!');
  console.log('📁 Current directory contents:');
  runCommand('ls -la');
  process.exit(1);
}

console.log('📁 .next directory contents:');
runCommand('ls -la .next/');

// 8. Check for standalone directory
const standalonePath = path.join(process.cwd(), '.next', 'standalone');
if (!fs.existsSync(standalonePath)) {
  console.warn('⚠️ WARNING: .next/standalone not found');
  console.log('🔧 Creating minimal standalone setup...');
  
  // Create standalone directory
  fs.mkdirSync(standalonePath, { recursive: true });
  
  // Create a minimal server.js
  const serverJs = `
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = false;
const hostname = 'localhost';

const app = next({ dev, hostname, port, dir: __dirname });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(\`> Ready on http://\${hostname}:\${port}\`);
  });
});
`;
  
  fs.writeFileSync(path.join(standalonePath, 'server.js'), serverJs);
  
  // Copy necessary files
  console.log('📋 Copying necessary files to standalone...');
  
  // Copy package.json
  const pkgJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const minimalPkgJson = {
    name: pkgJson.name,
    version: pkgJson.version,
    private: true,
    scripts: {
      start: "node server.js"
    },
    dependencies: {
      "next": pkgJson.dependencies.next
    }
  };
  fs.writeFileSync(
    path.join(standalonePath, 'package.json'),
    JSON.stringify(minimalPkgJson, null, 2)
  );
  
  // Copy public directory if exists
  if (fs.existsSync('public')) {
    runCommand(`cp -r public ${standalonePath}/`);
  }
  
  // Copy .next directory (excluding cache)
  runCommand(`cp -r .next ${standalonePath}/`);
  runCommand(`rm -rf ${standalonePath}/.next/cache`);
  
  // Copy node_modules (only production deps)
  console.log('📦 Copying production dependencies...');
  runCommand(`cp -r node_modules ${standalonePath}/`);
  
  console.log('✅ Minimal standalone setup created');
} else {
  console.log('✅ .next/standalone directory exists');
}

console.log('🎉 Build completed successfully!');
console.log('📊 Build summary:');
console.log(`   - .next directory: ${fs.existsSync('.next') ? '✅' : '❌'}`);
console.log(`   - .next/standalone: ${fs.existsSync(standalonePath) ? '✅' : '❌'}`);
console.log(`   - Prisma Client: ${fs.existsSync('node_modules/.prisma/client') ? '✅' : '❌'}`);

// Final check
if (!fs.existsSync('.next')) {
  console.error('❌ CRITICAL: Build failed - no .next directory!');
  process.exit(1);
}

process.exit(0); 