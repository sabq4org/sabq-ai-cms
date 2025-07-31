// اختبار إرسال بريد التحقق
// استخدم: node scripts/test-email-verification.js

const nodemailer = require('nodemailer');

// إعدادات البريد الإلكتروني
const emailConfig = {
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: 'ai@sabq.org',
    pass: 'MyY&RXSne=Wb2gM>'
  },
  tls: {
    rejectUnauthorized: false
  }
};

// إنشاء transporter
const transporter = nodemailer.createTransport(emailConfig);

// توليد رمز التحقق
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// قالب البريد الإلكتروني
function getEmailTemplate(name, code) {
  return `
    <div style="direction: rtl; font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #3B82F6;">صحيفة سبق</h1>
      </div>
      
      <h2 style="color: #1F2937;">مرحبًا ${name} 👋</h2>
      
      <p style="color: #4B5563; line-height: 1.8;">
        نشكرك على انضمامك إلى منصة سبق ✅<br>
        يرجى تأكيد عنوان بريدك الإلكتروني باستخدام الرمز التالي:
      </p>
      
      <div style="background: #F3F4F6; border: 2px solid #E5E7EB; border-radius: 10px; padding: 20px; text-align: center; margin: 30px 0;">
        <h1 style="color: #3B82F6; font-size: 36px; letter-spacing: 5px; margin: 0;">${code}</h1>
        <p style="color: #6B7280; margin-top: 10px;">صالح لمدة 10 دقائق</p>
      </div>
      
      <p style="color: #6B7280; font-size: 14px;">
        إذا لم تقم بإنشاء حساب، تجاهل هذه الرسالة.
      </p>
      
      <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">
      
      <p style="color: #9CA3AF; font-size: 12px; text-align: center;">
        تحياتنا،<br>
        فريق سبق
      </p>
    </div>
  `;
}

// إرسال بريد التحقق
async function sendVerificationEmail() {
  // البريد المستلم - يمكنك تغييره للاختبار
  const recipientEmail = 'test@example.com';
  const name = 'مستخدم الاختبار';
  const code = generateVerificationCode();
  
  console.log(`🔑 رمز التحقق: ${code}`);
  
  try {
    // التحقق من الاتصال
    console.log('🔄 التحقق من الاتصال بخادم البريد...');
    await transporter.verify();
    console.log('✅ الاتصال بخادم البريد ناجح');
    
    // إرسال البريد
    console.log(`📧 إرسال بريد التحقق إلى ${recipientEmail}...`);
    const info = await transporter.sendMail({
      from: `"صحيفة سبق" <ai@sabq.org>`,
      to: recipientEmail,
      subject: 'تأكيد بريدك الإلكتروني - صحيفة سبق',
      html: getEmailTemplate(name, code),
      text: `مرحباً ${name}. لتأكيد بريدك الإلكتروني، يرجى استخدام الرمز التالي: ${code}`
    });
    
    console.log('✅ تم إرسال البريد بنجاح');
    console.log(`📨 معرف الرسالة: ${info.messageId}`);
    console.log(`📬 معاينة الرابط: ${nodemailer.getTestMessageUrl(info)}`);
    
    return true;
  } catch (error) {
    console.error('❌ خطأ في إرسال البريد:', error);
    return false;
  }
}

// تنفيذ الاختبار
sendVerificationEmail()
  .then(result => {
    if (result) {
      console.log('✅ اكتمل اختبار البريد بنجاح');
    } else {
      console.error('❌ فشل اختبار البريد');
    }
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ خطأ غير متوقع:', error);
    process.exit(1);
  });