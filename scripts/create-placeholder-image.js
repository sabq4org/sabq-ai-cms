#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Base64 encoded 1x1 transparent PNG
const placeholderBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

// Create public directory if it doesn't exist
const publicDir = path.join(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Create placeholder.jpg
const placeholderPath = path.join(publicDir, 'placeholder.jpg');
fs.writeFileSync(placeholderPath, Buffer.from(placeholderBase64, 'base64'));

console.log('✅ Created placeholder.jpg in public directory'); 