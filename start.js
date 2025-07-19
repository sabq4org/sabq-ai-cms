#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 SABQ AI CMS Starting (Node.js fallback)...');
console.log('📅 Time:', new Date().toISOString());
console.log('📁 Directory:', process.cwd());

// فحص وجود build
const nextDir = path.join(process.cwd(), '.next');
console.log('🔍 Checking for build...');

if (!fs.existsSync(nextDir)) {
    console.log('❌ No build found!');
    console.log('🏗️ Running build...');
    
    // محاولة scripts مختلفة
    const buildCommands = [
        'npm run build:production',
        'npm run build',
        'npm run build:do',
        'npm run build:deploy',
        'npx next build'
    ];
    
    let buildSuccess = false;
    for (const cmd of buildCommands) {
        try {
            console.log(`Trying: ${cmd}`);
            execSync(cmd, { stdio: 'inherit' });
            if (fs.existsSync(nextDir)) {
                buildSuccess = true;
                break;
            }
        } catch (error) {
            console.log(`Failed: ${cmd}`);
        }
    }
    
    if (!buildSuccess) {
        console.log('❌ Build failed! Trying emergency build...');
        try {
            execSync('rm -rf .next', { stdio: 'inherit' });
            execSync('npx prisma generate || true', { stdio: 'inherit' });
            execSync('SKIP_EMAIL_VERIFICATION=true npx next build', { stdio: 'inherit' });
        } catch (error) {
            console.error('Emergency build failed:', error.message);
        }
    }
}

// تشغيل الخادم
if (fs.existsSync(nextDir)) {
    console.log('✅ Build found!');
    console.log('🚀 Starting server...');
    try {
        execSync('npx next start', { stdio: 'inherit' });
    } catch (error) {
        console.error('Server failed:', error.message);
        process.exit(1);
    }
} else {
    console.log('❌ FATAL: Could not create build!');
    process.exit(1);
} 