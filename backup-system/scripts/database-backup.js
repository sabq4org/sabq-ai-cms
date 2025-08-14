#!/usr/bin/env node

/**
 * نسخ احتياطي لقاعدة البيانات PostgreSQL (Supabase)
 * PostgreSQL Database Backup Script for Supabase
 * 
 * الميزات:
 * - نسخ احتياطي كامل لقاعدة البيانات مع ضغط
 * - رفع إلى AWS S3 مع تشفير
 * - تشفير إضافي للملفات الحساسة
 * - إدارة دورة حياة النسخ الاحتياطية
 * - إشعارات عند النجاح أو الفشل
 */

const fs = require('fs');
const path = require('path');
const { spawn, exec } = require('child_process');
const crypto = require('crypto');
const AWS = require('aws-sdk');
const config = require('../config/backup-config');
const { sendNotification, logger, ensureDir, formatBytes, getTimestamp } = require('./utils');

class DatabaseBackup {
  constructor() {
    this.config = config;
    this.timestamp = getTimestamp();
    this.backupFileName = `db-backup-${this.timestamp}.sql.gz`;
    this.encryptedFileName = `${this.backupFileName}.enc`;
    this.checksumFileName = `${this.backupFileName}.sha256`;
    
    // إعداد AWS S3
    this.s3 = new AWS.S3({
      region: this.config.storage.s3.region,
      accessKeyId: this.config.storage.s3.accessKeyId,
      secretAccessKey: this.config.storage.s3.secretAccessKey,
    });
    
    // مسارات الملفات
    this.tempDir = this.config.paths.temp;
    this.localBackupPath = path.join(this.tempDir, this.backupFileName);
    this.encryptedPath = path.join(this.tempDir, this.encryptedFileName);
    this.checksumPath = path.join(this.tempDir, this.checksumFileName);
    
    // إحصائيات العملية
    this.stats = {
      startTime: new Date(),
      endTime: null,
      duration: null,
      fileSize: 0,
      encryptedSize: 0,
      compressionRatio: 0,
      success: false,
      error: null,
    };
  }

  /**
   * تنفيذ النسخ الاحتياطي الكامل
   */
  async execute() {
    try {
      logger.info('🚀 بدء عملية النسخ الاحتياطي لقاعدة البيانات...');
      
      // التحضير
      await this.prepare();
      
      // إنشاء النسخة الاحتياطية
      await this.createDatabaseDump();
      
      // تشفير الملف
      if (this.config.security.encryption.enabled) {
        await this.encryptBackup();
      }
      
      // إنشاء checksum
      if (this.config.security.integrity.enabled) {
        await this.createChecksum();
      }
      
      // رفع إلى S3
      await this.uploadToS3();
      
      // تنظيف النسخ القديمة
      await this.cleanupOldBackups();
      
      // إنهاء العملية
      await this.finalize(true);
      
    } catch (error) {
      logger.error('❌ خطأ في عملية النسخ الاحتياطي:', error);
      await this.finalize(false, error);
      throw error;
    }
  }

  /**
   * التحضير للعملية
   */
  async prepare() {
    logger.info('📋 تحضير بيئة النسخ الاحتياطي...');
    
    // إنشاء المجلدات المطلوبة
    await ensureDir(this.tempDir);
    
    // التحقق من متطلبات البرامج
    await this.checkRequirements();
    
    // التحقق من الاتصال بقاعدة البيانات
    await this.testDatabaseConnection();
    
    logger.info('✅ تم التحضير بنجاح');
  }

  /**
   * التحقق من توفر البرامج المطلوبة
   */
  async checkRequirements() {
    const commands = ['pg_dump', 'gzip'];
    
    for (const cmd of commands) {
      try {
        await this.execCommand(`which ${cmd}`);
        logger.debug(`✅ تم العثور على ${cmd}`);
      } catch (error) {
        throw new Error(`البرنامج المطلوب غير موجود: ${cmd}`);
      }
    }
  }

  /**
   * اختبار الاتصال بقاعدة البيانات
   */
  async testDatabaseConnection() {
    const dbConfig = this.config.database.connection;
    const testCommand = `PGPASSWORD="${dbConfig.password}" psql -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.username} -d ${dbConfig.database} -c "SELECT 1;" --quiet`;
    
    try {
      await this.execCommand(testCommand);
      logger.info('✅ تم الاتصال بقاعدة البيانات بنجاح');
    } catch (error) {
      throw new Error(`فشل الاتصال بقاعدة البيانات: ${error.message}`);
    }
  }

