#!/usr/bin/env node

const { Redis } = require('ioredis');
require('dotenv').config({ path: '.env.local' });

console.log('🔄 اختبار اتصال Redis...\n');

async function testRedisConnection() {
  let redis;
  
  try {
    // إنشاء اتصال
    if (process.env.REDIS_URL) {
      console.log('📡 استخدام Redis Cloud...');
      console.log(`🔗 URL: ${process.env.REDIS_URL.replace(/:[^:]*@/, ':****@')}`);
      redis = new Redis(process.env.REDIS_URL, { tls: {} });
    } else {
      console.log('💻 استخدام Redis المحلي...');
      redis = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      });
    }

    // انتظار الاتصال
    await new Promise((resolve, reject) => {
      redis.on('connect', resolve);
      redis.on('error', reject);
      setTimeout(() => reject(new Error('انتهت مهلة الاتصال')), 5000);
    });

    console.log('✅ تم الاتصال بنجاح!\n');

    // اختبار الأوامر الأساسية
    console.log('🧪 اختبار الأوامر الأساسية...');
    
    // PING
    const pong = await redis.ping();
    console.log(`✅ PING: ${pong}`);

    // SET
    await redis.set('test:key', 'Hello Redis!', 'EX', 10);
    console.log('✅ SET: تم حفظ البيانات');

    // GET
    const value = await redis.get('test:key');
    console.log(`✅ GET: ${value}`);

    // INFO
    const info = await redis.info('server');
    const version = info.match(/redis_version:([^\r\n]+)/)?.[1];
    console.log(`✅ Redis Version: ${version}`);

    // معلومات الذاكرة
    const memoryInfo = await redis.info('memory');
    const usedMemory = memoryInfo.match(/used_memory_human:([^\r\n]+)/)?.[1];
    console.log(`💾 الذاكرة المستخدمة: ${usedMemory}`);

    // تنظيف
    await redis.del('test:key');
    console.log('\n🧹 تم تنظيف بيانات الاختبار');

    console.log('\n✅ جميع الاختبارات نجحت!');
    
    // إغلاق الاتصال
    await redis.quit();
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ فشل الاختبار:', error.message);
    if (redis) {
      await redis.quit();
    }
    process.exit(1);
  }
}

// تشغيل الاختبار
testRedisConnection(); 