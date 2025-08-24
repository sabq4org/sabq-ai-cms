#!/usr/bin/env node

/**
 * اختبار شامل لإصلاح hardcoded domains والتحقق من __Host- compliance
 * يفحص جميع الملفات ويتأكد من عدم وجود hardcoded 'sabq.me'
 */

const fs = require('fs');
const path = require('path');

// الملفات والمجلدات المستثناة من الفحص
const EXCLUDED_PATTERNS = [
  /node_modules/,
  /\.git/,
  /\.next/,
  /dist/,
  /build/,
  /\.md$/,           // ملفات التوثيق
  /\.json$/,         // ملفات البيانات
  /robots\.txt$/,    // ملفات الروبوت
  /sitemap/,         // ملفات sitemap
  /test.*\.js$/,     // ملفات الاختبار
  /components\/StructuredData\.tsx$/, // بيانات منظمة يمكن أن تحتوي على URLs
  /production-health-report\.json$/   // تقارير الصحة
];

// أنماط hardcoded domains المشبوهة
const SUSPICIOUS_PATTERNS = [
  {
    pattern: /Domain\s*=\s*['"]\s*\.?sabq\.me\s*['"]/gi,
    description: 'hardcoded Domain=sabq.me في إعدادات الكوكيز',
    severity: 'HIGH'
  },
  {
    pattern: /domain\s*:\s*['"]\s*\.?sabq\.me\s*['"]/gi,
    description: 'hardcoded domain: sabq.me في الكود',
    severity: 'HIGH'
  },
  {
    pattern: /__Host-.*Domain\s*=/gi,
    description: '__Host- cookie مع Domain attribute (انتهاك القواعد)',
    severity: 'CRITICAL'
  },
  {
    pattern: /expires.*domain\s*=\s*\.?sabq\.me/gi,
    description: 'hardcoded domain في مسح الكوكيز',
    severity: 'MEDIUM'
  }
];

// أنماط صحيحة (استثناءات مسموحة)
const ALLOWED_PATTERNS = [
  /\/\/ .*sabq\.me/,           // تعليقات
  /console\.log.*sabq\.me/,    // رسائل debug
  /\/\* .*sabq\.me/,           // تعليقات متعددة الأسطر
  /describe.*sabq\.me/,        // اختبارات
  /test.*sabq\.me/,            // اختبارات
  /expect.*sabq\.me/,          // اختبارات
  /\.toContain.*sabq\.me/,     // اختبارات
  /email.*@sabq\.me/,          // عناوين بريد إلكتروني
  /https?:\/\/.*sabq\.me/,     // URLs في بيانات منظمة أو مرجعية
  /const.*invalid.*=/,         // متغيرات اختبار خاطئة
  /لاختبار.*validation/,      // تعليقات الاختبار العربية
  /__tests__.*\.ts:/,          // ملفات الاختبار
  /test.*\.js:/                // ملفات الاختبار
];

function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];
    
    SUSPICIOUS_PATTERNS.forEach(({ pattern, description, severity }) => {
      const matches = [...content.matchAll(pattern)];
      
      matches.forEach(match => {
        const line = content.substring(0, match.index).split('\n').length;
        
        // تحقق من الاستثناءات المسموحة
        const lineContent = content.split('\n')[line - 1] || '';
        const isAllowed = ALLOWED_PATTERNS.some(allowedPattern => 
          allowedPattern.test(lineContent) || allowedPattern.test(filePath)
        );
        
        if (!isAllowed) {
          issues.push({
            file: filePath,
            line,
            match: match[0],
            description,
            severity,
            lineContent: lineContent.trim()
          });
        }
      });
    });
    
    return issues;
  } catch (error) {
    console.warn(`⚠️ لا يمكن قراءة الملف: ${filePath}`, error.message);
    return [];
  }
}

function scanDirectory(dirPath, allIssues = []) {
  const items = fs.readdirSync(dirPath);
  
  items.forEach(item => {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);
    
    // تحقق من الاستثناءات
    const shouldSkip = EXCLUDED_PATTERNS.some(pattern => pattern.test(fullPath));
    if (shouldSkip) return;
    
    if (stat.isDirectory()) {
      scanDirectory(fullPath, allIssues);
    } else if (stat.isFile() && /\.(ts|tsx|js|jsx)$/.test(item)) {
      const issues = scanFile(fullPath);
      allIssues.push(...issues);
    }
  });
  
  return allIssues;
}

function generateReport(issues) {
  console.log('\n🔍 تقرير فحص hardcoded domains والـ __Host- compliance');
  console.log('='.repeat(70));
  
  if (issues.length === 0) {
    console.log('✅ ممتاز! لا توجد مشاكل في hardcoded domains');
    return true;
  }
  
  // تصنيف المشاكل حسب الخطورة
  const critical = issues.filter(i => i.severity === 'CRITICAL');
  const high = issues.filter(i => i.severity === 'HIGH');
  const medium = issues.filter(i => i.severity === 'MEDIUM');
  
  console.log(`📊 إجمالي المشاكل المكتشفة: ${issues.length}`);
  console.log(`  🚨 خطيرة: ${critical.length}`);
  console.log(`  ⚠️ عالية: ${high.length}`);
  console.log(`  ℹ️ متوسطة: ${medium.length}\n`);
  
  // عرض المشاكل الخطيرة أولاً
  if (critical.length > 0) {
    console.log('🚨 مشاكل خطيرة (يجب إصلاحها فوراً):');
    critical.forEach((issue, i) => {
      console.log(`${i + 1}. ${issue.description}`);
      console.log(`   📁 الملف: ${issue.file}:${issue.line}`);
      console.log(`   🔍 الكود: ${issue.lineContent}`);
      console.log(`   🎯 التطابق: ${issue.match}\n`);
    });
  }
  
  // عرض المشاكل العالية
  if (high.length > 0) {
    console.log('⚠️ مشاكل عالية الأولوية:');
    high.forEach((issue, i) => {
      console.log(`${i + 1}. ${issue.description}`);
      console.log(`   📁 الملف: ${issue.file}:${issue.line}`);
      console.log(`   🔍 الكود: ${issue.lineContent}\n`);
    });
  }
  
  // عرض المشاكل المتوسطة
  if (medium.length > 0) {
    console.log('ℹ️ مشاكل متوسطة الأولوية:');
    medium.forEach((issue, i) => {
      console.log(`${i + 1}. ${issue.description}`);
      console.log(`   📁 الملف: ${issue.file}:${issue.line}\n`);
    });
  }
  
  console.log('\n📋 التوصيات:');
  console.log('1. استخدم getRootDomainFromHost() للحصول على domain ديناميكياً');
  console.log('2. اتبع قواعد __Host- cookies (بدون Domain attribute)');
  console.log('3. استخدم setAuthCookies() helper بدلاً من hardcoded values');
  console.log('4. تأكد من استخدام dynamic domain detection في جميع cookie operations');
  
  return false;
}

function main() {
  console.log('🚀 بدء فحص hardcoded domains...');
  
  const projectRoot = process.cwd();
  console.log(`📂 فحص المجلد: ${projectRoot}`);
  
  const issues = scanDirectory(projectRoot);
  const isClean = generateReport(issues);
  
  if (isClean) {
    console.log('\n🎉 تهانينا! المشروع خالٍ من hardcoded domains');
    process.exit(0);
  } else {
    console.log(`\n🔧 يجب إصلاح ${issues.length} مشكلة قبل النشر`);
    process.exit(1);
  }
}

// تشغيل الفحص
if (require.main === module) {
  main();
}

module.exports = { scanDirectory, generateReport };
