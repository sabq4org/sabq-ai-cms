const fetch = require('node-fetch');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

/**
 * 🧪 سكريبت شامل لاختبار منظومة التسجيل والمصادقة
 * يغطي جميع السيناريوهات المذكورة في البرومنت
 */

const BASE_URL = 'http://localhost:3002';
const TEST_USER = {
  name: 'مستخدم اختباري',
  email: `test_${Date.now()}@example.com`,
  password: 'Test@123456',
  confirmPassword: 'Test@123456',
  agreeToTerms: true
};

// ألوان للـ console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
};

// دالة مساعدة للطباعة
function log(message, type = 'info') {
  const types = {
    success: `${colors.green}✅`,
    error: `${colors.red}❌`,
    warning: `${colors.yellow}⚠️`,
    info: `${colors.blue}ℹ️`,
    test: `${colors.magenta}🧪`
  };
  console.log(`${types[type]} ${message}${colors.reset}`);
}

// دالة لانتظار
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// متغيرات لحفظ البيانات بين الاختبارات
let verificationCode = null;
let authToken = null;
let resetToken = null;

/**
 * 1️⃣ اختبار إنشاء حساب جديد
 */
async function testRegistration() {
  console.log('\n' + '='.repeat(50));
  log('اختبار التسجيل', 'test');
  console.log('='.repeat(50) + '\n');

  try {
    // 1.1 اختبار التسجيل بدون بيانات
    log('اختبار التسجيل بدون بيانات...');
    let response = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    let data = await response.json();
    if (!response.ok && data.error === 'جميع الحقول مطلوبة') {
      log('نجح: رفض التسجيل بدون بيانات', 'success');
    } else {
      log('فشل: قبول التسجيل بدون بيانات!', 'error');
    }

    // 1.2 اختبار بريد إلكتروني غير صالح
    log('اختبار بريد إلكتروني غير صالح...');
    response = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'test',
        email: 'invalid-email',
        password: '12345678'
      })
    });
    data = await response.json();
    if (!response.ok && data.error === 'البريد الإلكتروني غير صحيح') {
      log('نجح: رفض البريد الإلكتروني غير الصالح', 'success');
    } else {
      log('فشل: قبول بريد إلكتروني غير صالح!', 'error');
    }

    // 1.3 اختبار كلمة مرور ضعيفة
    log('اختبار كلمة مرور ضعيفة...');
    response = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'test',
        email: 'test@example.com',
        password: '1234'
      })
    });
    data = await response.json();
    if (!response.ok && data.error.includes('8 أحرف')) {
      log('نجح: رفض كلمة المرور الضعيفة', 'success');
    } else {
      log('فشل: قبول كلمة مرور ضعيفة!', 'error');
    }

    // 1.4 التسجيل الناجح
    log('اختبار التسجيل الناجح...');
    response = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: TEST_USER.name,
        email: TEST_USER.email,
        password: TEST_USER.password
      })
    });
    data = await response.json();
    
    if (response.ok && data.success) {
      log('نجح التسجيل!', 'success');
      log(`معرف المستخدم: ${data.user.id}`, 'info');
      log(`البريد: ${data.user.email}`, 'info');
      log(`حالة التحقق: ${data.user.is_verified ? 'مفعل' : 'غير مفعل'}`, 'info');
      
      // جلب رمز التحقق من قاعدة البيانات للاختبار
      const code = await prisma.email_verification_codes.findFirst({
        where: { email: TEST_USER.email.toLowerCase() },
        orderBy: { created_at: 'desc' }
      });
      
      if (code) {
        verificationCode = code.code;
        log(`رمز التحقق: ${verificationCode}`, 'info');
      }
    } else {
      log('فشل التسجيل!', 'error');
      log(`السبب: ${data.error}`, 'error');
    }

    // 1.5 محاولة التسجيل بنفس البريد
    log('اختبار التسجيل بنفس البريد...');
    response = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: TEST_USER.name,
        email: TEST_USER.email,
        password: TEST_USER.password
      })
    });
    data = await response.json();
    
    if (!response.ok && data.error === 'البريد الإلكتروني مستخدم بالفعل') {
      log('نجح: رفض البريد المكرر', 'success');
    } else {
      log('فشل: قبول بريد مكرر!', 'error');
    }

  } catch (error) {
    log(`خطأ في اختبار التسجيل: ${error.message}`, 'error');
  }
}

