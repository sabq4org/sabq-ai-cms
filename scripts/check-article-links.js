#!/usr/bin/env node

/**
 * سكريبت للتحقق من روابط المقالات في جميع المكونات
 * يتأكد من عدم استخدام slugs عربية في الروابط
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🔍 فحص روابط المقالات في المشروع...\n');

// أنماط البحث عن الروابط
const patterns = [
  // روابط مباشرة
  /href=\{[`"']\/article\/\$\{([^}]+)\}[`"']\}/g,
  /href=\{[`"']\/opinion\/\$\{([^}]+)\}[`"']\}/g,
  /href=\{[`"']\/news\/\$\{([^}]+)\}[`"']\}/g,
  /href=\{[`"']\/الأخبار\/\$\{([^}]+)\}[`"']\}/g,
  
  // استخدام template literals
  /href=\{`\/article\/\$\{([^}]+)\}`\}/g,
  /href=\{`\/opinion\/\$\{([^}]+)\}`\}/g,
  /href=\{`\/news\/\$\{([^}]+)\}`\}/g,
  /href=\{`\/الأخبار\/\$\{([^}]+)\}`\}/g,
  
  // استخدام دوال
  /href=\{getArticleLink\(([^)]+)\)\}/g,
  /href=\{getNewsLink\(([^)]+)\)\}/g,
  
  // Next.js Link component
  /<Link\s+href=\{[`"']\/article\/\$\{([^}]+)\}[`"']\}/g,
  /<Link\s+href=\{[`"']\/opinion\/\$\{([^}]+)\}[`"']\}/g,
  /<Link\s+href=\{[`"']\/news\/\$\{([^}]+)\}[`"']\}/g,
  /<Link\s+href=\{[`"']\/الأخبار\/\$\{([^}]+)\}[`"']\}/g,
];

// الملفات المطلوب فحصها
const filesToCheck = glob.sync('**/*.{tsx,jsx,ts,js}', {
  ignore: [
    'node_modules/**',
    '.next/**',
    'build/**',
    'dist/**',
    'scripts/**',
    '*.test.*',
    '*.spec.*'
  ]
});

let totalIssues = 0;
const issues = [];

filesToCheck.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  let fileIssues = [];
  
  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const fullMatch = match[0];
      const identifier = match[1];
      
      // تحقق من نوع المعرف المستخدم
      let issueType = null;
      
      if (fullMatch.includes('/الأخبار/')) {
        issueType = 'مسار عربي';
      } else if (fullMatch.includes('/news/')) {
        issueType = 'مسار قديم /news/';
      } else if (identifier && identifier.includes('.slug') && !identifier.includes('getArticleLink')) {
        issueType = 'استخدام slug مباشر';
      } else if (identifier && identifier.includes('.title')) {
        issueType = 'استخدام العنوان كمعرف';
      }
      
      if (issueType) {
        fileIssues.push({
          line: content.substring(0, match.index).split('\n').length,
          match: fullMatch,
          identifier: identifier,
          type: issueType
        });
      }
    }
  });
  
  if (fileIssues.length > 0) {
    issues.push({
      file: file,
      issues: fileIssues
    });
    totalIssues += fileIssues.length;
  }
});

// عرض النتائج
if (totalIssues === 0) {
  console.log('✅ ممتاز! لم يتم العثور على مشاكل في روابط المقالات.\n');
} else {
  console.log(`⚠️  تم العثور على ${totalIssues} مشكلة محتملة:\n`);
  
  issues.forEach(({ file, issues }) => {
    console.log(`\n📄 ${file}:`);
    issues.forEach(issue => {
      console.log(`   السطر ${issue.line}: ${issue.type}`);
      console.log(`   ${issue.match}`);
      if (issue.identifier) {
        console.log(`   المعرف المستخدم: ${issue.identifier}`);
      }
      console.log('');
    });
  });
  
  console.log('\n💡 التوصيات:');
  console.log('1. استخدم دالة getArticleLink() من lib/utils بدلاً من بناء الروابط يدوياً');
  console.log('2. استخدم article.id بدلاً من article.slug');
  console.log('3. تجنب استخدام المسارات العربية مثل /الأخبار/');
  console.log('4. استخدم /article/ بدلاً من /news/ للمقالات الجديدة');
}

// فحص استخدام getArticleLink
console.log('\n📊 إحصائيات استخدام getArticleLink:');
let getArticleLinkCount = 0;
let directLinkCount = 0;

filesToCheck.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  
  const getArticleLinkMatches = content.match(/getArticleLink\(/g);
  if (getArticleLinkMatches) {
    getArticleLinkCount += getArticleLinkMatches.length;
  }
  
  const directLinkMatches = content.match(/href=\{[`"']\/article\/\$\{/g);
  if (directLinkMatches) {
    directLinkCount += directLinkMatches.length;
  }
});

console.log(`- استخدام getArticleLink: ${getArticleLinkCount} مرة`);
console.log(`- روابط مباشرة: ${directLinkCount} مرة`);

if (directLinkCount > 0) {
  console.log('\n⚡ نصيحة: يفضل استخدام getArticleLink() لضمان توحيد طريقة بناء الروابط');
}

console.log('\n✨ انتهى الفحص!');