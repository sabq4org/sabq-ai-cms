#!/usr/bin/env node

/**
 * سكريبت ترحيل الصور من S3 إلى Cloudinary
 * 
 * يقوم هذا السكريبت بـ:
 * 1. جلب جميع الصور من قاعدة البيانات
 * 2. التحقق من الصور المستضافة على S3
 * 3. رفعها إلى Cloudinary
 * 4. تحديث الروابط في قاعدة البيانات
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { v2: cloudinary } = require('cloudinary');
const fetch = require('node-fetch');
const prisma = new PrismaClient();

// إعداد Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dlaibl7id',
  api_key: process.env.CLOUDINARY_API_KEY || '566744491984695',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'WiWCbXJ5SDYeE24cNaI1o1Wm0CU',
  secure: true
});

// ألوان للـ terminal
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m'
};

// تحديد إذا كان الرابط من S3
function isS3Url(url) {
  if (!url) return false;
  return url.includes('amazonaws.com') || 
         url.includes('s3.') ||
         url.includes('X-Amz-Algorithm') ||
         url.includes('X-Amz-Signature');
}

// تحديد إذا كان الرابط من Cloudinary
function isCloudinaryUrl(url) {
  if (!url) return false;
  return url.includes('cloudinary.com') || 
         url.includes('res.cloudinary.com');
}

// تحديد نوع الصورة بناءً على الجدول
function getImageType(tableName, fieldName) {
  const typeMap = {
    'articles': {
      'featured_image': 'featured',
      'author_avatar': 'avatars'
    },
    'categories': {
      'image_url': 'categories',
      'cover_image': 'categories'
    },
    'users': {
      'avatar': 'avatars',
      'profile_image': 'avatars'
    },
    'deep_analyses': {
      'image_url': 'analysis',
      'featured_image': 'analysis'
    },
    'team_members': {
      'image': 'team',
      'avatar': 'team'
    }
  };

  return typeMap[tableName]?.[fieldName] || 'general';
}

// رفع صورة إلى Cloudinary
async function uploadToCloudinary(imageUrl, type = 'general') {
  try {
    console.log(`${colors.blue}📤 رفع الصورة إلى Cloudinary...${colors.reset}`);
    
    const folder = `sabq-cms/${type}`;
    const publicId = `migrated_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder,
      public_id: publicId,
      resource_type: 'auto',
      overwrite: true,
      invalidate: true,
      transformation: [
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ]
    });

    console.log(`${colors.green}✅ تم الرفع بنجاح: ${result.secure_url}${colors.reset}`);
    return result.secure_url;
    
  } catch (error) {
    console.error(`${colors.red}❌ فشل رفع الصورة: ${error.message}${colors.reset}`);
    return null;
  }
}

// ترحيل صور جدول معين
async function migrateTableImages(tableName, fields) {
  console.log(`\n${colors.blue}📊 ترحيل صور جدول ${tableName}...${colors.reset}`);
  
  let migrated = 0;
  let failed = 0;
  let skipped = 0;

  try {
    // جلب جميع السجلات
    const records = await prisma[tableName].findMany();
    console.log(`📌 عدد السجلات: ${records.length}`);

    for (const record of records) {
      for (const field of fields) {
        const imageUrl = record[field];
        
        if (!imageUrl) {
          continue;
        }

        // تخطي الصور المستضافة بالفعل على Cloudinary
        if (isCloudinaryUrl(imageUrl)) {
          console.log(`${colors.gray}⏭️  الصورة موجودة بالفعل على Cloudinary${colors.reset}`);
          skipped++;
          continue;
        }

        // تخطي الروابط المحلية
        if (!imageUrl.startsWith('http')) {
          console.log(`${colors.gray}⏭️  تخطي رابط محلي: ${imageUrl}${colors.reset}`);
          skipped++;
          continue;
        }

        // ترحيل صور S3 فقط
        if (isS3Url(imageUrl)) {
          console.log(`\n${colors.yellow}🔄 ترحيل: ${imageUrl.substring(0, 50)}...${colors.reset}`);
          
          const imageType = getImageType(tableName, field);
          const newUrl = await uploadToCloudinary(imageUrl, imageType);
          
          if (newUrl) {
            // تحديث قاعدة البيانات
            await prisma[tableName].update({
              where: { id: record.id },
              data: { [field]: newUrl }
            });
            
            migrated++;
            console.log(`${colors.green}✅ تم تحديث قاعدة البيانات${colors.reset}`);
          } else {
            failed++;
          }
        } else {
          skipped++;
        }
      }
    }

    console.log(`\n${colors.blue}📊 ملخص ${tableName}:${colors.reset}`);
    console.log(`   ✅ تم ترحيل: ${migrated}`);
    console.log(`   ❌ فشل: ${failed}`);
    console.log(`   ⏭️  تم تخطي: ${skipped}`);

  } catch (error) {
    console.error(`${colors.red}❌ خطأ في ترحيل ${tableName}: ${error.message}${colors.reset}`);
  }
}

// ترحيل جميع الصور
async function migrateAllImages() {
  console.log(`${colors.blue}🚀 بدء ترحيل الصور من S3 إلى Cloudinary...${colors.reset}`);
  console.log(`${colors.gray}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  try {
    // ترحيل صور المقالات
    await migrateTableImages('articles', ['featured_image', 'author_avatar']);
    
    // ترحيل صور التصنيفات
    await migrateTableImages('categories', ['image_url', 'cover_image']);
    
    // ترحيل صور المستخدمين
    await migrateTableImages('users', ['avatar', 'profile_image']);
    
    // ترحيل صور التحليلات العميقة
    const deepAnalysesExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'deep_analyses'
      ) as exists
    `;
    
    if (deepAnalysesExists[0]?.exists) {
      await migrateTableImages('deep_analyses', ['image_url', 'featured_image']);
    }
    
    // ترحيل صور أعضاء الفريق
    const teamMembersExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'team_members'
      ) as exists
    `;
    
    if (teamMembersExists[0]?.exists) {
      await migrateTableImages('team_members', ['image', 'avatar']);
    }

    console.log(`\n${colors.green}✅ اكتمل ترحيل الصور!${colors.reset}`);
    
  } catch (error) {
    console.error(`${colors.red}❌ خطأ في الترحيل: ${error.message}${colors.reset}`);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل الترحيل
if (require.main === module) {
  migrateAllImages().catch(console.error);
}

module.exports = { migrateAllImages, uploadToCloudinary }; 