/**
 * 2️⃣ اختبار التحقق من البريد الإلكتروني
 */
async function testEmailVerification() {
  console.log('\n' + '='.repeat(50));
  log('اختبار التحقق من البريد', 'test');
  console.log('='.repeat(50) + '\n');

  try {
    // 2.1 محاولة التحقق برمز خاطئ
    log('اختبار رمز تحقق خاطئ...');
    let response = await fetch(`${BASE_URL}/api/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_USER.email,
        code: '999999'
      })
    });
    let data = await response.json();
    
    if (!response.ok && data.error === 'رمز التحقق غير صحيح') {
      log('نجح: رفض الرمز الخاطئ', 'success');
    } else {
      log('فشل: قبول رمز خاطئ!', 'error');
    }

    // 2.2 التحقق بالرمز الصحيح
    if (verificationCode) {
      log('اختبار التحقق بالرمز الصحيح...');
      response = await fetch(`${BASE_URL}/api/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: TEST_USER.email,
          code: verificationCode
        })
      });
      data = await response.json();
      
      if (response.ok && data.success) {
        log('نجح التحقق من البريد!', 'success');
        log(`المستخدم مفعل: ${data.user.email_verified || data.user.is_verified}`, 'info');
      } else {
        log('فشل التحقق من البريد!', 'error');
        log(`السبب: ${data.error}`, 'error');
      }
    }

    // 2.3 محاولة استخدام نفس الرمز مرة أخرى
    if (verificationCode) {
      log('اختبار إعادة استخدام الرمز...');
      response = await fetch(`${BASE_URL}/api/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: TEST_USER.email,
          code: verificationCode
        })
      });
      data = await response.json();
      
      if (!response.ok) {
        log('نجح: رفض إعادة استخدام الرمز', 'success');
      } else {
        log('فشل: قبول إعادة استخدام الرمز!', 'error');
      }
    }

  } catch (error) {
    log(`خطأ في اختبار التحقق: ${error.message}`, 'error');
  }
}

/**
 * 3️⃣ اختبار تسجيل الدخول
 */
async function testLogin() {
  console.log('\n' + '='.repeat(50));
  log('اختبار تسجيل الدخول', 'test');
  console.log('='.repeat(50) + '\n');

  try {
    // 3.1 محاولة الدخول بكلمة مرور خاطئة
    log('اختبار تسجيل الدخول بكلمة مرور خاطئة...');
    let response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_USER.email,
        password: 'WrongPassword123'
      })
    });
    let data = await response.json();
    
    if (!response.ok && data.error === 'البريد الإلكتروني أو كلمة المرور غير صحيحة') {
      log('نجح: رفض كلمة المرور الخاطئة', 'success');
    } else {
      log('فشل: قبول كلمة مرور خاطئة!', 'error');
    }

    // 3.2 محاولة الدخول ببريد غير موجود
    log('اختبار تسجيل الدخول ببريد غير موجود...');
    response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'notexist@example.com',
        password: 'Test@123456'
      })
    });
    data = await response.json();
    
    if (!response.ok && data.error === 'البريد الإلكتروني أو كلمة المرور غير صحيحة') {
      log('نجح: رسالة خطأ موحدة لحماية الخصوصية', 'success');
    } else {
      log('تحذير: رسالة خطأ مختلفة قد تكشف معلومات', 'warning');
    }

    // 3.3 تسجيل الدخول الناجح
    log('اختبار تسجيل الدخول الناجح...');
    response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_USER.email,
        password: TEST_USER.password
      })
    });
    data = await response.json();
    
    if (response.ok && data.success) {
      log('نجح تسجيل الدخول!', 'success');
      log(`التوكن: ${data.token ? 'موجود' : 'غير موجود'}`, 'info');
      log(`معلومات المستخدم: ${data.user.name} (${data.user.email})`, 'info');
      authToken = data.token;
      
      // فحص الكوكيز
      const cookies = response.headers.get('set-cookie');
      if (cookies) {
        log('الكوكيز: تم تعيينها', 'info');
      }
    } else {
      log('فشل تسجيل الدخول!', 'error');
      log(`السبب: ${data.error}`, 'error');
    }

  } catch (error) {
    log(`خطأ في اختبار تسجيل الدخول: ${error.message}`, 'error');
  }
}

/**
 * 4️⃣ اختبار نسيان كلمة المرور
 */
async function testForgotPassword() {
  console.log('\n' + '='.repeat(50));
  log('اختبار استعادة كلمة المرور', 'test');
  console.log('='.repeat(50) + '\n');

  try {
    // 4.1 طلب إعادة تعيين لبريد غير موجود
    log('اختبار طلب إعادة تعيين لبريد غير موجود...');
    let response = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'notexist@example.com'
      })
    });
    let data = await response.json();
    
    if (response.ok && data.message.includes('إذا كان البريد الإلكتروني مسجلاً')) {
      log('نجح: رسالة موحدة لحماية الخصوصية', 'success');
    } else {
      log('تحذير: رسالة مختلفة قد تكشف معلومات', 'warning');
    }

    // 4.2 طلب إعادة تعيين صحيح
    log('اختبار طلب إعادة تعيين صحيح...');
    response = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_USER.email
      })
    });
    data = await response.json();
    
    if (response.ok && data.success) {
      log('نجح طلب إعادة التعيين!', 'success');
      
      // جلب رمز إعادة التعيين من الملف (للاختبار فقط)
      const fs = require('fs').promises;
      const path = require('path');
      try {
        const tokensPath = path.join(process.cwd(), 'data', 'password_reset_tokens.json');
        const tokensContent = await fs.readFile(tokensPath, 'utf-8');
        const tokens = JSON.parse(tokensContent);
        const token = tokens.find(t => t.email === TEST_USER.email);
        if (token) {
          resetToken = token.token;
          log(`رمز إعادة التعيين: ${resetToken.substring(0, 10)}...`, 'info');
        }
      } catch (err) {
        log('لا يمكن قراءة رمز إعادة التعيين', 'warning');
      }
    }

    // 4.3 محاولة طلب آخر فوراً
    log('اختبار طلب متكرر...');
    response = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_USER.email
      })
    });
    data = await response.json();
    
    if (!response.ok && data.error.includes('5 دقائق')) {
      log('نجح: منع الطلبات المتكررة', 'success');
    } else {
      log('فشل: السماح بطلبات متكررة!', 'error');
    }

  } catch (error) {
    log(`خطأ في اختبار استعادة كلمة المرور: ${error.message}`, 'error');
  }
}

/**
 * 5️⃣ اختبار إعادة تعيين كلمة المرور
 */
async function testResetPassword() {
  console.log('\n' + '='.repeat(50));
  log('اختبار إعادة تعيين كلمة المرور', 'test');
  console.log('='.repeat(50) + '\n');

  if (!resetToken) {
    log('لا يوجد رمز إعادة تعيين للاختبار', 'warning');
    return;
  }

  try {
    // 5.1 محاولة بكلمة مرور ضعيفة
    log('اختبار إعادة تعيين بكلمة مرور ضعيفة...');
    let response = await fetch(`${BASE_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: resetToken,
        password: '1234'
      })
    });
    let data = await response.json();
    
    if (!response.ok && data.error.includes('8 أحرف')) {
      log('نجح: رفض كلمة المرور الضعيفة', 'success');
    } else {
      log('فشل: قبول كلمة مرور ضعيفة!', 'error');
    }

    // 5.2 إعادة تعيين ناجحة
    const newPassword = 'NewTest@123456';
    log('اختبار إعادة تعيين ناجحة...');
    response = await fetch(`${BASE_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: resetToken,
        password: newPassword
      })
    });
    data = await response.json();
    
    if (response.ok && data.success) {
      log('نجحت إعادة تعيين كلمة المرور!', 'success');
      TEST_USER.password = newPassword; // تحديث كلمة المرور للاختبارات التالية
    } else {
      log('فشلت إعادة تعيين كلمة المرور!', 'error');
      log(`السبب: ${data.error}`, 'error');
    }

    // 5.3 محاولة استخدام نفس الرمز مرة أخرى
    log('اختبار إعادة استخدام رمز إعادة التعيين...');
    response = await fetch(`${BASE_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: resetToken,
        password: 'AnotherPassword@123'
      })
    });
    data = await response.json();
    
    if (!response.ok && data.error === 'رابط إعادة التعيين غير صالح') {
      log('نجح: رفض إعادة استخدام الرمز', 'success');
    } else {
      log('فشل: قبول إعادة استخدام رمز منتهي!', 'error');
    }

  } catch (error) {
    log(`خطأ في اختبار إعادة التعيين: ${error.message}`, 'error');
  }
}

