/**
 * تشخيص عميق لأخطاء APIs المستمرة
 */

const fs = require('fs').promises;
const path = require('path');

console.log('🔍 تشخيص عميق لأخطاء APIs...\n');

async function diagnoseAPIs() {
  try {
    console.log('📋 1. فحص ملفات API للأخطاء الأساسية...');
    
    // قائمة ملفات API للفحص
    const apiFiles = [
      'app/api/articles/route.ts',
      'app/api/upload-simple/route.ts',
      'app/api/upload/route.ts'
    ];
    
    for (const file of apiFiles) {
      try {
        const content = await fs.readFile(file, 'utf8');
        console.log(`✅ ${file}: قابل للقراءة (${content.length} أحرف)`);
        
        // فحص الـ imports الأساسية
        const hasNextRequest = content.includes('NextRequest');
        const hasNextResponse = content.includes('NextResponse');
        const hasPOSTMethod = content.includes('export async function POST');
        
        console.log(`   📦 الـ imports: NextRequest=${hasNextRequest}, NextResponse=${hasNextResponse}`);
        console.log(`   🔧 POST method: ${hasPOSTMethod}`);
        
        // فحص الأخطاء الشائعة
        const syntaxIssues = [];
        
        // فحص الـ semicolons المفقودة
        const lines = content.split('\n');
        lines.forEach((line, index) => {
          if (line.trim().startsWith('console.error') && !line.trim().endsWith(';')) {
            syntaxIssues.push(`السطر ${index + 1}: console.error بدون semicolon`);
          }
          if (line.trim().startsWith('console.log') && !line.trim().endsWith(';')) {
            syntaxIssues.push(`السطر ${index + 1}: console.log بدون semicolon`);
          }
        });
        
        if (syntaxIssues.length > 0) {
          console.log(`   ⚠️ مشاكل محتملة:`, syntaxIssues);
        } else {
          console.log(`   ✅ لا توجد مشاكل syntax واضحة`);
        }
        
      } catch (error) {
        console.error(`❌ ${file}: خطأ في القراءة - ${error.message}`);
      }
    }
    
    console.log('\n📋 2. فحص package.json للتبعيات...');
    
    try {
      const packageJson = JSON.parse(await fs.readFile('package.json', 'utf8'));
      const dependencies = packageJson.dependencies || {};
      const devDependencies = packageJson.devDependencies || {};
      
      console.log('📦 التبعيات الأساسية:');
      console.log(`   - next: ${dependencies.next || 'غير موجود'}`);
      console.log(`   - @prisma/client: ${dependencies['@prisma/client'] || 'غير موجود'}`);
      console.log(`   - prisma: ${devDependencies.prisma || dependencies.prisma || 'غير موجود'}`);
      
      // فحص إصدار Node.js
      console.log(`   - node: ${process.version}`);
      
    } catch (error) {
      console.error('❌ خطأ في قراءة package.json:', error.message);
    }
    
    console.log('\n📋 3. فحص متغيرات البيئة الحرجة...');
    
    const envVars = [
      'DATABASE_URL',
      'NEXTAUTH_SECRET',
      'NEXTAUTH_URL'
    ];
    
    envVars.forEach(varName => {
      const value = process.env[varName];
      if (value) {
        console.log(`✅ ${varName}: موجود (${value.substring(0, 20)}...)`);
      } else {
        console.log(`❌ ${varName}: مفقود`);
      }
    });
    
    console.log('\n📋 4. فحص مجلدات uploads والصلاحيات...');
    
    const uploadDirs = [
      'public/uploads',
      'public/uploads/avatar',
      'public/uploads/featured',
      'public/uploads/articles',
      'public/uploads/general'
    ];
    
    for (const dir of uploadDirs) {
      try {
        const stat = await fs.stat(dir);
        console.log(`✅ ${dir}: موجود ${stat.isDirectory() ? '(مجلد)' : '(ملف)'}`);
        
        // اختبار الكتابة
        const testFile = path.join(dir, 'test-write.txt');
        try {
          await fs.writeFile(testFile, 'test');
          await fs.unlink(testFile);
          console.log(`   ✅ صلاحيات الكتابة: متاحة`);
        } catch (writeError) {
          console.log(`   ❌ صلاحيات الكتابة: مرفوضة - ${writeError.code}`);
        }
        
      } catch (error) {
        console.error(`❌ ${dir}: غير موجود أو غير قابل للوصول - ${error.code}`);
      }
    }
    
    console.log('\n📋 5. محاكاة upload request...');
    
    // محاكاة FormData
    const { FormData } = require('formdata-polyfill/esm');
    const { File } = require('formdata-polyfill/esm');
    
    try {
      const testFormData = new FormData();
      const testFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
      testFormData.append('file', testFile);
      testFormData.append('type', 'featured');
      
      console.log('✅ FormData simulation نجحت');
      console.log(`   📋 المفاتيح: ${Array.from(testFormData.keys())}`);
      
    } catch (error) {
      console.error('❌ FormData simulation فشلت:', error.message);
    }
    
    console.log('\n📋 6. فحص Prisma Client...');
    
    try {
      // محاولة تحميل Prisma Client
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      
      console.log('✅ Prisma Client تم تحميله بنجاح');
      
      // اختبار اتصال سريع
      try {
        await prisma.$connect();
        console.log('✅ اتصال قاعدة البيانات: نجح');
        await prisma.$disconnect();
      } catch (dbError) {
        console.error('❌ اتصال قاعدة البيانات: فشل -', dbError.message);
      }
      
    } catch (prismaError) {
      console.error('❌ Prisma Client: فشل التحميل -', prismaError.message);
    }
    
    console.log('\n📋 7. فحص TypeScript compilation...');
    
    try {
      const { execSync } = require('child_process');
      
      // فحص إذا كان TypeScript يمكن compile الملفات
      console.log('🔄 فحص TypeScript compilation...');
      
      const tscOutput = execSync('npx tsc --noEmit --project .', { 
        encoding: 'utf8',
        timeout: 30000
      });
      
      console.log('✅ TypeScript compilation: نجح');
      
    } catch (tscError) {
      console.error('❌ TypeScript compilation: فشل');
      console.error('تفاصيل الخطأ:', tscError.message);
    }
    
  } catch (error) {
    console.error('❌ خطأ عام في التشخيص:', error);
  }
}

// تشغيل التشخيص
diagnoseAPIs()
  .then(() => {
    console.log('\n🎉 انتهى التشخيص العميق');
    console.log('\n💡 التوصيات:');
    console.log('1. إذا كانت جميع الفحوصات ناجحة، المشكلة قد تكون في البيئة الإنتاجية');
    console.log('2. إذا فشل Prisma، تحقق من DATABASE_URL');
    console.log('3. إذا فشل TypeScript، هناك أخطاء في الكود تحتاج إصلاح');
    console.log('4. إذا فشلت صلاحيات uploads، تحقق من أذونات المجلدات');
  })
  .catch(error => {
    console.error('❌ فشل التشخيص:', error);
  });