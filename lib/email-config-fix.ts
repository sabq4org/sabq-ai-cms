// إصلاح إعدادات البريد الإلكتروني بناءً على الخادم والمنفذ

export function getCorrectEmailConfig() {
  // استخدام إعدادات Gmail من متغيرات البيئة
  let host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '465');
  
  // تحديد إعدادات secure بناءً على المنفذ
  let secure: boolean;
  let requireTLS: boolean = false;
  let rejectUnauthorized: boolean = true;
  
  if (port === 465) {
    // SSL/TLS مباشر
    secure = true;
  } else if (port === 587) {
    // STARTTLS
    secure = false;
    requireTLS = true;
  } else {
    // افتراضي
    secure = port === 465;
  }
  
  // إعدادات خاصة لـ Gmail
  if (host.includes('gmail.com')) {
    if (port === 587) {
      secure = false;
      requireTLS = true;
    } else if (port === 465) {
      secure = true;
    }
  }
  
  const config = {
    host,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER || 'ai@sabq.org',
      pass: process.env.SMTP_PASS || 'MyY&RXSne=Wb2gM>'
    },
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === 'production' ? true : false,
      minVersion: 'TLSv1.2'
    },
    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 30000,
    logger: process.env.EMAIL_DEBUG === 'true',
    debug: process.env.EMAIL_DEBUG === 'true'
  };
  
  // إضافة requireTLS إذا لزم الأمر
  if (requireTLS) {
    (config as any).requireTLS = true;
  }
  
  console.log('📧 إعدادات البريد المصححة:', {
    host: config.host,
    port: config.port,
    secure: config.secure,
    requireTLS,
    user: config.auth.user
  });
  
  return config;
} 