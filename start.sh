#!/bin/sh

echo "🚀 SABQ AI CMS Starting..."
echo "📅 Time: $(date)"
echo "📁 Directory: $(pwd)"
echo "🔍 Checking for build..."

# التحقق من وجود BUILD_ID وليس فقط المجلد
if [ ! -f ".next/BUILD_ID" ]; then
    echo "❌ No valid build found (missing BUILD_ID)!"
    echo "🏗️ Running build..."
    
    # تنظيف البناء القديم إن وجد
    rm -rf .next
    
    # محاولة البناء بطرق مختلفة
    npm run build:production || npm run build || npx next build
    
    if [ ! -f ".next/BUILD_ID" ]; then
        echo "❌ Build failed! Trying direct next build..."
        rm -rf .next
        npx prisma generate || true
        SKIP_EMAIL_VERIFICATION=true npx next build
    fi
fi

if [ -f ".next/BUILD_ID" ]; then
    echo "✅ Valid build found!"
    echo "📋 Build ID: $(cat .next/BUILD_ID)"
    echo "🚀 Starting server..."
    exec npx next start -H 0.0.0.0 -p ${PORT:-3000}
else
    echo "❌ FATAL: Could not create valid build!"
    echo "📁 .next contents:"
    ls -la .next/ || echo "No .next directory"
    exit 1
fi 