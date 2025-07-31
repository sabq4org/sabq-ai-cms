const nodemailer = require('nodemailer');
require('dotenv').config({ path: '.env.local' });

/**
 * 📧 سكريبت اختبار إعدادات البريد الإلكتروني
 * يساعد في تشخيص وحل مشاكل إرسال البريد
 */

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
};

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

async function testEmailSetup() {
  console.log('\n' + '='.repeat(50));
  log('اختبار إعدادات البريد الإلكتروني', 'test');
  console.log('='.repeat(50) + '\n');

  // 1. فحص متغيرات البيئة
  log('فحص متغيرات البيئة...', 'info');
  
  const requiredVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];
  const missingVars = [];
  
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missingVars.push(varName);
      log(`${varName}: غير محدد`, 'error');
    } else {
      if (varName === 'SMTP_PASS') {
        log(`${varName}: ${process.env[varName].substring(0, 4)}****`, 'info');
      } else {
        log(`${varName}: ${process.env[varName]}`, 'info');
      }
    }
  }

  if (missingVars.length > 0) {
    log(`\nمتغيرات مفقودة: ${missingVars.join(', ')}`, 'error');
    log('يرجى تحديث ملف .env.local بالإعدادات المطلوبة', 'warning');
    return;
  }

  // 2. إنشاء Transporter
  log('\nإنشاء اتصال SMTP...', 'info');
  
  const smtpConfig = {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    // إعدادات إضافية للتشخيص
    logger: true,
    debug: true,
    tls: {
      // في حالة مشاكل الشهادات
      rejectUnauthorized: process.env.NODE_ENV === 'production'
    }
  };

  try {
    const transporter = nodemailer.createTransport(smtpConfig);
    
    // 3. التحقق من الاتصال
    log('\nالتحقق من الاتصال...', 'info');
    
    await transporter.verify();
    log('الاتصال بخادم SMTP ناجح!', 'success');
    
    // 4. إرسال رسالة اختبارية
    const testEmail = process.env.TEST_EMAIL || process.env.SMTP_USER;
    
    log(`\nإرسال رسالة اختبارية إلى: ${testEmail}`, 'info');
    
    const info = await transporter.sendMail({
      from: `"سبق - اختبار" <${process.env.SMTP_USER}>`,
      to: testEmail,
      subject: 'اختبار إعدادات البريد الإلكتروني ✅',
      html: `
        <div style="direction: rtl; text-align: right; font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #4CAF50;">🎉 مبروك! البريد الإلكتروني يعمل بنجاح</h2>
          
          <p style="font-size: 16px; line-height: 1.6;">
            هذه رسالة اختبارية من نظام سبق للتأكد من أن إعدادات البريد الإلكتروني تعمل بشكل صحيح.
          </p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">معلومات الإرسال:</h3>
            <ul style="list-style: none; padding: 0;">
              <li>📧 المرسل: ${process.env.SMTP_USER}</li>
              <li>🏢 الخادم: ${process.env.SMTP_HOST}</li>
              <li>🔌 المنفذ: ${process.env.SMTP_PORT}</li>
              <li>🔒 الأمان: ${process.env.SMTP_SECURE === 'true' ? 'SSL/TLS' : 'STARTTLS'}</li>
              <li>📅 التاريخ: ${new Date().toLocaleString('ar-SA')}</li>
            </ul>
          </div>
          
          <div style="background-color: #e8f5e9; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #2e7d32;">✅ ما يعمل الآن:</h3>
            <ul>
              <li>رسائل التحقق من البريد الإلكتروني</li>
              <li>رسائل الترحيب بالمستخدمين الجدد</li>
              <li>رسائل استعادة كلمة المرور</li>
              <li>الإشعارات العامة</li>
            </ul>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666;">
            <p style="margin: 5px 0;">صحيفة سبق الإلكترونية</p>
            <p style="margin: 5px 0; font-size: 12px;">
              هذه رسالة تلقائية، يرجى عدم الرد عليها
            </p>
          </div>
        </div>
      `,
      text: 'مبروك! البريد الإلكتروني يعمل بنجاح. هذه رسالة اختبارية من نظام سبق.'
    });
    
    log('تم إرسال الرسالة بنجاح!', 'success');
    log(`معرف الرسالة: ${info.messageId}`, 'info');
    log(`الرد من الخادم: ${info.response}`, 'info');
    
    // 5. نصائح إضافية
    console.log('\n' + '='.repeat(50));
    log('نصائح وملاحظات', 'info');
    console.log('='.repeat(50) + '\n');
    
    if (process.env.SMTP_HOST === 'smtp.gmail.com') {
      log('لاحظت أنك تستخدم Gmail:', 'info');
      log('1. تأكد من استخدام App Password وليس كلمة المرور العادية', 'warning');
      log('2. اذهب إلى: https://myaccount.google.com/apppasswords', 'info');
      log('3. راجع الدليل: docs/GMAIL_APP_PASSWORD_SETUP.md', 'info');
    }
    
    log('\nالخطوات التالية:', 'info');
    log('1. تحقق من صندوق الوارد (وملف الرسائل غير المرغوبة)', 'info');
    log('2. إذا وصلت الرسالة، فالنظام جاهز للعمل!', 'info');
    log('3. إذا لم تصل، راجع إعدادات Gmail أو جرب خدمة أخرى', 'info');
    
  } catch (error) {
    log('فشل الاختبار!', 'error');
    console.error('\nتفاصيل الخطأ:', error);
    
    // تشخيص الأخطاء الشائعة
    console.log('\n' + '='.repeat(50));
    log('تشخيص المشكلة', 'warning');
    console.log('='.repeat(50) + '\n');
    
    if (error.code === 'EAUTH') {
      log('مشكلة في المصادقة:', 'error');
      log('1. تأكد من أن البريد الإلكتروني صحيح', 'info');
      log('2. إذا كنت تستخدم Gmail:', 'info');
      log('   - استخدم App Password وليس كلمة المرور العادية', 'warning');
      log('   - فعّل التحقق بخطوتين أولاً', 'info');
      log('   - اتبع الدليل: docs/GMAIL_APP_PASSWORD_SETUP.md', 'info');
    } else if (error.code === 'ECONNECTION') {
      log('مشكلة في الاتصال:', 'error');
      log('1. تحقق من اتصال الإنترنت', 'info');
      log('2. تأكد من إعدادات الجدار الناري', 'info');
      log('3. جرب منفذ آخر (465 مع secure: true)', 'info');
    } else if (error.code === 'ETIMEDOUT') {
      log('انتهت مهلة الاتصال:', 'error');
      log('1. الخادم قد يكون محجوباً', 'info');
      log('2. جرب استخدام VPN', 'info');
      log('3. أو استخدم خدمة بديلة مثل SendGrid', 'info');
    }
    
    // حلول بديلة
    console.log('\n' + '='.repeat(50));
    log('حلول بديلة', 'info');
    console.log('='.repeat(50) + '\n');
    
    log('1. SendGrid (سهل ومجاني):', 'info');
    log('   - سجل في: https://sendgrid.com', 'info');
    log('   - احصل على API Key', 'info');
    log('   - استخدم: EMAIL_PROVIDER=sendgrid', 'info');
    
    log('\n2. وضع التطوير (بدون إرسال فعلي):', 'info');
    log('   - SKIP_EMAIL_VERIFICATION=true', 'info');
    log('   - سيظهر رمز التحقق في Console', 'info');
    
    log('\n3. استخدام MailHog للتطوير المحلي:', 'info');
    log('   - docker run -p 1025:1025 -p 8025:8025 mailhog/mailhog', 'info');
    log('   - SMTP_HOST=localhost', 'info');
    log('   - SMTP_PORT=1025', 'info');
  }
}

// تشغيل الاختبار
console.log(`${colors.magenta}🚀 بدء اختبار إعدادات البريد الإلكتروني...${colors.reset}\n`);
testEmailSetup();