const fs = require('fs');
const path = require('path');

async function fixUploadDirectories() {
  console.log('🔧 إصلاح مجلدات الرفع والصلاحيات...\n');
  
  try {
    const baseUploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    // المجلدات المطلوبة
    const requiredDirs = [
      'avatar',
      'articles', 
      'featured',
      'authors',
      'general',
      'uploads',
      'images'
    ];
    
    console.log(`📂 المجلد الأساسي: ${baseUploadDir}`);
    
    // إنشاء المجلد الأساسي إذا لم يكن موجوداً
    if (!fs.existsSync(baseUploadDir)) {
      console.log('📁 إنشاء المجلد الأساسي uploads...');
      fs.mkdirSync(baseUploadDir, { recursive: true });
      console.log('✅ تم إنشاء المجلد الأساسي');
    } else {
      console.log('✅ المجلد الأساسي موجود');
    }
    
    // إنشاء المجلدات الفرعية
    console.log('\n📁 فحص وإنشاء المجلدات الفرعية:');
    
    for (const dirName of requiredDirs) {
      const fullPath = path.join(baseUploadDir, dirName);
      
      if (!fs.existsSync(fullPath)) {
        console.log(`   📁 إنشاء مجلد: ${dirName}`);
        fs.mkdirSync(fullPath, { recursive: true });
        console.log(`   ✅ تم إنشاء: ${fullPath}`);
      } else {
        console.log(`   ✅ موجود: ${dirName}`);
      }
      
      // فحص الصلاحيات
      try {
        fs.accessSync(fullPath, fs.constants.W_OK);
        console.log(`   ✅ صلاحية الكتابة: ${dirName}`);
      } catch (error) {
        console.log(`   ❌ لا توجد صلاحية كتابة: ${dirName}`);
        
        // محاولة إصلاح الصلاحيات
        try {
          fs.chmodSync(fullPath, 0o755);
          console.log(`   🔧 تم إصلاح صلاحيات: ${dirName}`);
        } catch (chmodError) {
          console.log(`   ❌ فشل إصلاح صلاحيات: ${dirName} - ${chmodError.message}`);
        }
      }
    }
    
    // فحص المساحة المتاحة
    console.log('\n💾 فحص المساحة المتاحة:');
    try {
      const stats = fs.statSync(baseUploadDir);
      console.log(`   📊 معلومات المجلد:`, {
        isDirectory: stats.isDirectory(),
        mode: stats.mode.toString(8),
        size: stats.size
      });
    } catch (error) {
      console.log(`   ❌ خطأ في فحص المساحة: ${error.message}`);
    }
    
    // اختبار كتابة ملف تجريبي
    console.log('\n🧪 اختبار كتابة ملف تجريبي:');
    
    for (const dirName of ['avatar', 'featured', 'articles']) {
      const testDir = path.join(baseUploadDir, dirName);
      const testFile = path.join(testDir, 'test-write.txt');
      
      try {
        fs.writeFileSync(testFile, `Test write at ${new Date().toISOString()}`);
        console.log(`   ✅ نجح اختبار الكتابة: ${dirName}`);
        
        // حذف الملف التجريبي
        fs.unlinkSync(testFile);
        console.log(`   🗑️ تم حذف الملف التجريبي: ${dirName}`);
        
      } catch (error) {
        console.log(`   ❌ فشل اختبار الكتابة في ${dirName}: ${error.message}`);
      }
    }
    
    // إنشاء ملف .gitkeep للمجلدات الفارغة
    console.log('\n📄 إنشاء ملفات .gitkeep:');
    
    for (const dirName of requiredDirs) {
      const dirPath = path.join(baseUploadDir, dirName);
      const gitkeepPath = path.join(dirPath, '.gitkeep');
      
      // فحص إذا كان المجلد فارغ (لا يحتوي ملفات عدا .gitkeep)
      const files = fs.readdirSync(dirPath).filter(f => f !== '.gitkeep');
      
      if (files.length === 0 && !fs.existsSync(gitkeepPath)) {
        try {
          fs.writeFileSync(gitkeepPath, '# Keep this directory in git\n');
          console.log(`   ✅ تم إنشاء .gitkeep في: ${dirName}`);
        } catch (error) {
          console.log(`   ❌ فشل إنشاء .gitkeep في ${dirName}: ${error.message}`);
        }
      } else if (files.length > 0) {
        console.log(`   📁 ${dirName} يحتوي على ${files.length} ملف`);
      } else {
        console.log(`   ✅ .gitkeep موجود في: ${dirName}`);
      }
    }
    
    // تقرير نهائي
    console.log('\n📊 تقرير نهائي:');
    console.log(`   📂 المجلد الأساسي: ${baseUploadDir}`);
    console.log(`   📁 عدد المجلدات الفرعية: ${requiredDirs.length}`);
    
    const totalFiles = requiredDirs.reduce((total, dirName) => {
      const dirPath = path.join(baseUploadDir, dirName);
      if (fs.existsSync(dirPath)) {
        const files = fs.readdirSync(dirPath);
        console.log(`   📄 ${dirName}: ${files.length} ملف`);
        return total + files.length;
      }
      return total;
    }, 0);
    
    console.log(`   📊 إجمالي الملفات: ${totalFiles}`);
    
    console.log('\n✅ تم الانتهاء من إصلاح مجلدات الرفع');
    
    // نصائح
    console.log('\n💡 نصائح للاستخدام:');
    console.log('   1. تأكد من تشغيل السيرفر من المجلد الصحيح');
    console.log('   2. في بيئة الإنتاج، تأكد من صلاحيات الخادم');
    console.log('   3. راقب مساحة القرص الصلب بانتظام');
    console.log('   4. قم بعمل backup دوري للملفات المرفوعة');
    
  } catch (error) {
    console.error('❌ خطأ في إصلاح مجلدات الرفع:', error);
  }
}

// تشغيل السكريبت
fixUploadDirectories()
  .then(() => {
    console.log('\n🎉 تم الانتهاء من إصلاح مجلدات الرفع');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ خطأ في تشغيل السكريبت:', error);
    process.exit(1);
  });