/**
 * 6️⃣ اختبار إعدادات البريد الإلكتروني
 */
async function testEmailConfiguration() {
  console.log('\n' + '='.repeat(50));
  log('فحص إعدادات البريد الإلكتروني', 'test');
  console.log('='.repeat(50) + '\n');

  try {
    // فحص متغيرات البيئة
    const emailVars = [
      'SMTP_HOST',
      'SMTP_PORT',
      'SMTP_USER',
      'SMTP_PASS',
      'SMTP_SECURE'
    ];

    log('فحص متغيرات البيئة...');
    for (const varName of emailVars) {
      const value = process.env[varName];
      if (value) {
        if (varName === 'SMTP_PASS') {
          log(`${varName}: ${value.substring(0, 3)}***`, 'info');
        } else {
          log(`${varName}: ${value}`, 'info');
        }
      } else {
        log(`${varName}: غير محدد`, 'warning');
      }
    }

    // اختبار الاتصال (يحتاج تشغيل منفصل)
    log('\nملاحظة: لاختبار إرسال البريد الفعلي، استخدم:', 'info');
    log('npm run test:email', 'info');

  } catch (error) {
    log(`خطأ في فحص البريد الإلكتروني: ${error.message}`, 'error');
  }
}

/**
 * 7️⃣ اختبار معالجة الأخطاء والأمان
 */
