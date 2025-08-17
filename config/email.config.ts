// إعدادات البريد الإلكتروني لموقع سبق مع Gmail

export const emailConfig = {
  // إعدادات SMTP للبريد الصادر
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: process.env.SMTP_SECURE === 'true', // true for port 465, false for port 587
    auth: {
      user: process.env.SMTP_USER || 'sabqai@sabq.ai',
      pass: process.env.SMTP_PASS || '' // يجب استخدام App Password
    },
    tls: {
      ciphers: 'SSLv3',
      rejectUnauthorized: process.env.NODE_ENV === 'production'
    }
  },
  
  // معلومات المرسل
  from: {
    name: process.env.EMAIL_FROM_NAME || 'صحيفة سبق',
    email: process.env.EMAIL_FROM_ADDRESS || 'sabqai@sabq.ai'
  },
  
  // إعدادات عامة
  general: {
    enableVerification: process.env.ENABLE_EMAIL_VERIFICATION === 'true',
    skipVerification: process.env.SKIP_EMAIL_VERIFICATION === 'true',
    verificationExpiry: 24 * 60 * 60 * 1000, // 24 ساعة
    resetPasswordExpiry: 60 * 60 * 1000, // ساعة واحدة
  },
  
  // قوالب البريد
  templates: {
    verification: {
      subject: 'تأكيد حسابك في صحيفة سبق',
      preview: 'مرحباً بك في صحيفة سبق! يرجى تأكيد بريدك الإلكتروني'
    },
    resetPassword: {
      subject: 'إعادة تعيين كلمة المرور - صحيفة سبق',
      preview: 'لقد طلبت إعادة تعيين كلمة المرور'
    },
    welcome: {
      subject: 'مرحباً بك في صحيفة سبق!',
      preview: 'شكراً لانضمامك إلى مجتمع سبق'
    }
  },
  
  // إعدادات Gmail المحددة
  gmail: {
    smtp: {
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: 'sabqai@sabq.ai',
        pass: process.env.SMTP_PASS || ''
      }
    },
    smtp_alt: {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: 'sabqai@sabq.ai',
        pass: process.env.SMTP_PASS || ''
      }
    }
  },
  
  // إعدادات بديلة (للتطوير)
  development: {
    host: process.env.DEV_SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.DEV_SMTP_PORT || '465'),
    auth: {
      user: process.env.DEV_SMTP_USER || process.env.SMTP_USER,
      pass: process.env.DEV_SMTP_PASS || process.env.SMTP_PASS
    }
  }
};

// إعدادات خادم البريد الوارد (IMAP)
export const incomingMailConfig = {
  imap: {
    host: 'imap.gmail.com',
    port: 993,
    secure: true,
    auth: {
      user: 'sabqai@sabq.ai',
      pass: process.env.SMTP_PASS || ''
    }
  },
  pop3: {
    host: 'pop.gmail.com',
    port: 995,
    secure: true,
    auth: {
      user: 'sabqai@sabq.ai',
      pass: process.env.SMTP_PASS || ''
    }
  }
};

// دالة مساعدة للحصول على إعدادات SMTP الصحيحة
export function getSmtpConfig() {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const useDevConfig = isDevelopment && process.env.USE_DEV_EMAIL === 'true';
  
  if (useDevConfig) {
    return emailConfig.development;
  }
  
  // استخدام إعدادات Gmail كافتراضي
  return emailConfig.gmail.smtp;
}

// دالة للحصول على إعدادات IMAP
export function getImapConfig() {
  return incomingMailConfig.imap;
} 