  /**
   * إنشاء النسخة الاحتياطية لقاعدة البيانات
   */
  async createDatabaseDump() {
    logger.info('💾 إنشاء النسخة الاحتياطية لقاعدة البيانات...');
    
    const dbConfig = this.config.database.connection;
    const backupConfig = this.config.database.backup;
    
    // بناء أمر pg_dump
    let dumpCommand = `PGPASSWORD="${dbConfig.password}" pg_dump`;
    dumpCommand += ` -h ${dbConfig.host}`;
    dumpCommand += ` -p ${dbConfig.port}`;
    dumpCommand += ` -U ${dbConfig.username}`;
    dumpCommand += ` -d ${dbConfig.database}`;
    
    // إضافة الخيارات
    if (backupConfig.options.verbose) dumpCommand += ' --verbose';
    if (backupConfig.options.noOwner) dumpCommand += ' --no-owner';
    if (backupConfig.options.noPrivileges) dumpCommand += ' --no-privileges';
    if (backupConfig.options.cleanFirst) dumpCommand += ' --clean';
    if (backupConfig.options.createDb) dumpCommand += ' --create';
    if (backupConfig.options.ifExists) dumpCommand += ' --if-exists';
    
    // تحديد التنسيق
    if (backupConfig.format === 'custom') {
      dumpCommand += ' --format=custom';
    } else if (backupConfig.format === 'tar') {
      dumpCommand += ' --format=tar';
    }
    
    // إضافة الضغط وإخراج الملف
    dumpCommand += ` | gzip -${backupConfig.compression} > "${this.localBackupPath}"`;
    
    try {
      await this.execCommand(dumpCommand);
      
      // التحقق من حجم الملف
      const stats = fs.statSync(this.localBackupPath);
      this.stats.fileSize = stats.size;
      
      logger.info(`✅ تم إنشاء النسخة الاحتياطية بنجاح (${formatBytes(stats.size)})`);
      
    } catch (error) {
      throw new Error(`فشل في إنشاء النسخة الاحتياطية: ${error.message}`);
    }
  }

  /**
   * تشفير ملف النسخة الاحتياطية
   */
  async encryptBackup() {
    logger.info('🔐 تشفير ملف النسخة الاحتياطية...');
    
    const encryptionConfig = this.config.security.encryption;
    
    if (!encryptionConfig.encryptionKey) {
      throw new Error('مفتاح التشفير غير محدد في متغيرات البيئة');
    }
    
    return new Promise((resolve, reject) => {
      // إنشاء IV عشوائي
      const iv = crypto.randomBytes(encryptionConfig.ivLength);
      
      // إنشاء cipher
      const cipher = crypto.createCipher(encryptionConfig.algorithm, encryptionConfig.encryptionKey);
      
      // قراءة الملف الأصلي
      const input = fs.createReadStream(this.localBackupPath);
      const output = fs.createWriteStream(this.encryptedPath);
      
      // كتابة IV في بداية الملف المشفر
      output.write(iv);
      
      // تشفير البيانات
      input.pipe(cipher).pipe(output);
      
      output.on('finish', () => {
        // حساب حجم الملف المشفر
        const stats = fs.statSync(this.encryptedPath);
        this.stats.encryptedSize = stats.size;
        
        // حذف الملف غير المشفر
        fs.unlinkSync(this.localBackupPath);
        
        logger.info(`🔐 تم تشفير الملف بنجاح (${formatBytes(stats.size)})`);
        resolve();
      });
      
      output.on('error', reject);
      input.on('error', reject);
    });
  }