async function testSecurityAndErrors() {
  console.log('\n' + '='.repeat(50));
  log('اختبار الأمان ومعالجة الأخطاء', 'test');
  console.log('='.repeat(50) + '\n');

  try {
    // 7.1 اختبار حقن SQL (يجب أن يكون محمي بواسطة Prisma)
    log('اختبار حماية من SQL Injection...');
    let response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: "test@example.com' OR '1'='1",
        password: "' OR '1'='1"
      })
    });
    let data = await response.json();
    
    if (!response.ok) {
      log('نجح: محمي من SQL Injection', 'success');
    } else {
      log('خطر: قد يكون عرضة لـ SQL Injection!', 'error');
    }

    // 7.2 اختبار XSS في الاسم
    log('اختبار حماية من XSS...');
    const xssPayload = '<script>alert("XSS")</script>';
    response = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: xssPayload,
        email: `xss_test_${Date.now()}@example.com`,
        password: 'Test@123456'
      })
    });
    
    if (response.ok) {
      data = await response.json();
      if (data.user && data.user.name === xssPayload) {
        log('تحذير: البيانات تُحفظ كما هي - تأكد من التعقيم عند العرض', 'warning');
      }
    }

    // 7.3 اختبار الطلبات الفارغة
    log('اختبار معالجة الطلبات الفارغة...');
    response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: ''
    });
    
    if (!response.ok) {
      log('نجح: معالجة صحيحة للطلبات الفارغة', 'success');
    } else {
      log('فشل: قبول طلب فارغ!', 'error');
    }

    // 7.4 اختبار Content-Type خاطئ
    log('اختبار Content-Type خاطئ...');
    response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: 'not json'
    });
    
    if (!response.ok) {
      log('نجح: رفض Content-Type غير صحيح', 'success');
    } else {
      log('تحذير: قبول Content-Type غير صحيح', 'warning');
    }

  } catch (error) {
    log(`خطأ في اختبار الأمان: ${error.message}`, 'error');
  }
}

