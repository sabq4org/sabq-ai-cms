import nodemailer from 'nodemailer';
import prisma from '@/lib/prisma';

// أنواع مزودي البريد
type EmailProvider = 'smtp' | 'sendgrid' | 'mailgun' | 'ses';

interface EmailConfig {
  provider: EmailProvider;
  from: {
    name: string;
    email: string;
  };
  smtp?: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  };
  sendgrid?: {
    apiKey: string;
  };
  mailgun?: {
    apiKey: string;
    domain: string;
  };
  ses?: {
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
  };
}

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  headers?: Record<string, string>;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
  }>;
}

export class EmailService {
  private config: EmailConfig;
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    // تحميل الإعدادات من متغيرات البيئة
    this.config = this.loadConfig();
    
    // تجنب تهيئة SMTP أثناء البناء أو في بيئة CI/CD
    if (process.env.NODE_ENV !== 'development' && 
        (process.env.VERCEL_ENV === 'preview' || 
         process.env.CI === 'true' || 
         process.env.BUILDING === 'true' ||
         typeof window === 'undefined' && !process.env.SMTP_PASS)) {
      console.log('⏸️ Skipping email service initialization during build');
      return;
    }
    
    this.initializeTransporter();
  }

  private loadConfig(): EmailConfig {
    const provider = (process.env.EMAIL_PROVIDER || 'smtp') as EmailProvider;
    
    const config: EmailConfig = {
      provider,
      from: {
        name: process.env.EMAIL_FROM_NAME || 'صحيفة سبق',
        email: process.env.EMAIL_FROM_ADDRESS || 'sabqai@sabq.ai'
      }
    };

    switch (provider) {
      case 'smtp':
        config.smtp = {
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.SMTP_PORT || '465'),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER || 'sabqai@sabq.ai',
            pass: process.env.SMTP_PASS || ''
          }
        };
        break;
      
      case 'sendgrid':
        config.sendgrid = {
          apiKey: process.env.SENDGRID_API_KEY || ''
        };
        break;
      
      case 'mailgun':
        config.mailgun = {
          apiKey: process.env.MAILGUN_API_KEY || '',
          domain: process.env.MAILGUN_DOMAIN || ''
        };
        break;
      
      case 'ses':
        config.ses = {
          region: process.env.AWS_REGION || process.env.S3_REGION || 'us-east-1',
          accessKeyId: process.env.ACCESS_KEY || process.env.AWS_ACCESS_KEY_ID || process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY || process.env.S3_SECRET_ACCESS_KEY || ''
        };
        break;
    }

    return config;
  }

  private async initializeTransporter() {
    try {
      switch (this.config.provider) {
        case 'smtp':
          this.transporter = nodemailer.createTransport({
            host: this.config.smtp!.host,
            port: this.config.smtp!.port,
            secure: this.config.smtp!.secure,
            auth: this.config.smtp!.auth
          });
          break;
        
        case 'sendgrid':
          // يمكن استخدام nodemailer-sendgrid
          this.transporter = nodemailer.createTransport({
            service: 'SendGrid',
            auth: {
              user: 'apikey',
              pass: this.config.sendgrid!.apiKey
            }
          });
          break;
        
        case 'mailgun':
          this.transporter = await this.createMailgunTransporter(this.config.mailgun!);
          break;
        
        case 'ses':
          // يمكن استخدام @aws-sdk/client-ses
          const aws = require('@aws-sdk/client-ses');
          const ses = new aws.SES({
            region: this.config.ses!.region,
            credentials: {
              accessKeyId: this.config.ses!.accessKeyId,
              secretAccessKey: this.config.ses!.secretAccessKey
            }
          });
          
          this.transporter = nodemailer.createTransport({
            SES: { ses, aws }
          });
          break;
      }

      // اختبار الاتصال (تجنب أثناء البناء)
      if (this.transporter && process.env.NODE_ENV !== 'production') {
        try {
          await this.transporter.verify();
          console.log('✅ Email service initialized successfully');
        } catch (verifyError) {
          console.warn('⚠️ Email service initialized but verification failed:', verifyError);
        }
      } else if (this.transporter) {
        console.log('📧 Email service initialized (verification skipped in production)');
      }
    } catch (error) {
      console.error('❌ Failed to initialize email service:', error);
    }
  }

  private async createMailgunTransporter(config: NonNullable<EmailConfig['mailgun']>): Promise<nodemailer.Transporter> {
    // استخدام SMTP مباشرة بدلاً من mailgun-transport
    return nodemailer.createTransport({
      host: 'smtp.mailgun.org',
      port: 587,
      secure: false,
      auth: {
        user: `postmaster@${config.domain}`,
        pass: config.apiKey!
      }
    });
  }

  // إرسال بريد إلكتروني واحد
  async sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.transporter) {
      return { success: false, error: 'Email service not initialized' };
    }

    try {
      const mailOptions = {
        from: `${this.config.from.name} <${this.config.from.email}>`,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        headers: options.headers,
        attachments: options.attachments
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      return {
        success: true,
        messageId: info.messageId
      };
    } catch (error: any) {
      console.error('Email send error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // إرسال بريد إلكتروني مع قالب
  async sendTemplatedEmail(
    templateId: string,
    to: string | string[],
    variables: Record<string, any> = {}
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // جلب القالب
      const template = await prisma.emailTemplate.findUnique({
        where: { id: templateId }
      });

      if (!template) {
        return { success: false, error: 'Template not found' };
      }

      // استبدال المتغيرات
      let html = template.html_content;
      let text = template.text_content || '';
      let subject = template.subject;

      // إضافة متغيرات افتراضية
      const defaultVars = {
        date: new Date().toLocaleDateString('ar-SA', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          calendar: 'gregory',
          numberingSystem: 'latn'
        }),
        year: new Date().getFullYear(),
        ...variables
      };

      // استبدال المتغيرات في النص
      Object.entries(defaultVars).forEach(([key, value]) => {
        const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
        html = html.replace(regex, String(value));
        text = text.replace(regex, String(value));
        subject = subject.replace(regex, String(value));
      });

      // إرسال البريد
      return await this.sendEmail({
        to,
        subject,
        html,
        text
      });
    } catch (error: any) {
      console.error('Templated email error:', error);
  return {
        success: false,
        error: error.message
      };
    }
  }

  // إرسال بريد إلكتروني جماعي
  async sendBulkEmail(
    subscribers: Array<{ email: string; name?: string }>,
    subject: string,
    html: string,
    text?: string
  ): Promise<{ sent: number; failed: number; errors: string[] }> {
    const results = {
      sent: 0,
      failed: 0,
      errors: [] as string[]
    };

    // إرسال دفعات صغيرة لتجنب حدود المعدل
    const batchSize = 10;
    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize);
      
      await Promise.all(
        batch.map(async (subscriber) => {
          // استبدال متغيرات المستلم
          const personalizedHtml = html
            .replace(/{{name}}/g, subscriber.name || 'عزيزي القارئ')
            .replace(/{{email}}/g, subscriber.email);
          
          const personalizedText = text
            ?.replace(/{{name}}/g, subscriber.name || 'عزيزي القارئ')
            .replace(/{{email}}/g, subscriber.email);

          const result = await this.sendEmail({
            to: subscriber.email,
            subject,
            html: personalizedHtml,
            text: personalizedText
          });

          if (result.success) {
            results.sent++;
          } else {
            results.failed++;
            results.errors.push(`${subscriber.email}: ${result.error}`);
          }
        })
      );

      // تأخير بين الدفعات
      if (i + batchSize < subscribers.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return results;
  }

  // إضافة رابط إلغاء الاشتراك
  addUnsubscribeLink(html: string, subscriberId: string): string {
    const unsubscribeUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/email/unsubscribe?id=${subscriberId}`;
    const unsubscribeHtml = `
      <div style="text-align: center; margin-top: 40px; padding: 20px; border-top: 1px solid #e0e0e0;">
        <p style="color: #666; font-size: 14px;">
          إذا كنت لا ترغب في تلقي هذه الرسائل، يمكنك 
          <a href="${unsubscribeUrl}" style="color: #1a73e8;">إلغاء الاشتراك</a>
        </p>
      </div>
    `;
    
    // إضافة الرابط قبل إغلاق body
    return html.replace('</body>', `${unsubscribeHtml}</body>`);
  }

  // إضافة بكسل التتبع
  addTrackingPixel(html: string, emailLogId: string): string {
    const trackingUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/email/track/open?id=${emailLogId}`;
    const trackingPixel = `<img src="${trackingUrl}" width="1" height="1" style="display:none;" />`;
    
    // إضافة البكسل قبل إغلاق body
    return html.replace('</body>', `${trackingPixel}</body>`);
  }

  // تتبع النقرات
  trackLinks(html: string, emailLogId: string): string {
    const trackUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/email/track/click`;
    
    // استبدال جميع الروابط لتمر عبر نظام التتبع
    return html.replace(
      /<a\s+([^>]*href=["'])([^"']+)(["'][^>]*)>/gi,
      (match, before, url, after) => {
        // تجاهل روابط إلغاء الاشتراك
        if (url.includes('unsubscribe')) {
          return match;
        }
        
        const trackedUrl = `${trackUrl}?id=${emailLogId}&url=${encodeURIComponent(url)}`;
        return `<a ${before}${trackedUrl}${after}>`;
      }
    );
  }
}

// إنشاء مثيل واحد للاستخدام
export const emailService = new EmailService();

// دوال مساعدة للاستخدام المباشر
export async function testSMTPConnection(): Promise<{ success: boolean; error?: string }> {
  try {
    const testService = new EmailService();
    if (!testService['transporter']) {
      return { success: false, error: 'Email service not initialized' };
    }
    
    await testService['transporter'].verify();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function sendVerificationEmail(
  email: string, 
  name: string,
  verificationToken: string
): Promise<{ success: boolean; error?: string; messageId?: string }> {
  try {
    const verificationUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/verify?token=${verificationToken}`;
    
    const html = `
      <div style="direction: rtl; text-align: right; font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a73e8;">مرحباً ${name}</h2>
        <p>شكراً لك على التسجيل في منصة سبق. لإكمال عملية التسجيل، يرجى النقر على الرابط أدناه لتأكيد بريدك الإلكتروني:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #1a73e8; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            تأكيد البريد الإلكتروني
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px;">
          إذا لم تتمكن من النقر على الزر أعلاه، يمكنك نسخ الرابط التالي ولصقه في متصفحك:
        </p>
        <p style="word-break: break-all; color: #1a73e8; font-size: 14px;">
          ${verificationUrl}
        </p>
        
        <p style="color: #666; font-size: 12px; margin-top: 40px;">
          هذا الرابط صالح لمدة 24 ساعة فقط.
        </p>
      </div>
    `;
    
    const result = await emailService.sendEmail({
      to: email,
      subject: 'تأكيد البريد الإلكتروني - سبق',
      html,
      text: `مرحباً ${name}. لتأكيد بريدك الإلكتروني، يرجى زيارة: ${verificationUrl}`
    });
    
    return {
      success: result.success,
      error: result.error,
      messageId: result.messageId
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function sendWelcomeEmail(
  email: string, 
  name: string
): Promise<{ success: boolean; error?: string; messageId?: string }> {
  try {
    const html = `
      <div style="direction: rtl; text-align: right; font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a73e8;">مرحباً ${name}!</h2>
        <p>نحن سعداء بانضمامك إلى مجتمع سبق. منصتنا تقدم لك:</p>
        
        <ul style="line-height: 1.8;">
          <li>آخر الأخبار والتحليلات</li>
          <li>مقالات متخصصة وتحليلات عميقة</li>
          <li>تنبيهات فورية للأخبار العاجلة</li>
          <li>محتوى مخصص حسب اهتماماتك</li>
        </ul>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}" 
             style="background-color: #1a73e8; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            ابدأ القراءة الآن
          </a>
        </div>
        
        <p style="color: #666;">
          إذا كان لديك أي أسئلة أو تحتاج إلى مساعدة، لا تتردد في التواصل معنا.
        </p>
        
        <p style="color: #666; font-size: 14px; margin-top: 40px;">
          مع تحيات فريق سبق
        </p>
      </div>
    `;
    
    const result = await emailService.sendEmail({
      to: email,
      subject: `مرحباً بك في سبق، ${name}!`,
      html,
      text: `مرحباً ${name}! نحن سعداء بانضمامك إلى مجتمع سبق. ابدأ القراءة الآن: ${process.env.NEXT_PUBLIC_SITE_URL}`
    });
    
    return {
      success: result.success,
      error: result.error,
      messageId: result.messageId
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function sendPasswordResetEmail(
  email: string, 
  name: string,
  resetToken: string
): Promise<{ success: boolean; error?: string; messageId?: string }> {
  try {
    const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password?token=${resetToken}`;
    
    const html = `
      <div style="direction: rtl; text-align: right; font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a73e8;">إعادة تعيين كلمة المرور</h2>
        <p>مرحباً ${name}،</p>
        <p>لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك في منصة سبق.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #1a73e8; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            إعادة تعيين كلمة المرور
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px;">
          إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذا البريد الإلكتروني.
        </p>
        
        <p style="color: #666; font-size: 12px; margin-top: 40px;">
          هذا الرابط صالح لمدة ساعة واحدة فقط.
        </p>
        
        <p style="color: #666; font-size: 14px; margin-top: 20px;">
          إذا لم تتمكن من النقر على الزر أعلاه، يمكنك نسخ الرابط التالي ولصقه في متصفحك:
        </p>
        <p style="word-break: break-all; color: #1a73e8; font-size: 14px;">
          ${resetUrl}
        </p>
      </div>
    `;
    
    const result = await emailService.sendEmail({
      to: email,
      subject: 'إعادة تعيين كلمة المرور - سبق',
      html,
      text: `مرحباً ${name}. لإعادة تعيين كلمة المرور، يرجى زيارة: ${resetUrl}`
    });
    
    return {
      success: result.success,
      error: result.error,
      messageId: result.messageId
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
} 