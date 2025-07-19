#!/usr/bin/env node

console.log('🔍 فحص صحة التطبيق لـ DigitalOcean...');

const http = require('http');
const PORT = process.env.PORT || 3000;

const options = {
  hostname: 'localhost',
  port: PORT,
  path: '/api/health',
  method: 'GET',
  timeout: 10000
};

const req = http.request(options, (res) => {
  console.log(`✅ الاستجابة: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      if (result.status === 'ok') {
        console.log('✅ Health Check نجح!');
        process.exit(0);
      } else {
        console.log('❌ Health Check فشل:', result);
        process.exit(1);
      }
    } catch (error) {
      console.log('❌ خطأ في تحليل الاستجابة:', error.message);
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.log('❌ خطأ في الطلب:', error.message);
  process.exit(1);
});

req.on('timeout', () => {
  console.log('❌ انتهت مهلة الطلب');
  req.destroy();
  process.exit(1);
});

req.end(); 