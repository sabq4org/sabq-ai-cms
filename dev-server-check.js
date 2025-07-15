#!/usr/bin/env node

// مراقب استقرار خادم التطوير
const http = require('http');
const { spawn } = require('child_process');

function checkServer() {
  const req = http.request({
    hostname: 'localhost',
    port: 3000,
    path: '/',
    method: 'GET',
    timeout: 5000
  }, (res) => {
    console.log(`✅ الخادم يعمل بشكل صحيح - Status: ${res.statusCode}`);
  });

  req.on('error', (err) => {
    console.log(`❌ خطأ في الخادم: ${err.message}`);
    console.log('🔄 إعادة تشغيل الخادم...');
    restartServer();
  });

  req.on('timeout', () => {
    console.log('⏰ انتهت مهلة الاستجابة');
    req.destroy();
  });

  req.end();
}

function restartServer() {
  // إيقاف الخادم الحالي
  spawn('pkill', ['-f', 'next dev'], { stdio: 'inherit' });
  
  // انتظار قليل ثم إعادة التشغيل
  setTimeout(() => {
    console.log('🚀 بدء تشغيل خادم جديد...');
    const server = spawn('npm', ['run', 'dev'], { 
      stdio: 'inherit',
      env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=4096' }
    });
    
    server.on('error', (err) => {
      console.error('❌ فشل في تشغيل الخادم:', err);
    });
  }, 2000);
}

// فحص دوري كل 30 ثانية
setInterval(checkServer, 30000);

// فحص فوري
checkServer();

console.log('🔍 بدء مراقبة الخادم...'); 