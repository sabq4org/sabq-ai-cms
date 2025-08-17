// فحص متغيرات البيئة المطلوبة
export function checkEnvironmentVariables() {
  const requiredEnvVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'NEXTAUTH_SECRET',
  ];

  const missing = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.error('❌ متغيرات البيئة المفقودة:', missing);
    console.error('يرجى التأكد من تعريف هذه المتغيرات في ملف .env');
    return false;
  }

  console.log('✅ جميع متغيرات البيئة المطلوبة محددة');
  return true;
}

// فحص اتصال قاعدة البيانات
export function validateDatabaseUrl() {
  const dbUrl = process.env.DATABASE_URL;
  
  if (!dbUrl) {
    console.error('❌ DATABASE_URL غير محدد');
    return false;
  }

  // فحص تنسيق URL
  try {
    const url = new URL(dbUrl);
    
    // دعم MySQL و PostgreSQL
    if (!url.protocol.startsWith('mysql') && !url.protocol.startsWith('postgresql')) {
      console.warn('⚠️ DATABASE_URL يجب أن يستخدم بروتوكول MySQL أو PostgreSQL');
    } else {
      const dbType = url.protocol.startsWith('mysql') ? 'MySQL' : 'PostgreSQL';
      console.log(`✅ قاعدة البيانات: ${dbType}`);
    }
    
    if (!url.hostname) {
      console.error('❌ DATABASE_URL لا يحتوي على hostname صحيح');
      return false;
    }
    
    console.log(`✅ DATABASE_URL صحيح - الاتصال بـ ${url.hostname}`);
    return true;
  } catch (error) {
    console.error('❌ DATABASE_URL غير صحيح:', error);
    return false;
  }
}

// تشغيل الفحوصات
export function runStartupChecks() {
  console.log('🔍 فحص إعدادات التطبيق...');
  
  const envCheck = checkEnvironmentVariables();
  const dbCheck = validateDatabaseUrl();
  
  if (envCheck && dbCheck) {
    console.log('✅ جميع الفحوصات نجحت - التطبيق جاهز للعمل');
    return true;
  } else {
    console.error('❌ فشلت بعض الفحوصات - قد تواجه مشاكل في التطبيق');
    return false;
  }
}
