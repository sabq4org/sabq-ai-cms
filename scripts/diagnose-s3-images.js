#!/usr/bin/env node

/**
 * سكريبت تشخيص مشاكل الصور من S3
 * يساعد في فحص روابط الصور وإعدادات CORS
 */

const fetch = require('node-fetch');
const { PrismaClient } = require('@prisma/client');
const AWS = require('aws-sdk');

const prisma = new PrismaClient();

// إعداد S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || process.env.ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || process.env.SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || process.env.S3_REGION || 'us-east-1',
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'sabq-ai-cms-images';

/**
 * فحص رابط صورة واحد
 */
async function checkImageUrl(url, source = 'unknown') {
  if (!url) return { url, status: 'empty', source };
  
  try {
    console.log(`\n🔍 فحص: ${url.substring(0, 80)}...`);
    
    // فحص نوع الرابط
    const urlType = detectUrlType(url);
    console.log(`   📎 نوع الرابط: ${urlType}`);
    
    // محاولة جلب الصورة
    const response = await fetch(url, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (response.ok) {
      console.log(`   ✅ الصورة متاحة (${response.status})`);
      
      // فحص headers
      const contentType = response.headers.get('content-type');
      const cors = response.headers.get('access-control-allow-origin');
      
      console.log(`   📄 Content-Type: ${contentType || 'غير محدد'}`);
      console.log(`   🌐 CORS: ${cors || '❌ غير موجود'}`);
      
      return {
        url,
        status: 'ok',
        source,
        type: urlType,
        contentType,
        cors: cors || null,
        statusCode: response.status
      };
    } else {
      console.log(`   ❌ فشل الوصول (${response.status})`);
      return {
        url,
        status: 'failed',
        source,
        type: urlType,
        statusCode: response.status,
        error: response.statusText
      };
    }
  } catch (error) {
    console.log(`   ❌ خطأ: ${error.message}`);
    return {
      url,
      status: 'error',
      source,
      error: error.message
    };
  }
}

/**
 * كشف نوع الرابط
 */
function detectUrlType(url) {
  if (url.includes('amazonaws.com')) {
    if (url.includes('X-Amz-Algorithm')) {
      return 'S3 Presigned URL';
    }
    return 'S3 Public URL';
  }
  if (url.includes('cloudinary.com')) return 'Cloudinary';
  if (url.includes('unsplash.com')) return 'Unsplash';
  if (url.startsWith('/')) return 'Local Path';
  if (url.startsWith('http')) return 'External URL';
  return 'Unknown';
}

/**
 * فحص إعدادات S3 Bucket
 */
async function checkBucketSettings() {
  console.log('\n📦 فحص إعدادات S3 Bucket...\n');
  
  try {
    // فحص Bucket Policy
    try {
      const policy = await s3.getBucketPolicy({ Bucket: BUCKET_NAME }).promise();
      console.log('✅ Bucket Policy موجود');
      
      // تحليل السياسة
      const policyObj = JSON.parse(policy.Policy);
      const publicReadStatement = policyObj.Statement.find(s => 
        s.Effect === 'Allow' && 
        s.Principal === '*' && 
        s.Action.includes('s3:GetObject')
      );
      
      if (publicReadStatement) {
        console.log('✅ السياسة تسمح بالقراءة العامة');
      } else {
        console.log('⚠️ السياسة لا تسمح بالقراءة العامة');
      }
    } catch (error) {
      if (error.code === 'NoSuchBucketPolicy') {
        console.log('❌ لا توجد سياسة bucket');
      } else {
        console.log('❌ خطأ في قراءة السياسة:', error.message);
      }
    }
    
    // فحص CORS
    try {
      const cors = await s3.getBucketCors({ Bucket: BUCKET_NAME }).promise();
      console.log('✅ إعدادات CORS موجودة');
      
      const allowedOrigins = cors.CORSRules[0]?.AllowedOrigins || [];
      console.log('   🌐 الأصول المسموحة:', allowedOrigins.join(', '));
    } catch (error) {
      if (error.code === 'NoSuchCORSConfiguration') {
        console.log('❌ لا توجد إعدادات CORS');
      } else {
        console.log('❌ خطأ في قراءة CORS:', error.message);
      }
    }
    
    // فحص Public Access Block
    try {
      const publicAccess = await s3.getPublicAccessBlock({ Bucket: BUCKET_NAME }).promise();
      console.log('⚠️ Public Access Block موجود:');
      console.log('   - BlockPublicAcls:', publicAccess.PublicAccessBlockConfiguration.BlockPublicAcls);
      console.log('   - BlockPublicPolicy:', publicAccess.PublicAccessBlockConfiguration.BlockPublicPolicy);
      console.log('   - IgnorePublicAcls:', publicAccess.PublicAccessBlockConfiguration.IgnorePublicAcls);
      console.log('   - RestrictPublicBuckets:', publicAccess.PublicAccessBlockConfiguration.RestrictPublicBuckets);
    } catch (error) {
      if (error.code === 'NoSuchPublicAccessBlockConfiguration') {
        console.log('✅ لا يوجد Public Access Block');
      } else {
        console.log('❌ خطأ في فحص Public Access Block:', error.message);
      }
    }
  } catch (error) {
    console.error('❌ خطأ في فحص إعدادات Bucket:', error.message);
  }
}

/**
 * فحص صور المقالات
 */
async function checkArticleImages() {
  console.log('\n📰 فحص صور المقالات...\n');
  
  try {
    // جلب آخر 10 مقالات بصور
    const articles = await prisma.articles.findMany({
      where: {
        AND: [
          { featured_image: { not: null } },
          { featured_image: { not: '' } }
        ]
      },
      take: 10,
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        title: true,
        featured_image: true
      }
    });
    
    console.log(`📊 وجدت ${articles.length} مقال بصور\n`);
    
    const results = [];
    for (const article of articles) {
      console.log(`📰 ${article.title}`);
      const result = await checkImageUrl(article.featured_image, 'article');
      results.push(result);
    }
    
    // تلخيص النتائج
    console.log('\n📊 ملخص النتائج:');
    console.log(`   ✅ صور تعمل: ${results.filter(r => r.status === 'ok').length}`);
    console.log(`   ❌ صور معطلة: ${results.filter(r => r.status !== 'ok').length}`);
    
    // تحليل أنواع المشاكل
    const presignedUrls = results.filter(r => r.type === 'S3 Presigned URL');
    if (presignedUrls.length > 0) {
      console.log(`\n⚠️ تحذير: وجدت ${presignedUrls.length} رابط presigned قد تنتهي صلاحيته!`);
    }
    
    const noCors = results.filter(r => r.status === 'ok' && !r.cors);
    if (noCors.length > 0) {
      console.log(`\n⚠️ تحذير: ${noCors.length} صورة بدون CORS headers!`);
    }
    
    return results;
  } catch (error) {
    console.error('❌ خطأ في فحص صور المقالات:', error.message);
    return [];
  }
}

