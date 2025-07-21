/**
 * نظام فلترة الرسائل المزعجة للمحررين
 * يقوم بتصفية وإخفاء الرسائل التقنية غير المهمة للمستخدم النهائي
 */

interface EditorNotificationFilter {
  // رسائل يجب إخفاؤها تماماً
  hideMessages: string[];
  // رسائل يجب تحويلها لرسائل مفهومة
  transformMessages: Record<string, string>;
  // مستوى الإشعارات المسموح (info, warning, error)
  allowedLevels: string[];
  // هل نعرض الرسائل التقنية للمطورين فقط
  developmentOnly: boolean;
}

export class EditorNotificationManager {
  private filter: EditorNotificationFilter;
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    
    this.filter = {
      // رسائل يجب إخفاؤها كلياً
      hideMessages: [
        'can\'t access property "slice"',
        'item.tags is undefined',
        'Attempted import error',
        'Module not found',
        'webpack-internal',
        'Failed to save to localStorage',
        'AuthProvider not ready',
        'No categories were fetched',
        'No articles were fetched',
        'NOTE: The AWS SDK for JavaScript (v2) is in maintenance mode',
        'Failed to initialize email service',
        'Invalid login: 535-5.7.8',
        'Username and Password not accepted',
        'No action provided for notification',
        'Action does not contain a valid function'
      ],
      
      // تحويل الرسائل التقنية إلى مفهومة
      transformMessages: {
        'can\'t access property "slice", item.tags is undefined': 'حدث خطأ في عرض البيانات',
        'Failed to fetch': 'فشل في الاتصال بالخادم',
        'Network request failed': 'مشكلة في الاتصال بالإنترنت',
        'Unexpected token': 'حدث خطأ في معالجة البيانات',
        'TypeError': 'حدث خطأ في النظام',
        'ReferenceError': 'حدث خطأ في تحميل المحتوى',
        'SyntaxError': 'حدث خطأ في تحليل البيانات',
        'Error fetching': 'فشل في جلب المعلومات',
        'Error loading': 'فشل في تحميل المحتوى',
        'Connection timeout': 'انتهت مهلة الاتصال',
        'Server error': 'خطأ في الخادم'
      },

      // المستويات المسموحة (للمحررين نعرض فقط success و warning المهمة)
      allowedLevels: ['success', 'warning'],
      
      // الرسائل التقنية للمطورين فقط
      developmentOnly: true
    };
  }

  /**
   * تصفية الرسائل قبل عرضها
   */
  public shouldShowMessage(message: string, type: string = 'info'): boolean {
    // إخفاء الرسائل المحظورة
    if (this.isMessageHidden(message)) {
      return false;
    }

    // إظهار فقط المستويات المسموحة
    if (!this.filter.allowedLevels.includes(type) && !this.isDevelopment) {
      return false;
    }

    // في بيئة الإنتاج، إخفاء الرسائل التقنية
    if (!this.isDevelopment && this.isTechnicalMessage(message)) {
      return false;
    }

    return true;
  }

  /**
   * تحويل الرسائل التقنية إلى مفهومة
   */
  public transformMessage(message: string): string {
    // البحث عن تطابق جزئي في رسائل التحويل
    for (const [technical, friendly] of Object.entries(this.filter.transformMessages)) {
      if (message.toLowerCase().includes(technical.toLowerCase())) {
        return friendly;
      }
    }

    return message;
  }

  /**
   * فحص إذا كانت الرسالة محظورة
   */
  private isMessageHidden(message: string): boolean {
    return this.filter.hideMessages.some(hiddenMsg => 
      message.toLowerCase().includes(hiddenMsg.toLowerCase())
    );
  }

  /**
   * فحص إذا كانت الرسالة تقنية
   */
  private isTechnicalMessage(message: string): boolean {
    const technicalKeywords = [
      'console.error',
      'console.warn',
      'webpack',
      'node_modules',
      'stack trace',
      'TypeError:',
      'ReferenceError:',
      'SyntaxError:',
      'at Object.',
      'at Function.',
      'Error occurred handling',
      'Failed to prepare',
      'chunks/',
      '.js:',
      'internal/',
      'prisma',
      'database',
      'connection',
      'timeout'
    ];

    return technicalKeywords.some(keyword => 
      message.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  /**
   * تسجيل الرسائل المفلترة للمطورين
   */
  public logFilteredMessage(originalMessage: string, type: string): void {
    if (this.isDevelopment) {
      console.log(`[مُرشح الرسائل] تم إخفاء: ${type.toUpperCase()} - ${originalMessage}`);
    }
  }

  /**
   * إعدادات مخصصة لكل نوع محرر
   */
  public getEditorSettings(editorType: 'admin' | 'writer' | 'reader'): EditorNotificationFilter {
    switch (editorType) {
      case 'admin':
        return {
          ...this.filter,
          allowedLevels: ['success', 'warning', 'error'],
          developmentOnly: false
        };
        
      case 'writer':
        return {
          ...this.filter,
          allowedLevels: ['success', 'warning'],
          developmentOnly: true
        };
        
      case 'reader':
        return {
          ...this.filter,
          allowedLevels: ['success'],
          developmentOnly: true
        };
        
      default:
        return this.filter;
    }
  }
}

// إنشاء instance واحد للاستخدام العام
export const editorNotificationManager = new EditorNotificationManager();
