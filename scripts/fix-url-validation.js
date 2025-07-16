#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// قائمة الملفات التي تحتاج إصلاح
const filesToFix = [
  'app/api/was-news/route.ts',
  'app/api/categories/route.ts',
  'app/api/categories/personalized/route.ts',
  'app/api/deep-analyses/route.ts',
  'app/api/email/subscribers/route.ts',
  'app/api/email/templates/route.ts',
  'app/api/smart-blocks/route.ts',
  'app/api/impressions/route.ts',
  'app/api/user/stats/route.ts',
  'app/api/keywords/route.ts',
  'app/api/user/saved-categories/route.ts',
  'app/api/user/interests/route.ts',
  'app/api/user/activity-summary/route.ts',
  'app/api/activities/route.ts',
  'app/api/templates/active/route.ts',
  'app/api/user/likes/route.ts',
  'app/api/user/preferences/route.ts',
  'app/api/users/route.ts',
  'app/api/ai/interactions/route.ts',
  'app/api/news/stats/route.ts',
  'app/api/bookmarks/route.ts',
  'app/api/tags/[tag]/route.ts',
  'app/api/news/latest/route.ts',
  'app/api/forum/categories/route.ts',
  'app/api/forum/replies/route.ts',
  'app/api/user/saved/route.ts',
  'app/api/loyalty/route.ts',
  'app/api/comments/route.ts',
  'app/api/articles/route.ts',
  'app/api/admin/comments/route.ts',
  'app/api/authors/route.ts',
  'app/api/voice-summary/route.ts',
  'app/api/loyalty/register/route.ts',
  'app/api/articles/personalized/route.ts',
  'app/api/opinion-authors/route.ts',
  'app/api/interactions/check/route.ts',
  'app/api/interactions/route.ts',
  'app/api/interactions/saved-articles/route.ts',
  'app/api/interactions/liked-articles/route.ts'
];

function fixUrlValidation(filePath) {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  الملف غير موجود: ${filePath}`);
      return;
    }
    
    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;
    
    // البحث عن أنماط مختلفة من استخدام new URL(request.url)
    const patterns = [
      {
        regex: /const\s+\{\s*searchParams\s*\}\s*=\s*new\s+URL\(request\.url\);/g,
        replacement: `// التأكد من وجود URL صحيح
    if (!request.url) {
      return NextResponse.json(
        { error: 'Invalid request URL' },
        { status: 400 }
      );
    }
    
    const { searchParams } = new URL(request.url);`
      },
      {
        regex: /const\s+url\s*=\s*new\s+URL\(request\.url\);/g,
        replacement: `// التأكد من وجود URL صحيح
    if (!request.url) {
      return NextResponse.json(
        { error: 'Invalid request URL' },
        { status: 400 }
      );
    }
    
    const url = new URL(request.url);`
      }
    ];
    
    patterns.forEach(pattern => {
      if (pattern.regex.test(content)) {
        content = content.replace(pattern.regex, pattern.replacement);
        modified = true;
      }
    });
    
    if (modified) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ تم إصلاح: ${filePath}`);
    } else {
      console.log(`ℹ️  لا يحتاج إصلاح: ${filePath}`);
    }
    
  } catch (error) {
    console.error(`❌ خطأ في إصلاح ${filePath}:`, error.message);
  }
}

console.log('🚀 بدء إصلاح مشكلة URL validation...\n');

filesToFix.forEach(file => {
  fixUrlValidation(file);
});

console.log('\n✅ تم الانتهاء من إصلاح جميع الملفات!'); 