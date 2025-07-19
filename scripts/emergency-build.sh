#!/bin/sh

echo "🚨 Emergency Build Script for DigitalOcean"
echo "========================================="
echo "📅 $(date)"
echo "📁 Current directory: $(pwd)"
echo ""

# 1. تنظيف البناء القديم
echo "1️⃣ Cleaning old build..."
rm -rf .next
rm -rf node_modules/.cache

# 2. توليد Prisma
echo "2️⃣ Generating Prisma Client..."
npx prisma generate || {
    echo "❌ Prisma generation failed!"
    exit 1
}

# 3. بناء Next.js مباشرة
echo "3️⃣ Building Next.js directly..."
NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 npx next build || {
    echo "❌ Next.js build failed!"
    exit 1
}

# 4. التحقق من BUILD_ID
echo "4️⃣ Verifying build..."
if [ -f ".next/BUILD_ID" ]; then
    echo "✅ Build successful!"
    echo "📋 Build ID: $(cat .next/BUILD_ID)"
    echo "📁 .next contents:"
    ls -la .next/
else
    echo "❌ BUILD_ID not found!"
    echo "📁 Current directory contents:"
    ls -la
    echo "📁 .next directory contents:"
    ls -la .next/ || echo "No .next directory"
    exit 1
fi

echo ""
echo "✅ Emergency build completed successfully!" 