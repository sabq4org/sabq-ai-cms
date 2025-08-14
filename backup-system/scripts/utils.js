/**
 * أدوات مشتركة لنظام النسخ الاحتياطي
 * Shared Utilities for Backup System
 * 
 * يحتوي على:
 * - إدارة السجلات (Logging)
 * - إرسال الإشعارات (Email Notifications)
 * - أدوات التنسيق والتحويل
 * - إدارة الملفات والمجلدات
 * - وظائف التشفير والأمان
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const winston = require('winston');

/**
 * إعداد نظام السجلات (Logger)
 */
const createLogger = () => {
  const logDir = path.resolve(__dirname, '../logs');
  
  // إنشاء مجلد السجلات إذا لم يكن موجوداً
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  
  // تنسيق السجلات باللغة العربية
  const arabicFormatter = winston.format.combine(
    winston.format.timestamp({
      format: () => {
        return new Date().toLocaleString('ar-SA', {
          timeZone: 'Asia/Riyadh',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
      }
    }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, stack }) => {
      const levelEmojis = {
        error: '❌',
        warn: '⚠️',
        info: 'ℹ️',
        debug: '🐛'
      };
      
      const emoji = levelEmojis[level] || '📝';
      let logMessage = `${timestamp} ${emoji} [${level.toUpperCase()}] ${message}`;
      
      if (stack) {
        logMessage += `\n${stack}`;
      }
      
      return logMessage;
    })
  );
  
  // إنشاء logger
  const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: arabicFormatter,
    transports: [
      // كتابة جميع السجلات إلى ملف مجمع
      new winston.transports.File({
        filename: path.join(logDir, 'backup-system.log'),
        maxsize: 50 * 1024 * 1024, // 50MB
        maxFiles: 10,
        tailable: true
      }),
      
      // كتابة الأخطاء إلى ملف منفصل
      new winston.transports.File({
        filename: path.join(logDir, 'backup-errors.log'),
        level: 'error',
        maxsize: 10 * 1024 * 1024, // 10MB
        maxFiles: 5,
        tailable: true
      }),
      
      // عرض السجلات في الكونسول أثناء التطوير
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          arabicFormatter
        )
      })
    ],
    
    // التعامل مع الاستثناءات غير المتوقعة
    exceptionHandlers: [
      new winston.transports.File({
        filename: path.join(logDir, 'backup-exceptions.log'),
        maxsize: 10 * 1024 * 1024,
        maxFiles: 3
      })
    ],
    
    // التعامل مع Promise rejections
    rejectionHandlers: [
      new winston.transports.File({
        filename: path.join(logDir, 'backup-rejections.log'),
        maxsize: 10 * 1024 * 1024,
        maxFiles: 3
      })
    ]
  });
  
  return logger;
};

// إنشاء logger عام
const logger = createLogger();

/**
 * إرسال الإشعارات بالبريد الإلكتروني
 */
async function sendNotification(subject, body, emailConfig) {
  try {
    // إعداد SMTP transporter
    const transporter = nodemailer.createTransporter({
      host: emailConfig.smtp.host,
      port: emailConfig.smtp.port,
      secure: emailConfig.smtp.secure || false,
      auth: {
        user: emailConfig.smtp.auth.user,
        pass: emailConfig.smtp.auth.pass,
      },
      // إعدادات إضافية للموثوقية
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
      rateDelta: 1000,
      rateLimit: 5,
    });
    
    // تحويل محتوى markdown إلى HTML بسيط
    const htmlBody = convertMarkdownToHtml(body);
    
    // إعداد رسالة البريد الإلكتروني
    const mailOptions = {
      from: {
        name: 'نظام النسخ الاحتياطي - Sabq CMS',
        address: emailConfig.smtp.auth.user
      },
      to: emailConfig.recipients.join(', '),
      subject: subject,
      text: body,
      html: htmlBody,
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high'
      }
    };
    
    // إرسال البريد الإلكتروني
    const info = await transporter.sendMail(mailOptions);
    
    logger.info(`📧 تم إرسال الإشعار بنجاح إلى: ${emailConfig.recipients.join(', ')}`);
    logger.debug(`📧 معرف الرسالة: ${info.messageId}`);
    
    return info;
    
  } catch (error) {
    logger.error('❌ فشل إرسال الإشعار بالبريد الإلكتروني:', error);
    throw new Error(`فشل إرسال الإشعار: ${error.message}`);
  }
}

