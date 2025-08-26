#!/usr/bin/env node

/**
 * سكريبت للتحقق من تعارضات خصائص Next.js Image
 * يبحث عن استخدام priority={true} مع loading="lazy" في نفس المكون
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

async function checkImageConflicts() {
  console.log('🔍 فحص تعارضات خصائص Next.js Image...');

  try {
    // البحث عن ملفات تحتوي على Image component مع كلا الخاصيتين
    const command = `
      find /Users/alialhazmi/sabq-ai-cms -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" | 
      xargs grep -l "priority.*loading\\|loading.*priority" | 
      head -10
    `;

    exec(command, (error, stdout, stderr) => {
      if (error && error.code !== 1) {
        console.error('❌ خطأ في البحث:', error);
        return;
      }

      const files = stdout.trim().split('\n').filter(f => f.length > 0);
      
      if (files.length === 0) {
        console.log('✅ لم يتم العثور على تعارضات في خصائص Image!');
        return;
      }

      console.log(`⚠️ تم العثور على ${files.length} ملف قد يحتوي على تعارضات:`);
      
      files.forEach(async (file, index) => {
        console.log(`\n${index + 1}. ${file}`);
        await analyzeFile(file);
      });
    });

  } catch (error) {
    console.error('❌ خطأ في العملية:', error);
  }
}

async function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    let inImageComponent = false;
    let imageStartLine = 0;
    let hasPriority = false;
    let hasLoading = false;
    let imageProps = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNumber = i + 1;

      // بحث عن بداية Image component
      if (line.includes('<Image') && !line.includes('</Image>')) {
        inImageComponent = true;
        imageStartLine = lineNumber;
        hasPriority = false;
        hasLoading = false;
        imageProps = [];
      }

      if (inImageComponent) {
        // فحص خصائص priority
        if (line.includes('priority') && (line.includes('true') || line.includes('{') && !line.includes('false'))) {
          hasPriority = true;
          imageProps.push(`السطر ${lineNumber}: priority`);
        }

        // فحص خصائص loading
        if (line.includes('loading=') && line.includes('lazy')) {
          hasLoading = true;
          imageProps.push(`السطر ${lineNumber}: loading="lazy"`);
        }

        // نهاية Image component
        if (line.includes('/>') || line.includes('</Image>')) {
          if (hasPriority && hasLoading) {
            console.log('  🚨 تعارض وُجد:');
            imageProps.forEach(prop => console.log(`    - ${prop}`));
            console.log(`    📍 مكون Image يبدأ من السطر ${imageStartLine}`);
            
            // اقتراح الإصلاح
            console.log('  💡 الإصلاح المقترح:');
            console.log('    - استخدم priority={true} بدون loading (للصور المهمة)');
            console.log('    - أو استخدم loading="lazy" بدون priority (للصور العادية)');
            console.log('    - أو استخدم loading={priority ? undefined : "lazy"}');
          }
          
          inImageComponent = false;
        }
      }
    }
  } catch (error) {
    console.error(`❌ خطأ في قراءة الملف ${filePath}:`, error.message);
  }
}

// إضافة توصيات لأفضل الممارسات
function printBestPractices() {
  console.log('\n📚 أفضل الممارسات لـ Next.js Image:');
  console.log('');
  console.log('1. استخدم priority={true} للصور المهمة فوق الطي (fold)');
  console.log('   - الصورة الرئيسية في المقال');
  console.log('   - أول صورة في carousel');
  console.log('   - صور البطل (hero images)');
  console.log('');
  console.log('2. استخدم loading="lazy" للصور تحت الطي');
  console.log('   - صور في قائمة طويلة');
  console.log('   - صور في أسفل الصفحة');
  console.log('   - صور في مكونات مؤجلة');
  console.log('');
  console.log('3. استخدم loading شرطي:');
  console.log('   loading={index === 0 ? undefined : "lazy"}');
  console.log('   priority={index === 0}');
  console.log('');
  console.log('4. لا تستخدم priority و loading="lazy" معاً');
  console.log('   ❌ priority={true} loading="lazy"');
  console.log('   ✅ priority={true}');
  console.log('   ✅ loading="lazy"');
}

// تشغيل السكريبت
if (require.main === module) {
  checkImageConflicts()
    .then(() => {
      printBestPractices();
      console.log('\n✨ انتهى فحص تعارضات خصائص Image!');
    })
    .catch((error) => {
      console.error('💥 فشل في تشغيل السكريبت:', error);
      process.exit(1);
    });
}

module.exports = { checkImageConflicts };
