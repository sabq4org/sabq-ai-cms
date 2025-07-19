#!/bin/bash

echo "🚀 SABQ AI CMS Starting..."
echo "📅 Time: $(date)"
echo "📁 Directory: $(pwd)"
echo "🔍 Checking for build..."

if [ ! -d ".next" ]; then
    echo "❌ No build found!"
    echo "🏗️ Running build..."
    npm run build:production || npm run build || npm run build:do || npm run build:deploy || npx next build
    
    if [ ! -d ".next" ]; then
        echo "❌ Build failed! Trying emergency build..."
        rm -rf .next
        npx prisma generate || true
        SKIP_EMAIL_VERIFICATION=true npx next build
    fi
fi

if [ -d ".next" ]; then
    echo "✅ Build found!"
    echo "🚀 Starting server..."
    npx next start
else
    echo "❌ FATAL: Could not create build!"
    exit 1
fi 