#!/usr/bin/env node

console.log('🔍 تشخيص مشكلة عرض الأخبار...\n');

// Test different API endpoints
const endpoints = [
  'http://localhost:3000/api/articles?status=published&limit=5&page=1',
  'http://localhost:3000/api/news?status=published&limit=5&page=1', 
  'http://localhost:3000/api/news/latest?limit=5&page=1',
  'http://localhost:3000/api/light/news?limit=5'
];

async function testEndpoint(url) {
  try {
    console.log(`📡 Testing: ${url}`);
    const response = await fetch(url);
    const data = await response.json();
    
    console.log(`   Status: ${response.status}`);
    console.log(`   Articles count: ${data.articles?.length || 0}`);
    
    if (data.articles?.length > 0) {
      console.log(`   First article: "${data.articles[0].title?.substring(0, 50)}..."`);
      console.log(`   Published: ${data.articles[0].published_at}`);
    }
    console.log(`   Cache headers: ${response.headers.get('cache-control') || 'none'}`);
    console.log(`   X-Cache: ${response.headers.get('x-cache') || 'none'}`);
    console.log('');
    
    return data;
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}\n`);
    return null;
  }
}

async function diagnose() {
  console.log('🚀 Starting API endpoint diagnosis...\n');
  
  for (const endpoint of endpoints) {
    await testEndpoint(endpoint);
  }
  
  console.log('✅ Diagnosis complete. Check if articles are being returned properly.');
  console.log('If articles are returned but not showing in UI, the issue is likely in:');
  console.log('1. Frontend caching');
  console.log('2. React state management');
  console.log('3. Component rendering logic');
  console.log('4. Browser cache');
}

diagnose().catch(console.error);