/**
 * تحويل محتوى Markdown إلى HTML بسيط
 */
function convertMarkdownToHtml(markdown) {
  return markdown
    // العناوين
    .replace(/^### (.*$)/gim, '<h3 style="color: #2563eb; margin: 1.5em 0 0.5em 0;">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 style="color: #1e40af; margin: 2em 0 1em 0;">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 style="color: #1e3a8a; margin: 2em 0 1em 0;">$1</h1>')
    
    // النص المائل والعريض
    .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #374151;">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    
    // الروابط
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color: #2563eb;">$1</a>')
    
    // القوائم
    .replace(/^- (.*$)/gim, '<li style="margin: 0.25em 0;">$1</li>')
    .replace(/(<li.*<\/li>)/s, '<ul style="margin: 1em 0; padding-right: 2em;">$1</ul>')
    
    // كتل الكود
    .replace(/```([\s\S]*?)```/g, '<pre style="background: #f3f4f6; padding: 1em; border-radius: 4px; font-family: monospace; overflow-x: auto;"><code>$1</code></pre>')
    .replace(/`([^`]+)`/g, '<code style="background: #f3f4f6; padding: 0.2em 0.4em; border-radius: 3px; font-family: monospace;">$1</code>')
    
    // فواصل الأسطر
    .replace(/\n\n/g, '</p><p style="margin: 1em 0;">')
    .replace(/\n/g, '<br>')
    
    // تغليف في HTML كامل
    .replace(/^/, '<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #374151; direction: rtl;"><p style="margin: 1em 0;">')
    .replace(/$/, '</p></div>');
}

/**
 * التأكد من وجود مجلد وإنشاؤه إذا لم يكن موجوداً
 */
async function ensureDir(dirPath) {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      logger.debug(`📁 تم إنشاء المجلد: ${dirPath}`);
    }
    return true;
  } catch (error) {
    logger.error(`❌ فشل إنشاء المجلد ${dirPath}:`, error);
    throw new Error(`فشل إنشاء المجلد: ${error.message}`);
  }
}

/**
 * تنسيق حجم الملف بوحدة مناسبة
 */
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 بايت';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت', 'تيرابايت'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * الحصول على timestamp منسق للملفات
 */
function getTimestamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  const second = String(now.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day}-${hour}${minute}${second}`;
}

/**
 * تشفير نص باستخدام AES-256-GCM
 */
function encryptText(text, encryptionKey) {
  try {
    const algorithm = 'aes-256-gcm';
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(algorithm, encryptionKey);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted: encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  } catch (error) {
    logger.error('❌ فشل في تشفير النص:', error);
    throw new Error(`فشل التشفير: ${error.message}`);
  }
}

/**
 * فك تشفير نص
 */
function decryptText(encryptedData, encryptionKey) {
  try {
    const algorithm = 'aes-256-gcm';
    const decipher = crypto.createDecipher(algorithm, encryptionKey);
    
    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    logger.error('❌ فشل في فك تشفير النص:', error);
    throw new Error(`فشل فك التشفير: ${error.message}`);
  }
}

/**
 * حساب checksum لملف
 */
