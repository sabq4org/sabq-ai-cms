#!/bin/bash

echo "🚀 تشغيل خادم التطوير مع SQLite..."
echo "📦 استخدام قاعدة البيانات: ./dev.db"

# تشغيل الخادم مع DATABASE_URL المحلي
DATABASE_URL="file:./dev.db" npm run dev 