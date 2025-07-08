#!/usr/bin/env node

/**
 * سكريبت اختبار سريع لـ Supabase
 * يختبر الاتصال والمصادقة وجلب البيانات
 */

const { createClient } = require('@supabase/supabase-js');

// متغيرات البيئة
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const TEST_EMAIL = process.env.TEST_EMAIL || 'test@example.com';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'Test123456';

// ألوان للإخراج
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

// دالة الطباعة الملونة
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function runTests() {
  log('🔍 بدء اختبار Supabase...', 'blue');
  log('=====================================\n', 'blue');

  // التحقق من المتغيرات
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    log('❌ خطأ: متغيرات Supabase مفقودة!', 'red');
    log('تأكد من وجود:', 'yellow');
    log('- NEXT_PUBLIC_SUPABASE_URL', 'yellow');
    log('- NEXT_PUBLIC_SUPABASE_ANON_KEY', 'yellow');
    process.exit(1);
  }

  log('✅ متغيرات البيئة موجودة', 'green');
  log(`URL: ${SUPABASE_URL}`, 'blue');
  log(`Key: ${SUPABASE_ANON_KEY.substring(0, 20)}...`, 'blue');
  log('');

  // إنشاء عميل Supabase
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // 1. اختبار جلب التصنيفات (بدون مصادقة)
  log('📋 اختبار 1: جلب التصنيفات (بدون مصادقة)...', 'yellow');
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, slug')
      .limit(5);

    if (error) {
      log(`❌ فشل: ${error.message}`, 'red');
      if (error.message.includes('row-level security')) {
        log('💡 تلميح: يبدو أن RLS مفعّل ويمنع القراءة', 'yellow');
      }
    } else {
      log(`✅ نجح! تم جلب ${data.length} تصنيف`, 'green');
      data.forEach(cat => {
        log(`   - ${cat.name} (${cat.slug})`, 'blue');
      });
    }
  } catch (err) {
    log(`❌ خطأ غير متوقع: ${err.message}`, 'red');
  }
  log('');

  // 2. اختبار تسجيل الدخول
  log('🔐 اختبار 2: تسجيل الدخول...', 'yellow');
  log(`البريد: ${TEST_EMAIL}`, 'blue');
  
  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });

    if (authError) {
      log(`❌ فشل تسجيل الدخول: ${authError.message}`, 'red');
      
      // محاولة إنشاء حساب جديد
      log('📝 محاولة إنشاء حساب جديد...', 'yellow');
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        options: {
          data: {
            name: 'Test User'
          }
        }
      });

      if (signUpError) {
        log(`❌ فشل إنشاء الحساب: ${signUpError.message}`, 'red');
      } else {
        log('✅ تم إنشاء حساب جديد!', 'green');
        log(`User ID: ${signUpData.user?.id}`, 'blue');
      }
    } else {
      log('✅ تسجيل الدخول نجح!', 'green');
      log(`User ID: ${authData.user?.id}`, 'blue');
      log(`Email: ${authData.user?.email}`, 'blue');
      
      // 3. اختبار جلب بيانات المستخدم
      log('\n👤 اختبار 3: جلب بيانات المستخدم...', 'yellow');
      
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (userError) {
        log(`❌ فشل جلب بيانات المستخدم: ${userError.message}`, 'red');
      } else {
        log('✅ تم جلب بيانات المستخدم!', 'green');
        log(`الاسم: ${userData.name || 'غير محدد'}`, 'blue');
        log(`البريد: ${userData.email}`, 'blue');
        log(`مدير: ${userData.is_admin ? 'نعم' : 'لا'}`, 'blue');
      }

      // 4. اختبار جلب البيانات كمستخدم مصادق عليه
      log('\n📚 اختبار 4: جلب المقالات (كمستخدم مصادق عليه)...', 'yellow');
      
      const { data: articles, error: articlesError } = await supabase
        .from('articles')
        .select('id, title, is_published')
        .eq('is_published', true)
        .limit(5);

      if (articlesError) {
        log(`❌ فشل جلب المقالات: ${articlesError.message}`, 'red');
      } else {
        log(`✅ تم جلب ${articles.length} مقال`, 'green');
        articles.forEach(article => {
          log(`   - ${article.title}`, 'blue');
        });
      }

      // تسجيل الخروج
      await supabase.auth.signOut();
      log('\n🚪 تم تسجيل الخروج', 'blue');
    }
  } catch (err) {
    log(`❌ خطأ غير متوقع: ${err.message}`, 'red');
  }

  // 5. اختبار REST API مباشرة
  log('\n🌐 اختبار 5: REST API مباشرة...', 'yellow');
  
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/categories?limit=1`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    const data = await response.json();
    
    if (response.ok) {
      log('✅ REST API يعمل!', 'green');
      log(`Response: ${JSON.stringify(data).substring(0, 100)}...`, 'blue');
    } else {
      log(`❌ REST API فشل: ${response.status}`, 'red');
      log(`Error: ${JSON.stringify(data)}`, 'red');
    }
  } catch (err) {
    log(`❌ خطأ في REST API: ${err.message}`, 'red');
  }

  log('\n=====================================', 'blue');
  log('✅ اكتمل الاختبار!', 'green');
}

// تشغيل الاختبارات
runTests().catch(err => {
  log(`\n❌ خطأ عام: ${err.message}`, 'red');
  process.exit(1);
}); 