function calculateFileChecksum(filePath, algorithm = 'sha256') {
  return new Promise((resolve, reject) => {
    try {
      const hash = crypto.createHash(algorithm);
      const stream = fs.createReadStream(filePath);
      
      stream.on('data', data => hash.update(data));
      stream.on('end', () => {
        const checksum = hash.digest('hex');
        resolve(checksum);
      });
      stream.on('error', reject);
      
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * التحقق من checksum ملف
 */
async function verifyFileChecksum(filePath, expectedChecksum, algorithm = 'sha256') {
  try {
    const actualChecksum = await calculateFileChecksum(filePath, algorithm);
    return actualChecksum === expectedChecksum;
  } catch (error) {
    logger.error(`❌ فشل في التحقق من checksum للملف ${filePath}:`, error);
    return false;
  }
}

/**
 * ضغط ملف باستخدام gzip
 */
async function compressFile(inputPath, outputPath) {
  const zlib = require('zlib');
  
  return new Promise((resolve, reject) => {
    const readStream = fs.createReadStream(inputPath);
    const writeStream = fs.createWriteStream(outputPath);
    const gzip = zlib.createGzip({ level: 9 });
    
    readStream
      .pipe(gzip)
      .pipe(writeStream)
      .on('finish', () => {
        logger.debug(`🗜️ تم ضغط الملف: ${inputPath} → ${outputPath}`);
        resolve();
      })
      .on('error', reject);
  });
}

/**
 * فك ضغط ملف gzip
 */
async function decompressFile(inputPath, outputPath) {
  const zlib = require('zlib');
  
  return new Promise((resolve, reject) => {
    const readStream = fs.createReadStream(inputPath);
    const writeStream = fs.createWriteStream(outputPath);
    const gunzip = zlib.createGunzip();
    
    readStream
      .pipe(gunzip)
      .pipe(writeStream)
      .on('finish', () => {
        logger.debug(`📦 تم فك ضغط الملف: ${inputPath} → ${outputPath}`);
        resolve();
      })
      .on('error', reject);
  });
}

/**
 * نسخ ملف مع التحقق
 */
async function copyFileWithVerification(sourcePath, destPath) {
  try {
    // نسخ الملف
    fs.copyFileSync(sourcePath, destPath);
    
    // التحقق من النسخ
    const sourceStats = fs.statSync(sourcePath);
    const destStats = fs.statSync(destPath);
    
    if (sourceStats.size !== destStats.size) {
      throw new Error('حجم الملف المنسوخ لا يطابق الملف الأصلي');
    }
    
    // التحقق من checksum
    const sourceChecksum = await calculateFileChecksum(sourcePath);
    const destChecksum = await calculateFileChecksum(destPath);
    
    if (sourceChecksum !== destChecksum) {
      throw new Error('checksum الملف المنسوخ لا يطابق الملف الأصلي');
    }
    
    logger.debug(`✅ تم نسخ الملف بنجاح: ${sourcePath} → ${destPath}`);
    return true;
    
  } catch (error) {
    logger.error(`❌ فشل في نسخ الملف ${sourcePath}:`, error);
    throw error;
  }
}

/**
 * حذف ملف بأمان
 */
async function safeDeleteFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      // إذا كان الملف مهماً، قم بإنشاء نسخة احتياطية سريعة
      const stats = fs.statSync(filePath);
      if (stats.size > 100 * 1024 * 1024) { // أكبر من 100MB
        logger.warn(`⚠️ تحذير: حذف ملف كبير (${formatBytes(stats.size)}): ${filePath}`);
      }
      
      fs.unlinkSync(filePath);
      logger.debug(`🗑️ تم حذف الملف: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    logger.error(`❌ فشل في حذف الملف ${filePath}:`, error);
    throw error;
  }
}

/**
 * الحصول على معلومات استخدام القرص
 */
async function getDiskUsage(dirPath) {
  const { spawn } = require('child_process');
  
  return new Promise((resolve, reject) => {
    const du = spawn('du', ['-sh', dirPath]);
    let output = '';
    
    du.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    du.on('close', (code) => {
      if (code === 0) {
        const size = output.trim().split('\t')[0];
        resolve(size);
      } else {
        reject(new Error(`فشل في حساب استخدام القرص للمجلد: ${dirPath}`));
      }
    });
    
    du.on('error', reject);
  });
}

/**
 * تنظيف مجلد بحذف الملفات القديمة
 */
async function cleanupOldFiles(dirPath, maxAgeHours = 24) {
  try {
    if (!fs.existsSync(dirPath)) {
      return { deleted: 0, skipped: 0 };
    }
    
    const files = fs.readdirSync(dirPath);
    const now = Date.now();
    const maxAgeMs = maxAgeHours * 60 * 60 * 1000;
    
    let deleted = 0;
    let skipped = 0;
    
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      
      if (now - stats.mtime.getTime() > maxAgeMs) {
        try {
          if (stats.isDirectory()) {
            fs.rmSync(filePath, { recursive: true });
          } else {
            fs.unlinkSync(filePath);
          }
          deleted++;
          logger.debug(`🗑️ تم حذف الملف القديم: ${filePath}`);
        } catch (error) {
          logger.warn(`⚠️ تحذير: فشل حذف ${filePath}:`, error.message);
          skipped++;
        }
      } else {
        skipped++;
      }
    }
    
    logger.info(`🧹 تنظيف ${dirPath}: حذف ${deleted} ملف، تخطي ${skipped} ملف`);
    return { deleted, skipped };
    
  } catch (error) {
    logger.error(`❌ فشل في تنظيف المجلد ${dirPath}:`, error);
    throw error;
  }
}

/**
 * مراقبة التقدم مع شريط التقدم
 */
class ProgressMonitor {
  constructor(total, description = 'العملية') {
    this.total = total;
    this.current = 0;
    this.description = description;
    this.startTime = Date.now();
    this.lastUpdateTime = Date.now();
  }
  
  update(increment = 1) {
    this.current += increment;
    const now = Date.now();
    
    // تحديث كل ثانية على الأقل
    if (now - this.lastUpdateTime >= 1000 || this.current >= this.total) {
      this.display();
      this.lastUpdateTime = now;
    }
  }
  
  display() {
    const percentage = Math.round((this.current / this.total) * 100);
    const elapsed = Math.round((Date.now() - this.startTime) / 1000);
    const rate = this.current / (elapsed || 1);
    const remaining = this.total - this.current;
    const eta = remaining > 0 ? Math.round(remaining / rate) : 0;
    
    const progressBar = this.createProgressBar(percentage);
    
    logger.info(`📊 ${this.description}: ${progressBar} ${percentage}% (${this.current}/${this.total}) - ${elapsed}s مضت، ${eta}s متبقية`);
  }
  
  createProgressBar(percentage) {
    const width = 20;
    const filled = Math.round((percentage / 100) * width);
    const empty = width - filled;
    
    return '█'.repeat(filled) + '░'.repeat(empty);
  }
  
  complete() {
    this.current = this.total;
    this.display();
    
    const totalTime = Math.round((Date.now() - this.startTime) / 1000);
    logger.info(`✅ ${this.description} اكتملت في ${totalTime} ثانية`);
  }
}

/**
 * مراقب الأداء
 */
class PerformanceMonitor {
  constructor(name) {
    this.name = name;
    this.startTime = process.hrtime.bigint();
    this.memoryStart = process.memoryUsage();
  }
  
  end() {
    const endTime = process.hrtime.bigint();
    const memoryEnd = process.memoryUsage();
    
    const durationMs = Number(endTime - this.startTime) / 1_000_000;
    const memoryDelta = memoryEnd.heapUsed - this.memoryStart.heapUsed;
    
    logger.info(`⚡ أداء ${this.name}:`);
    logger.info(`   ⏱️ المدة: ${durationMs.toFixed(2)} مللي ثانية`);
    logger.info(`   🧠 استخدام الذاكرة: ${formatBytes(memoryDelta)} (${memoryDelta >= 0 ? '+' : ''}${formatBytes(memoryDelta)})`);
    logger.info(`   💾 الذاكرة الحالية: ${formatBytes(memoryEnd.heapUsed)}`);
    
    return {
      duration: durationMs,
      memoryDelta: memoryDelta,
      memoryUsage: memoryEnd.heapUsed
    };
  }
}

/**
 * إدارة الأقفال لتجنب تداخل العمليات
 */
class LockManager {
  constructor() {
    this.locks = new Map();
  }
  
  async acquire(lockName, timeoutMs = 300000) { // 5 دقائق timeout افتراضي
    if (this.locks.has(lockName)) {
      throw new Error(`القفل ${lockName} مستخدم بالفعل`);
    }
    
    const lockInfo = {
      acquired: Date.now(),
      timeout: setTimeout(() => {
        this.release(lockName);
        logger.warn(`⚠️ تم إطلاق القفل ${lockName} تلقائياً بسبب انتهاء المهلة الزمنية`);
      }, timeoutMs)
    };
    
    this.locks.set(lockName, lockInfo);
    logger.debug(`🔒 تم الحصول على القفل: ${lockName}`);
    
    return lockName;
  }
  
  release(lockName) {
    const lockInfo = this.locks.get(lockName);
    if (lockInfo) {
      clearTimeout(lockInfo.timeout);
      this.locks.delete(lockName);
      logger.debug(`🔓 تم إطلاق القفل: ${lockName}`);
      return true;
    }
    return false;
  }
  
  isLocked(lockName) {
    return this.locks.has(lockName);
  }
  
  listLocks() {
    const lockList = [];
    for (const [name, info] of this.locks.entries()) {
      lockList.push({
        name: name,
        acquired: new Date(info.acquired).toLocaleString('ar-SA'),
        duration: Date.now() - info.acquired
      });
    }
    return lockList;
  }
}

// إنشاء مدير أقفال عام
const lockManager = new LockManager();

/**
 * تشغيل دالة مع إعادة المحاولة
 */
async function retryOperation(operation, maxRetries = 3, delayMs = 1000, description = 'العملية') {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      logger.debug(`🔄 ${description} - محاولة ${attempt}/${maxRetries}`);
      const result = await operation();
      
      if (attempt > 1) {
        logger.info(`✅ ${description} نجحت في المحاولة ${attempt}`);
      }
      
      return result;
      
    } catch (error) {
      lastError = error;
      logger.warn(`⚠️ ${description} فشلت في المحاولة ${attempt}: ${error.message}`);
      
      if (attempt < maxRetries) {
        const delay = delayMs * Math.pow(2, attempt - 1); // تأخير متزايد
        logger.debug(`⏳ انتظار ${delay}ms قبل المحاولة التالية...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  logger.error(`❌ ${description} فشلت نهائياً بعد ${maxRetries} محاولات`);
  throw lastError;
}

/**
 * التحقق من صحة عنوان البريد الإلكتروني
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * تنسيق المدة الزمنية
 */
function formatDuration(milliseconds) {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days} يوم، ${hours % 24} ساعة، ${minutes % 60} دقيقة`;
  } else if (hours > 0) {
    return `${hours} ساعة، ${minutes % 60} دقيقة، ${seconds % 60} ثانية`;
  } else if (minutes > 0) {
    return `${minutes} دقيقة، ${seconds % 60} ثانية`;
  } else {
    return `${seconds} ثانية`;
  }
}

/**
 * إنشاء معرف فريد
 */
function generateUniqueId(prefix = '') {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `${prefix}${timestamp}-${randomStr}`;
}

// تصدير جميع الوظائف والكلاسات
module.exports = {
  // Logger
  logger,
  createLogger,
  
  // الإشعارات
  sendNotification,
  convertMarkdownToHtml,
  
  // إدارة الملفات
  ensureDir,
  safeDeleteFile,
  copyFileWithVerification,
  cleanupOldFiles,
  getDiskUsage,
  
  // التنسيق والتحويل
  formatBytes,
  formatDuration,
  getTimestamp,
  generateUniqueId,
  isValidEmail,
  
  // التشفير والأمان
  encryptText,
  decryptText,
  calculateFileChecksum,
  verifyFileChecksum,
  
  // الضغط
  compressFile,
  decompressFile,
  
  // مراقبة الأداء
  ProgressMonitor,
  PerformanceMonitor,
  
  // إدارة الأقفال
  lockManager,
  LockManager,
  
  // إعادة المحاولة
  retryOperation,
};
