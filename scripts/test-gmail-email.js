const nodemailer = require('nodemailer');
require('dotenv').config({ path: '.env.local' });

console.log('🧪 اختبار البريد الإلكتروني مع Gmail');
console.log('=====================================');
console.log('');

// التحقق من وجود الإعدادات
if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
  console.error('❌ لم يتم العثور على إعدادات البريد الإلكتروني!');
  console.log('تأكد من وجود ملف .env.local مع الإعدادات المطلوبة');
  console.log('يمكنك تشغيل: bash scripts/setup-gmail-email.sh');
  process.exit(1);
}

// إنشاء transporter
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// التحقق من الاتصال
console.log('🔄 التحقق من الاتصال بخادم البريد...');
console.log(`📧 البريد: ${process.env.SMTP_USER}`);
console.log(`📤 الخادم: ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}`);
console.log('');

transporter.verify((error, success) => {
  if (error) {
    console.error('❌ فشل في الاتصال بخادم البريد:');
    console.error(error.message);
    console.log('');
    console.log('🔧 حلول محتملة:');
    console.log('1. تأكد من تفعيل المصادقة الثنائية في Gmail');
    console.log('2. تأكد من إنشاء كلمة مرور التطبيق (App Password)');
    console.log('3. تأكد من صحة البريد الإلكتروني وكلمة المرور');
    console.log('4. تأكد من السماح للتطبيقات الأقل أماناً (إذا لم تستخدم App Password)');
    process.exit(1);
  } else {
    console.log('✅ تم الاتصال بنجاح بخادم البريد!');
    console.log('');
    
    // إرسال بريد اختبار
    console.log('📤 إرسال بريد اختبار...');
    
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'صحيفة سبق'}" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER, // إرسال إلى نفس البريد للاختبار
      subject: 'اختبار البريد الإلكتروني - صحيفة سبق',
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: #fff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #2c3e50; text-align: center; margin-bottom: 20px;">✅ اختبار البريد الإلكتروني</h2>
            <p style="color: #34495e; line-height: 1.6; margin-bottom: 15px;">
              مرحباً بك في صحيفة سبق!
            </p>
            <p style="color: #34495e; line-height: 1.6; margin-bottom: 15px;">
              هذا بريد اختبار للتأكد من أن إعدادات البريد الإلكتروني تعمل بشكل صحيح.
            </p>
            <div style="background-color: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="color: #27ae60; margin: 0; font-weight: bold;">
                ✅ تم إعداد البريد الإلكتروني بنجاح!
              </p>
            </div>
            <p style="color: #7f8c8d; font-size: 14px; text-align: center; margin-top: 30px;">
              تم إرسال هذا البريد في: ${new Date().toLocaleString('ar-SA')}
            </p>
          </div>
        </div>
      `,
      text: `
        اختبار البريد الإلكتروني - صحيفة سبق
        
        مرحباً بك في صحيفة سبق!
        
        هذا بريد اختبار للتأكد من أن إعدادات البريد الإلكتروني تعمل بشكل صحيح.
        
        ✅ تم إعداد البريد الإلكتروني بنجاح!
        
        تم إرسال هذا البريد في: ${new Date().toLocaleString('ar-SA')}
      `
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('❌ فشل في إرسال البريد:');
        console.error(error.message);
        process.exit(1);
      } else {
        console.log('✅ تم إرسال بريد الاختبار بنجاح!');
        console.log(`📧 Message ID: ${info.messageId}`);
        console.log('');
        console.log('📋 ملخص الإعدادات:');
        console.log('==================');
        console.log(`📧 البريد الإلكتروني: ${process.env.SMTP_USER}`);
        console.log(`📤 SMTP Server: ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}`);
        console.log(`📥 IMAP Server: imap.gmail.com:993`);
        console.log(`🔒 الأمان: SSL/TLS`);
        console.log('');
        console.log('✅ البريد الإلكتروني جاهز للاستخدام!');
        console.log('🚀 يمكنك الآن استخدام رسائل التحقق وإعادة تعيين كلمة المرور');
      }
    });
  }
}); 