/**
 * اقتراح حلول
 */
function suggestSolutions(results) {
  console.log('\n💡 الحلول المقترحة:\n');
  
  const hasPresignedUrls = results.some(r => r.type === 'S3 Presigned URL');
  const hasCorsIssues = results.some(r => r.status === 'ok' && !r.cors);
  const hasFailedImages = results.some(r => r.status !== 'ok');
  
  if (hasPresignedUrls) {
    console.log('1️⃣ تحويل Presigned URLs إلى Public URLs:');
    console.log('   - قم بتشغيل: node scripts/setup-s3-public-access.js');
    console.log('   - حدث الكود لاستخدام روابط عامة مباشرة\n');
  }
  
  if (hasCorsIssues) {
    console.log('2️⃣ إصلاح CORS:');
    console.log('   - أضف إعدادات CORS للـ bucket');
    console.log('   - تأكد من إضافة نطاق الموقع للأصول المسموحة\n');
  }
  
  if (hasFailedImages) {
    console.log('3️⃣ إصلاح الصور المعطلة:');
    console.log('   - تحقق من وجود الملفات في S3');
    console.log('   - تأكد من صحة الروابط في قاعدة البيانات\n');
  }
  
  console.log('4️⃣ توصيات عامة:');
  console.log('   - استخدم CloudFront CDN لتحسين الأداء');
  console.log('   - فعّل الضغط والتخزين المؤقت');
  console.log('   - راقب الأداء باستمرار');
}

/**
 * الدالة الرئيسية
 */
async function main() {
  console.log(`
🔍 تشخيص مشاكل الصور من S3
=============================
`);

  try {
    // 1. فحص إعدادات Bucket
    await checkBucketSettings();
    
    // 2. فحص صور المقالات
    const results = await checkArticleImages();
    
    // 3. اقتراح حلول
    suggestSolutions(results);
    
    console.log('\n✨ انتهى التشخيص!\n');
    
  } catch (error) {
    console.error('\n❌ خطأ في التشخيص:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل السكريبت
if (require.main === module) {
  main();
} 