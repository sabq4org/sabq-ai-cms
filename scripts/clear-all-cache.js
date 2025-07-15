const fs = require('fs-extra');
const path = require('path');

async function clearAllCache() {
  console.log('🧹 بدء مسح جميع أنواع الكاش...\n');

  // 1. مسح كاش Redis
  try {
    console.log('1️⃣ مسح كاش Redis...');
    try {
      const redis = require('redis');
      const client = redis.createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379'
      });

      await client.connect();
      await client.flushAll();
      await client.disconnect();
      
      console.log('✅ تم مسح كاش Redis بنجاح\n');
    } catch (redisError) {
      console.log('⚠️ Redis غير مثبت أو لا يمكن الاتصال به');
      console.log('   لتثبيت Redis: npm install redis');
      console.log('   تخطي مسح كاش Redis...\n');
    }
  } catch (error) {
    console.log('⚠️ خطأ في مسح كاش Redis:', error.message);
    console.log('   تخطي مسح كاش Redis...\n');
  }

  // 2. مسح كاش Next.js
  try {
    console.log('2️⃣ مسح كاش Next.js...');
    const nextCachePath = path.join(process.cwd(), '.next');
    if (await fs.pathExists(nextCachePath)) {
      await fs.remove(nextCachePath);
      console.log('✅ تم مسح مجلد .next\n');
    } else {
      console.log('ℹ️ مجلد .next غير موجود\n');
    }
  } catch (error) {
    console.error('❌ خطأ في مسح كاش Next.js:', error.message);
  }

  // 3. مسح كاش node_modules
  try {
    console.log('3️⃣ مسح كاش node_modules...');
    const nodeModulesCachePath = path.join(process.cwd(), 'node_modules/.cache');
    if (await fs.pathExists(nodeModulesCachePath)) {
      await fs.remove(nodeModulesCachePath);
      console.log('✅ تم مسح مجلد node_modules/.cache\n');
    } else {
      console.log('ℹ️ مجلد node_modules/.cache غير موجود\n');
    }
  } catch (error) {
    console.error('❌ خطأ في مسح كاش node_modules:', error.message);
  }

  // 4. مسح كاش المتصفح (تعليمات للمستخدم)
  console.log('4️⃣ كاش المتصفح:');
  console.log('   يرجى مسح كاش المتصفح يدوياً:');
  console.log('   - Chrome/Edge: Ctrl+Shift+Delete (Windows) أو Cmd+Shift+Delete (Mac)');
  console.log('   - أو افتح الموقع في وضع التصفح الخفي\n');

  // 5. مسح كاش Vercel (إذا كان منشوراً)
  console.log('5️⃣ كاش Vercel:');
  console.log('   إذا كان الموقع منشوراً على Vercel:');
  console.log('   - اذهب إلى لوحة تحكم Vercel');
  console.log('   - اختر المشروع');
  console.log('   - اضغط على "Redeploy" مع تفعيل "Clear Cache"\n');

  console.log('✨ اكتمل مسح الكاش!');
  console.log('📌 نصيحة: أعد تشغيل خادم التطوير بـ: npm run dev');
}

// تشغيل السكريبت
clearAllCache().catch(console.error); 