  /**
   * إنشاء checksum للتحقق من سلامة البيانات
   */
  async createChecksum() {
    logger.info('🔍 إنشاء checksum للتحقق من سلامة البيانات...');
    
    const algorithm = this.config.security.integrity.algorithm;
    const filePath = this.config.security.encryption.enabled ? this.encryptedPath : this.localBackupPath;
    
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash(algorithm);
      const stream = fs.createReadStream(filePath);
      
      stream.on('data', data => hash.update(data));
      stream.on('end', () => {
        const checksum = hash.digest('hex');
        
        // حفظ checksum في ملف
        const checksumContent = `${checksum}  ${path.basename(filePath)}\n`;
        fs.writeFileSync(this.checksumPath, checksumContent);
        
        logger.info(`🔍 تم إنشاء checksum: ${checksum.substring(0, 16)}...`);
        resolve(checksum);
      });
      
      stream.on('error', reject);
    });
  }

  /**
   * رفع النسخة الاحتياطية إلى AWS S3
   */
  async uploadToS3() {
    logger.info('☁️ رفع النسخة الاحتياطية إلى AWS S3...');
    
    const s3Config = this.config.storage.s3;
    const filePath = this.config.security.encryption.enabled ? this.encryptedPath : this.localBackupPath;
    const fileName = this.config.security.encryption.enabled ? this.encryptedFileName : this.backupFileName;
    
    // رفع ملف النسخة الاحتياطية
    const backupKey = `${s3Config.folders.database}/${fileName}`;
    await this.uploadFileToS3(filePath, backupKey);
    
    // رفع checksum إذا كان متوفراً
    if (this.config.security.integrity.enabled && fs.existsSync(this.checksumPath)) {
      const checksumKey = `${s3Config.folders.database}/${this.checksumFileName}`;
      await this.uploadFileToS3(this.checksumPath, checksumKey);
    }
    
    logger.info('✅ تم رفع النسخة الاحتياطية إلى S3 بنجاح');
  }

  /**
   * رفع ملف واحد إلى S3
   */
  async uploadFileToS3(filePath, key) {
    const s3Config = this.config.storage.s3;
    
    const fileStream = fs.createReadStream(filePath);
    const fileStats = fs.statSync(filePath);
    
    const uploadParams = {
      Bucket: s3Config.bucket,
      Key: key,
      Body: fileStream,
      ContentLength: fileStats.size,
      StorageClass: s3Config.storageClass,
      ServerSideEncryption: s3Config.encryption,
      Metadata: {
        'backup-timestamp': this.timestamp,
        'backup-type': 'database',
        'project': this.config.project.name,
        'environment': this.config.project.environment,
        'file-size': fileStats.size.toString(),
      }
    };
    
    try {
      const result = await this.s3.upload(uploadParams).promise();
      logger.info(`📤 تم رفع الملف: ${key} (${formatBytes(fileStats.size)})`);
      return result;
    } catch (error) {
      throw new Error(`فشل رفع الملف إلى S3: ${error.message}`);
    }
  }

  /**
   * تنظيف النسخ الاحتياطية القديمة
   */
  async cleanupOldBackups() {
    logger.info('🧹 تنظيف النسخ الاحتياطية القديمة...');
    
    const s3Config = this.config.storage.s3;
    const retentionConfig = this.config.retention.daily;
    
    try {
      // قائمة النسخ الاحتياطية الموجودة
      const listParams = {
        Bucket: s3Config.bucket,
        Prefix: `${s3Config.folders.database}/db-backup-`,
      };
      
      const objects = await this.s3.listObjectsV2(listParams).promise();
      
      if (objects.Contents.length <= retentionConfig.keep) {
        logger.info(`📊 عدد النسخ الحالية (${objects.Contents.length}) أقل من الحد المسموح (${retentionConfig.keep})`);
        return;
      }
      
      // ترتيب النسخ حسب التاريخ (الأحدث أولاً)
      const sortedObjects = objects.Contents
        .sort((a, b) => new Date(b.LastModified) - new Date(a.LastModified))
        .slice(retentionConfig.keep); // الحصول على النسخ التي يجب حذفها
      
      // حذف النسخ القديمة
      for (const object of sortedObjects) {
        await this.s3.deleteObject({
          Bucket: s3Config.bucket,
          Key: object.Key
        }).promise();
        
        logger.info(`🗑️ تم حذف النسخة القديمة: ${object.Key}`);
      }
      
      logger.info(`✅ تم تنظيف ${sortedObjects.length} نسخة قديمة`);
      
    } catch (error) {
      logger.warn(`⚠️ تحذير: فشل في تنظيف النسخ القديمة: ${error.message}`);
    }
  }

  /**
   * إنهاء العملية وإرسال الإشعارات
   */
  async finalize(success, error = null) {
    this.stats.endTime = new Date();
    this.stats.duration = this.stats.endTime - this.stats.startTime;
    this.stats.success = success;
    this.stats.error = error;
    
    // تنظيف الملفات المؤقتة
    try {
      if (fs.existsSync(this.localBackupPath)) fs.unlinkSync(this.localBackupPath);
      if (fs.existsSync(this.encryptedPath)) fs.unlinkSync(this.encryptedPath);
      if (fs.existsSync(this.checksumPath)) fs.unlinkSync(this.checksumPath);
    } catch (cleanupError) {
      logger.warn('⚠️ تحذير: فشل في تنظيف الملفات المؤقتة:', cleanupError.message);
    }
    
    // تسجيل النتائج
    if (success) {
      logger.info('🎉 تمت عملية النسخ الاحتياطي بنجاح!');
      logger.info(`📊 الإحصائيات:`);
      logger.info(`   ⏱️ المدة: ${Math.round(this.stats.duration / 1000)} ثانية`);
      logger.info(`   📦 حجم الملف: ${formatBytes(this.stats.fileSize)}`);
      if (this.stats.encryptedSize > 0) {
        logger.info(`   🔐 حجم الملف المشفر: ${formatBytes(this.stats.encryptedSize)}`);
      }
    } else {
      logger.error('❌ فشلت عملية النسخ الاحتياطي!');
      if (error) {
        logger.error(`   💬 السبب: ${error.message}`);
      }
    }
    
    // إرسال الإشعارات
    await this.sendNotifications(success, error);
  }

  /**
   * إرسال الإشعارات
   */
  async sendNotifications(success, error = null) {
    const notificationConfig = this.config.notifications;
    
    if (!notificationConfig.email.enabled) return;
    
    const subject = success 
      ? `✅ نجحت عملية النسخ الاحتياطي لقاعدة البيانات - ${this.config.project.name}`
      : `❌ فشلت عملية النسخ الاحتياطي لقاعدة البيانات - ${this.config.project.name}`;
    
    const body = this.generateEmailBody(success, error);
    
    try {
      await sendNotification(subject, body, notificationConfig.email);
      logger.info('📧 تم إرسال الإشعار بالبريد الإلكتروني');
    } catch (notificationError) {
      logger.warn('⚠️ فشل إرسال الإشعار:', notificationError.message);
    }
  }

  /**
   * إنشاء محتوى الإيميل
   */
  generateEmailBody(success, error = null) {
    const duration = Math.round(this.stats.duration / 1000);
    
    let body = `
# تقرير النسخ الاحتياطي لقاعدة البيانات

## معلومات عامة
- **المشروع**: ${this.config.project.name}
- **البيئة**: ${this.config.project.environment}
- **التاريخ والوقت**: ${new Date().toLocaleString('ar-SA', { timeZone: 'Asia/Riyadh' })}
- **الحالة**: ${success ? '✅ نجح' : '❌ فشل'}

## تفاصيل العملية
- **وقت البداية**: ${this.stats.startTime.toLocaleString('ar-SA')}
- **وقت النهاية**: ${this.stats.endTime.toLocaleString('ar-SA')}
- **المدة الإجمالية**: ${duration} ثانية
- **حجم الملف**: ${formatBytes(this.stats.fileSize)}
`;

    if (this.stats.encryptedSize > 0) {
      body += `- **حجم الملف المشفر**: ${formatBytes(this.stats.encryptedSize)}\n`;
    }

    if (!success && error) {
      body += `\n## تفاصيل الخطأ\n\`\`\`\n${error.message}\n\`\`\`\n`;
    }

    body += `\n## إعدادات النسخ الاحتياطي
- **التشفير**: ${this.config.security.encryption.enabled ? 'مفعل' : 'معطل'}
- **التحقق من التكامل**: ${this.config.security.integrity.enabled ? 'مفعل' : 'معطل'}
- **التخزين**: AWS S3 (${this.config.storage.s3.bucket})
- **مجلد التخزين**: ${this.config.storage.s3.folders.database}

---
تم إنشاء هذا التقرير تلقائياً بواسطة نظام النسخ الاحتياطي.
`;

    return body;
  }

  /**
   * تنفيذ أمر shell
   */
  execCommand(command) {
    return new Promise((resolve, reject) => {
      exec(command, { maxBuffer: 1024 * 1024 * 100 }, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`${error.message}\n${stderr}`));
        } else {
          resolve(stdout);
        }
      });
    });
  }
}

// تشغيل النسخ الاحتياطي إذا تم استدعاء الملف مباشرة
if (require.main === module) {
  const backup = new DatabaseBackup();
  
  backup.execute()
    .then(() => {
      logger.info('🎉 انتهت عملية النسخ الاحتياطي بنجاح');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('❌ فشلت عملية النسخ الاحتياطي:', error);
      process.exit(1);
    });
}

module.exports = DatabaseBackup;