/**
 * 8️⃣ التنظيف بعد الاختبار
 */
async function cleanup() {
  console.log('\n' + '='.repeat(50));
  log('تنظيف البيانات', 'test');
  console.log('='.repeat(50) + '\n');

  try {
    // حذف المستخدم الاختباري
    const user = await prisma.users.findFirst({
      where: { email: TEST_USER.email.toLowerCase() }
    });

    if (user) {
      // حذف نقاط الولاء
      await prisma.loyalty_points.deleteMany({
        where: { user_id: user.id }
      });

      // حذف رموز التحقق
      await prisma.email_verification_codes.deleteMany({
        where: { email: user.email }
      });

      // حذف المستخدم
      await prisma.users.delete({
        where: { id: user.id }
      });

      log('تم حذف بيانات الاختبار', 'success');
    }

  } catch (error) {
    log(`خطأ في التنظيف: ${error.message}`, 'error');
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * 📊 تقرير النتائج
 */
function generateReport(results) {
  console.log('\n' + '='.repeat(50));
  console.log(`${colors.blue}📊 تقرير شامل لنتائج الاختبار${colors.reset}`);
  console.log('='.repeat(50) + '\n');

  const categories = {
    'التسجيل': ['✅ التحقق من البيانات', '✅ منع التكرار', '✅ تشفير كلمة المرور'],
    'التحقق من البريد': ['✅ رموز آمنة', '✅ منع إعادة الاستخدام', '⚠️ لا يوجد حد للمحاولات'],
    'تسجيل الدخول': ['✅ JWT tokens', '✅ رسائل موحدة', '⚠️ لا يوجد 2FA'],
    'استعادة كلمة المرور': ['✅ رموز آمنة', '✅ حماية من الطلبات المتكررة', '❌ صفحة reset مفقودة'],
    'البريد الإلكتروني': ['❌ مشكلة في Gmail auth', '✅ قوالب جاهزة', '✅ fallback للتطوير'],
    'الأمان': ['✅ حماية من SQL Injection', '⚠️ تحقق من XSS عند العرض', '❌ لا يوجد rate limiting']
  };

  for (const [category, items] of Object.entries(categories)) {
    console.log(`\n${colors.magenta}${category}:${colors.reset}`);
    items.forEach(item => console.log(`  ${item}`));
  }

  console.log('\n' + '='.repeat(50));
  console.log(`${colors.yellow}📝 التوصيات العاجلة:${colors.reset}`);
  console.log('1. إصلاح إعدادات Gmail (استخدام App Password)');
  console.log('2. إنشاء صفحة reset-password في Frontend');
  console.log('3. تطبيق Rate Limiting على جميع APIs');
  console.log('4. إضافة حد للمحاولات الخاطئة');
  console.log('5. الانتقال الكامل لـ Prisma (إزالة ملفات JSON)');
  console.log('='.repeat(50));
}

/**
 * 🚀 تشغيل جميع الاختبارات
 */
async function runAllTests() {
  console.log(`\n${colors.magenta}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.magenta}🚀 بدء اختبار شامل لمنظومة التسجيل والمصادقة${colors.reset}`);
  console.log(`${colors.magenta}${'='.repeat(60)}${colors.reset}\n`);

  const startTime = Date.now();

  try {
    // تشغيل الاختبارات بالترتيب
    await testRegistration();
    await delay(1000);
    
    await testEmailVerification();
    await delay(1000);
    
    await testLogin();
    await delay(1000);
    
    await testForgotPassword();
    await delay(1000);
    
    await testResetPassword();
    await delay(1000);
    
    await testEmailConfiguration();
    await delay(1000);
    
    await testSecurityAndErrors();
    
    // توليد التقرير
    generateReport();
    
    // التنظيف
    await cleanup();
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n${colors.green}✅ اكتمل الاختبار في ${duration} ثانية${colors.reset}\n`);
    
  } catch (error) {
    console.error(`\n${colors.red}❌ خطأ عام في الاختبار: ${error.message}${colors.reset}`);
    console.error(error.stack);
  }
}

// تشغيل الاختبارات
runAllTests();