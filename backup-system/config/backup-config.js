/**
 * تكوين نظام النسخ الاحتياطي الشامل للمشروع
 * Comprehensive Project Backup System Configuration
 * 
 * المشروع: نظام إدارة المحتوى Sabq AI CMS
 * التاريخ: 2025-08-14
 * الهدف: إنشاء نسخ احتياطية يومية شاملة تضمن استرجاع المشروع بأمان
 */

const path = require('path');
const os = require('os');

const config = {
  // ===== إعدادات عامة =====
  project: {
    name: 'sabq-ai-cms',
    environment: process.env.NODE_ENV || 'production',
    version: '1.0.0',
    timezone: 'Asia/Riyadh',
  },

  // ===== مسارات النظام =====
  paths: {
    root: path.resolve(__dirname, '../..'),
    backupRoot: path.resolve(__dirname, '../'),
    scripts: path.resolve(__dirname, '../scripts'),
    logs: path.resolve(__dirname, '../logs'),
    temp: path.resolve(os.tmpdir(), 'sabq-backup-temp'),
  },

  // ===== قاعدة البيانات (PostgreSQL - Supabase) =====
  database: {
    // معلومات الاتصال
    connection: {
      host: process.env.DB_HOST || 'db.uopckyrdhlvsxnvcobbw.supabase.co',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'postgres',
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || process.env.SUPABASE_DB_PASSWORD,
      ssl: true,
    },
    
    // إعدادات النسخ الاحتياطي
    backup: {
      // تضمين البيانات والهيكل
      includeData: true,
      includeSchema: true,
      includeIndexes: true,
      includeFunctions: true,
      includeTriggers: true,
      includeSequences: true,
      
      // الجداول المطلوب نسخها احتياطياً (جميع الجداول)
      tables: ['*'], // '*' يعني جميع الجداول
      
      // استثناء جداول مؤقتة أو غير مهمة
      excludeTables: [
        'sessions_temp',
        'cache_*',
        'temp_*',
      ],
      
      // تنسيق الملف
      format: 'custom', // custom, plain, tar, directory
      compression: 9, // مستوى الضغط (0-9)
      encoding: 'UTF8',
      
      // خيارات إضافية
      options: {
        verbose: true,
        noOwner: true,
        noPrivileges: true,
        cleanFirst: false, // لا نريد حذف البيانات الموجودة عند الاستعادة
        createDb: true,
        ifExists: true,
      }
    }
  },

  // ===== التخزين السحابي =====
  storage: {
    // AWS S3 للنسخ الاحتياطية
    s3: {
      region: process.env.AWS_REGION || 'us-east-1',
      bucket: process.env.BACKUP_S3_BUCKET || 'sabq-cms-backups',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      
      // مجلدات التنظيم
      folders: {
        database: 'database-backups',
        codebase: 'codebase-backups',
        assets: 'assets-backups',
        full: 'full-backups',
      },
      
      // فئات التخزين
      storageClass: 'STANDARD_IA', // STANDARD, STANDARD_IA, GLACIER
      encryption: 'AES256',
      
      // دورة حياة الملفات
      lifecycle: {
        deleteAfterDays: 365, // حذف بعد سنة
        transitionToIA: 30, // نقل إلى IA بعد 30 يوم
        transitionToGlacier: 90, // نقل إلى Glacier بعد 90 يوم
      }
    },

    // Cloudinary للصور
    cloudinary: {
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dlaibl7id',
      apiKey: process.env.CLOUDINARY_API_KEY,
      apiSecret: process.env.CLOUDINARY_API_SECRET,
      
      // مجلدات الصور
      folders: [
        'articles',
        'categories', 
        'authors',
        'defaults',
        'uploads'
      ],
      
      // أنواع الملفات
      resourceTypes: ['image', 'video', 'raw'],
      
      // حد الملفات للنسخ
      maxFiles: 10000,
      
      // تصدير الـ metadata
      includeMetadata: true,
      includeTags: true,
      includeContext: true,
    }
  },

  // ===== المستودع (GitHub Repository) =====
  repository: {
    // معلومات المستودع
    owner: 'sabq4org',
    repo: 'sabq-ai-cms', 
    branch: 'main',
    
    // رمز الوصول
    token: process.env.GITHUB_TOKEN,
    
    // الملفات المطلوب نسخها
    includePaths: [
      '.',
    ],
    
    // استثناء المجلدات غير المطلوبة
    excludePaths: [
      'node_modules',
      '.next',
      '.git',
      'backup-system/logs',
      'backup-system/temp',
      '*.log',
      '.env*',
      'dist',
      'build',
    ],
    
    // إنشاء أرشيف مضغوط
    createArchive: true,
    archiveFormat: 'tar.gz', // tar.gz, zip
  },

  // ===== جدولة النسخ الاحتياطية =====
  scheduler: {
    // التوقيت (cron format)
    daily: {
      enabled: true,
      time: '0 3 * * *', // 3:00 صباحاً يومياً
      timezone: 'Asia/Riyadh',
    },
    
    weekly: {
      enabled: true,
      time: '0 2 * * 0', // 2:00 صباحاً كل أحد
      timezone: 'Asia/Riyadh',
    },
    
    monthly: {
      enabled: true,
      time: '0 1 1 * *', // 1:00 صباحاً أول كل شهر
      timezone: 'Asia/Riyadh',
    },
    
    // إعدادات التنفيذ
    maxConcurrentJobs: 1,
    jobTimeout: 3600, // ساعة واحدة كحد أقصى لكل عملية
    retryAttempts: 3,
    retryDelay: 300, // 5 دقائق
  },

  // ===== إدارة النسخ =====
  retention: {
    // عدد النسخ المحفوظة
    daily: {
      keep: 30, // احتفظ بآخر 30 نسخة يومية
      deleteOlder: true,
    },
    
    weekly: {
      keep: 12, // احتفظ بآخر 12 نسخة أسبوعية
      deleteOlder: true,
    },
    
    monthly: {
      keep: 12, // احتفظ بآخر 12 نسخة شهرية
      deleteOlder: true,
    },
    
    // نسخ خاصة (manual backups)
    manual: {
      keep: 10,
      deleteOlder: false, // لا تحذف النسخ اليدوية تلقائياً
    }
  },

  // ===== الأمان والتشفير =====
  security: {
    // تشفير الملفات
    encryption: {
      enabled: true,
      algorithm: 'aes-256-gcm',
      keyLength: 32,
      ivLength: 16,
      
      // مفتاح التشفير (يجب تخزينه بأمان)
      encryptionKey: process.env.BACKUP_ENCRYPTION_KEY,
      
      // تشفير أسماء الملفات
      encryptFileNames: false,
    },
    
    // التحقق من التكامل
    integrity: {
      enabled: true,
      algorithm: 'sha256',
      createChecksum: true,
      verifyOnRestore: true,
    },
    
    // التحكم في الوصول
    access: {
      // المستخدمون المصرح لهم
      authorizedUsers: [
        'admin@sabq.org',
        'dev@sabq.org',
      ],
      
      // صلاحيات العمليات
      permissions: {
        create: ['admin', 'dev'],
        restore: ['admin'],
        delete: ['admin'],
        view: ['admin', 'dev'],
      }
    }
  },

  // ===== الإشعارات =====
  notifications: {
    // إعدادات الإيميل
    email: {
      enabled: true,
      smtp: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        }
      },
      
      // قائمة المرسل إليهم
      recipients: [
        'admin@sabq.org',
        'dev@sabq.org',
      ],
      
      // أنواع الإشعارات
      events: {
        success: true,
        failure: true,
        warning: true,
        started: false,
        completed: true,
      }
    },
    
    // webhook للتكامل مع الأنظمة الأخرى
    webhook: {
      enabled: false,
      url: process.env.BACKUP_WEBHOOK_URL,
      secret: process.env.BACKUP_WEBHOOK_SECRET,
      events: ['success', 'failure'],
    }
  },

  // ===== المراقبة والسجلات =====
  monitoring: {
    // مستوى السجلات
    logLevel: 'info', // error, warn, info, debug
    
    // حفظ السجلات
    logToFile: true,
    logRotation: {
      enabled: true,
      maxSize: '100MB',
      maxFiles: 10,
      compress: true,
    },
    
    // المقاييس والإحصائيات
    metrics: {
      enabled: true,
      collectDuration: true,
      collectSize: true,
      collectErrors: true,
      
      // تصدير المقاييس
      export: {
        enabled: false,
        format: 'prometheus', // prometheus, json
        endpoint: '/metrics',
      }
    }
  },

  // ===== تكوين خاص بكل نوع نسخة =====
  backupTypes: {
    // نسخة كاملة (Full Backup)
    full: {
      enabled: true,
      schedule: 'weekly',
      includes: ['database', 'codebase', 'assets'],
      compression: true,
      encryption: true,
      priority: 'high',
    },
    
    // نسخة قاعدة البيانات فقط
    database: {
      enabled: true,
      schedule: 'daily',
      compression: true,
      encryption: true,
      priority: 'high',
    },
    
    // نسخة الكود فقط
    codebase: {
      enabled: true,
      schedule: 'daily',
      compression: true,
      encryption: false, // الكود عام
      priority: 'medium',
    },
    
    // نسخة الأصول (Assets)
    assets: {
      enabled: true,
      schedule: 'weekly',
      compression: true,
      encryption: false,
      priority: 'low',
    }
  }
};

module.exports = config;
