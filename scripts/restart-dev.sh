#!/bin/bash

echo "🔄 إيقاف جميع عمليات Next.js..."
pkill -f "next dev" 2>/dev/null || true

echo "🧹 مسح مجلد .next..."
rm -rf .next 2>/dev/null || true

echo "⏳ انتظار 2 ثانية..."
sleep 2

echo "🚀 بدء خادم التطوير..."
npm run dev 