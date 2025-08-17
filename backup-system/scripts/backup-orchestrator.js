#!/usr/bin/env node

/**
 * المنسق الرئيسي لنظام النسخ الاحتياطي الشامل
 * Main Backup Orchestrator for Comprehensive Backup System
 * 
 * الميزات:
 * - تنسيق جميع أنواع النسخ الاحتياطية (قاعدة بيانات، كود، أصول)
 * - إنشاء نسخة احتياطية شاملة موحدة
 * - إدارة الجدولة والأولويات
 * - مراقبة الأداء والموارد
 * - إشعارات شاملة وتقارير مفصلة
 * - استرجاع النسخ وإدارة الطوارئ
 */

const fs = require('fs');
const path = require('path');
const { spawn, exec } = require('child_process');
const cron = require('node-cron');
const AWS = require('aws-sdk');
const config = require('../config/backup-config');
const { sendNotification, logger, ensureDir, formatBytes, getTimestamp } = require('./utils');

// استيراد وحدات النسخ الاحتياطي المختلفة
const DatabaseBackup = require('./database-backup');
const CodebaseBackup = require('./codebase-backup');
const AssetsBackup = require('./assets-backup');

class BackupOrchestrator {
  constructor() {
    this.config = config;
    this.timestamp = getTimestamp();
    this.fullBackupFileName = `full-backup-${this.timestamp}.tar.gz`;
    this.summaryFileName = `backup-summary-${this.timestamp}.json`;
    
    // إعداد AWS S3
    this.s3 = new AWS.S3({
      region: this.config.storage.s3.region,
      accessKeyId: this.config.storage.s3.accessKeyId,
      secretAccessKey: this.config.storage.s3.secretAccessKey,
    });
    
    // مسارات العمل
    this.tempDir = this.config.paths.temp;
    this.fullBackupPath = path.join(this.tempDir, this.fullBackupFileName);
    this.summaryPath = path.join(this.tempDir, this.summaryFileName);
    
    // حالة العملية الشاملة
    this.orchestrationStats = {
      startTime: new Date(),
      endTime: null,
      duration: null,
      totalSteps: 0,
      completedSteps: 0,
      failedSteps: 0,
      success: false,
      error: null,
      components: {
        database: { status: 'pending', duration: 0, size: 0, error: null },
        codebase: { status: 'pending', duration: 0, size: 0, error: null },
        assets: { status: 'pending', duration: 0, size: 0, error: null },
        fullBackup: { status: 'pending', duration: 0, size: 0, error: null },
      }
    };
    
    // قائمة الوظائف المجدولة
    this.scheduledJobs = [];
    
    // معلومات النظام
    this.systemInfo = this.gatherSystemInfo();
  }

  /**
   * تشغيل النسخ الاحتياطي الشامل
   */
  async executeFullBackup(backupType = 'manual') {
    try {
      logger.info('🚀 بدء عملية النسخ الاحتياطي الشامل...');
      logger.info(`📋 نوع النسخة: ${backupType}`);
      logger.info(`🕐 التوقيت: ${new Date().toLocaleString('ar-SA', { timeZone: 'Asia/Riyadh' })}`);
      
      // التحضير
      await this.prepare();
      
      // تحديد الخطوات المطلوبة
      this.planBackupSteps(backupType);
      
      // تنفيذ النسخ الاحتياطية حسب النوع
      if (backupType === 'full' || backupType === 'manual') {
        await this.executeAllBackups();
      } else {
        await this.executePartialBackup(backupType);
      }
      
      // إنشاء النسخة الشاملة الموحدة
      if (backupType === 'full' || backupType === 'manual') {
        await this.createUnifiedBackup();
      }
      
      // إنشاء تقرير شامل
      await this.createSummaryReport();
      
      // رفع التقرير إلى S3
      await this.uploadSummaryToS3();
      
      // تنظيف النسخ القديمة
      await this.performGlobalCleanup();
      
      // إنهاء العملية
      await this.finalize(true);
      
    } catch (error) {
      logger.error('❌ خطأ في عملية النسخ الاحتياطي الشامل:', error);
      await this.finalize(false, error);
      throw error;
    }
  }

  /**
   * التحضير للعملية الشاملة
   */
  async prepare() {
    logger.info('📋 تحضير بيئة النسخ الاحتياطي الشامل...');
    
    // إنشاء المجلدات المطلوبة
    await ensureDir(this.tempDir);
    
    // فحص الموارد المتاحة
    await this.checkSystemResources();
    
    // التحقق من الاتصال بالخدمات
    await this.verifyConnections();
    
    // تسجيل معلومات النظام
    this.logSystemInfo();
    
    logger.info('✅ تم التحضير الشامل بنجاح');
  }

  /**
   * فحص موارد النظام
   */
  async checkSystemResources() {
    logger.info('🔍 فحص موارد النظام...');
    
    const os = require('os');
    
    // فحص المساحة المتاحة
    const freeSpace = await this.getFreeDiskSpace();
    const minRequiredSpace = 10 * 1024 * 1024 * 1024; // 10 GB
    
    if (freeSpace < minRequiredSpace) {
      throw new Error(`مساحة القرص غير كافية. متوفر: ${formatBytes(freeSpace)}, مطلوب: ${formatBytes(minRequiredSpace)}`);
    }
    
    // فحص الذاكرة
    const freeMemory = os.freemem();
    const minRequiredMemory = 1 * 1024 * 1024 * 1024; // 1 GB
    
    if (freeMemory < minRequiredMemory) {
      logger.warn(`⚠️ تحذير: ذاكرة منخفضة. متوفر: ${formatBytes(freeMemory)}`);
    }
    
    logger.info(`💾 المساحة المتاحة: ${formatBytes(freeSpace)}`);
    logger.info(`🧠 الذاكرة المتاحة: ${formatBytes(freeMemory)}`);
    logger.info(`⚡ معدل الحمولة: ${os.loadavg().map(l => l.toFixed(2)).join(', ')}`);
  }

  /**
   * التحقق من الاتصال بالخدمات
   */
  async verifyConnections() {
    logger.info('🔌 التحقق من الاتصال بالخدمات...');
    
    const verifications = [];
    
    // اختبار قاعدة البيانات
    verifications.push(this.testDatabaseConnection());
    
    // اختبار AWS S3
    verifications.push(this.testS3Connection());
    
    // اختبار GitHub API
    verifications.push(this.testGitHubConnection());
    
    // اختبار Cloudinary
    verifications.push(this.testCloudinaryConnection());
    
    try {
      await Promise.all(verifications);
      logger.info('✅ جميع الاتصالات تعمل بنجاح');
    } catch (error) {
      throw new Error(`فشل في اختبار الاتصالات: ${error.message}`);
    }
  }

  /**
   * تخطيط خطوات النسخ الاحتياطي
   */
  planBackupSteps(backupType) {
    logger.info(`📋 تخطيط خطوات النسخ الاحتياطي لنوع: ${backupType}...`);
    
    this.orchestrationStats.totalSteps = 0;
    
    if (backupType === 'full' || backupType === 'manual') {
      if (this.config.backupTypes.database.enabled) this.orchestrationStats.totalSteps++;
      if (this.config.backupTypes.codebase.enabled) this.orchestrationStats.totalSteps++;
      if (this.config.backupTypes.assets.enabled) this.orchestrationStats.totalSteps++;
      this.orchestrationStats.totalSteps++; // النسخة الموحدة
    } else if (backupType === 'database') {
      this.orchestrationStats.totalSteps = 1;
    } else if (backupType === 'codebase') {
      this.orchestrationStats.totalSteps = 1;
    } else if (backupType === 'assets') {
      this.orchestrationStats.totalSteps = 1;
    }
    
    logger.info(`📊 إجمالي الخطوات: ${this.orchestrationStats.totalSteps}`);
  }

  /**
   * تنفيذ جميع النسخ الاحتياطية
   */
  async executeAllBackups() {
    logger.info('🎯 تنفيذ جميع أنواع النسخ الاحتياطية...');
    
    // النسخة الاحتياطية لقاعدة البيانات
    if (this.config.backupTypes.database.enabled) {
      await this.executeComponentBackup('database', DatabaseBackup);
    }
    
    // النسخة الاحتياطية للكود
    if (this.config.backupTypes.codebase.enabled) {
      await this.executeComponentBackup('codebase', CodebaseBackup);
    }
    
    // النسخة الاحتياطية للأصول
    if (this.config.backupTypes.assets.enabled) {
      await this.executeComponentBackup('assets', AssetsBackup);
    }
  }

  /**
   * تنفيذ نسخة احتياطية جزئية
   */
  async executePartialBackup(backupType) {
    logger.info(`🎯 تنفيذ النسخة الاحتياطية الجزئية: ${backupType}...`);
    
    switch (backupType) {
      case 'database':
        await this.executeComponentBackup('database', DatabaseBackup);
        break;
      case 'codebase':
        await this.executeComponentBackup('codebase', CodebaseBackup);
        break;
      case 'assets':
        await this.executeComponentBackup('assets', AssetsBackup);
        break;
      default:
        throw new Error(`نوع النسخة الاحتياطية غير مدعوم: ${backupType}`);
    }
  }

  /**
   * تنفيذ نسخة احتياطية لمكون واحد
   */
  async executeComponentBackup(componentName, BackupClass) {
    const component = this.orchestrationStats.components[componentName];
    
    try {
      logger.info(`🔄 بدء ${componentName} backup...`);
      component.status = 'running';
      
      const startTime = Date.now();
      const backup = new BackupClass();
      
      await backup.execute();
      
      const endTime = Date.now();
      component.duration = endTime - startTime;
      component.status = 'completed';
      component.size = await this.getComponentBackupSize(componentName);
      
      this.orchestrationStats.completedSteps++;
      
      logger.info(`✅ انتهى ${componentName} backup بنجاح (${Math.round(component.duration / 1000)}s)`);
      
    } catch (error) {
      component.status = 'failed';
      component.error = error.message;
      this.orchestrationStats.failedSteps++;
      
      logger.error(`❌ فشل ${componentName} backup:`, error.message);
      
      // قرار: هل نستمر أم نتوقف؟
      if (this.config.backupTypes[componentName].priority === 'high') {
        throw error; // توقف عند فشل المكونات عالية الأولوية
      } else {
        logger.warn(`⚠️ تجاهل فشل ${componentName} (أولوية منخفضة)`);
      }
    }
  }

  /**
   * الحصول على حجم النسخة الاحتياطية لمكون
   */
  async getComponentBackupSize(componentName) {
    try {
      const s3Config = this.config.storage.s3;
      let prefix = '';
      
      switch (componentName) {
        case 'database':
          prefix = `${s3Config.folders.database}/db-backup-${this.timestamp}`;
          break;
        case 'codebase':
          prefix = `${s3Config.folders.codebase}/codebase-backup-${this.timestamp}`;
          break;
        case 'assets':
          prefix = `${s3Config.folders.assets}/assets-backup-${this.timestamp}`;
          break;
      }
      
      const objects = await this.s3.listObjectsV2({
        Bucket: s3Config.bucket,
        Prefix: prefix,
      }).promise();
      
      return objects.Contents.reduce((total, obj) => total + obj.Size, 0);
      
    } catch (error) {
      logger.warn(`⚠️ تحذير: فشل في حساب حجم ${componentName}:`, error.message);
      return 0;
    }
  }

  /**
   * إنشاء النسخة الشاملة الموحدة
   */
  async createUnifiedBackup() {
    const component = this.orchestrationStats.components.fullBackup;
    
    try {
      logger.info('📦 إنشاء النسخة الشاملة الموحدة...');
      component.status = 'running';
      
      const startTime = Date.now();
      
      // تحميل جميع النسخ الاحتياطية من S3
      const downloadedFiles = await this.downloadBackupComponents();
      
      // إنشاء أرشيف موحد
      await this.createUnifiedArchive(downloadedFiles);
      
      // رفع النسخة الموحدة إلى S3
      await this.uploadUnifiedBackup();
      
      // تنظيف الملفات المؤقتة
      await this.cleanupTempFiles(downloadedFiles);
      
      const endTime = Date.now();
      component.duration = endTime - startTime;
      component.status = 'completed';
      component.size = fs.existsSync(this.fullBackupPath) ? fs.statSync(this.fullBackupPath).size : 0;
      
      this.orchestrationStats.completedSteps++;
      
      logger.info(`✅ تم إنشاء النسخة الموحدة بنجاح (${formatBytes(component.size)})`);
      
    } catch (error) {
      component.status = 'failed';
      component.error = error.message;
      this.orchestrationStats.failedSteps++;
      
      logger.error('❌ فشل في إنشاء النسخة الموحدة:', error.message);
      throw error;
    }
  }

  /**
   * تحميل مكونات النسخ الاحتياطية من S3
   */
  async downloadBackupComponents() {
    logger.info('📥 تحميل مكونات النسخ الاحتياطية من S3...');
    
    const s3Config = this.config.storage.s3;
    const downloadedFiles = [];
    
    const components = [
      { name: 'database', folder: s3Config.folders.database, pattern: `db-backup-${this.timestamp}` },
      { name: 'codebase', folder: s3Config.folders.codebase, pattern: `codebase-backup-${this.timestamp}` },
      { name: 'assets', folder: s3Config.folders.assets, pattern: `assets-backup-${this.timestamp}` },
    ];
    
    for (const comp of components) {
      if (this.orchestrationStats.components[comp.name].status === 'completed') {
        try {
          const objects = await this.s3.listObjectsV2({
            Bucket: s3Config.bucket,
            Prefix: `${comp.folder}/${comp.pattern}`,
          }).promise();
          
          for (const object of objects.Contents) {
            if (object.Key.endsWith('.gz') || object.Key.endsWith('.tar.gz')) {
              const localPath = path.join(this.tempDir, path.basename(object.Key));
              
              await this.downloadS3Object(object.Key, localPath);
              downloadedFiles.push({
                component: comp.name,
                s3Key: object.Key,
                localPath: localPath,
                size: object.Size,
              });
              
              logger.info(`📥 تم تحميل: ${path.basename(object.Key)} (${formatBytes(object.Size)})`);
            }
          }
          
        } catch (error) {
          logger.warn(`⚠️ تحذير: فشل في تحميل ${comp.name}:`, error.message);
        }
      }
    }
    
    return downloadedFiles;
  }

  /**
   * تحميل كائن واحد من S3
   */
  async downloadS3Object(s3Key, localPath) {
    const params = {
      Bucket: this.config.storage.s3.bucket,
      Key: s3Key,
    };
    
    const s3Object = await this.s3.getObject(params).promise();
    fs.writeFileSync(localPath, s3Object.Body);
  }

  /**
   * إنشاء أرشيف موحد
   */
  async createUnifiedArchive(downloadedFiles) {
    logger.info('📦 إنشاء الأرشيف الموحد...');
    
    const archiver = require('archiver');
    
    return new Promise((resolve, reject) => {
      const output = fs.createWriteStream(this.fullBackupPath);
      const archive = archiver('tar', {
        gzip: true,
        gzipOptions: {
          level: 9,
          chunkSize: 1024,
          windowBits: 15,
          memLevel: 8,
        }
      });
      
      output.on('close', () => {
        const stats = fs.statSync(this.fullBackupPath);
        logger.info(`✅ تم إنشاء الأرشيف الموحد: ${formatBytes(stats.size)}`);
        resolve();
      });
      
      output.on('error', reject);
      archive.on('error', reject);
      
      archive.pipe(output);
      
      // إضافة جميع الملفات المحملة
      for (const file of downloadedFiles) {
        archive.file(file.localPath, { name: `${file.component}/${path.basename(file.localPath)}` });
      }
      
      // إضافة ملف معلومات النسخة
      const backupInfo = {
        timestamp: this.timestamp,
        date: new Date().toISOString(),
        project: this.config.project.name,
        environment: this.config.project.environment,
        version: this.config.project.version,
        components: downloadedFiles.map(f => ({
          name: f.component,
          file: path.basename(f.localPath),
          size: f.size,
        })),
        systemInfo: this.systemInfo,
        orchestrationStats: this.orchestrationStats,
      };
      
      archive.append(JSON.stringify(backupInfo, null, 2), { name: 'backup-info.json' });
      
      archive.finalize();
    });
  }

  /**
   * رفع النسخة الموحدة إلى S3
   */
  async uploadUnifiedBackup() {
    logger.info('☁️ رفع النسخة الموحدة إلى S3...');
    
    const s3Config = this.config.storage.s3;
    const fileStream = fs.createReadStream(this.fullBackupPath);
    const fileStats = fs.statSync(this.fullBackupPath);
    
    const uploadParams = {
      Bucket: s3Config.bucket,
      Key: `${s3Config.folders.full}/${this.fullBackupFileName}`,
      Body: fileStream,
      ContentLength: fileStats.size,
      StorageClass: s3Config.storageClass,
      ServerSideEncryption: s3Config.encryption,
      Metadata: {
        'backup-timestamp': this.timestamp,
        'backup-type': 'full',
        'project': this.config.project.name,
        'environment': this.config.project.environment,
        'components': this.getCompletedComponentsList(),
        'file-size': fileStats.size.toString(),
        'total-duration': this.orchestrationStats.duration?.toString() || '0',
      }
    };
    
    try {
      const result = await this.s3.upload(uploadParams).promise();
      logger.info(`📤 تم رفع النسخة الموحدة: ${formatBytes(fileStats.size)}`);
      return result;
    } catch (error) {
      throw new Error(`فشل رفع النسخة الموحدة إلى S3: ${error.message}`);
    }
  }

  /**
   * الحصول على قائمة المكونات المكتملة
   */
  getCompletedComponentsList() {
    const completed = [];
    for (const [name, component] of Object.entries(this.orchestrationStats.components)) {
      if (component.status === 'completed') {
        completed.push(name);
      }
    }
    return completed.join(',');
  }

  /**
   * إنشاء تقرير شامل
   */
  async createSummaryReport() {
    logger.info('📋 إنشاء التقرير الشامل...');
    
    const totalSize = Object.values(this.orchestrationStats.components)
      .reduce((sum, comp) => sum + comp.size, 0);
    
    const summary = {
      // معلومات عامة
      metadata: {
        timestamp: this.timestamp,
        date: new Date().toISOString(),
        project: this.config.project.name,
        environment: this.config.project.environment,
        version: this.config.project.version,
        backupType: 'full',
      },
      
      // إحصائيات العملية
      orchestration: {
        ...this.orchestrationStats,
        totalSize: totalSize,
        averageComponentDuration: this.calculateAverageComponentDuration(),
        successRate: this.calculateSuccessRate(),
      },
      
      // تفاصيل المكونات
      components: this.orchestrationStats.components,
      
      // معلومات النظام
      system: this.systemInfo,
      
      // معلومات التخزين
      storage: {
        s3Bucket: this.config.storage.s3.bucket,
        region: this.config.storage.s3.region,
        encryption: this.config.storage.s3.encryption,
        storageClass: this.config.storage.s3.storageClass,
      },
      
      // إعدادات الاحتفاظ
      retention: this.config.retention,
      
      // الإشعارات
      notifications: {
        emailEnabled: this.config.notifications.email.enabled,
        recipients: this.config.notifications.email.recipients,
      }
    };
    
    try {
      fs.writeFileSync(this.summaryPath, JSON.stringify(summary, null, 2));
      logger.info('✅ تم إنشاء التقرير الشامل');
    } catch (error) {
      throw new Error(`فشل في إنشاء التقرير الشامل: ${error.message}`);
    }
  }

  /**
   * رفع التقرير إلى S3
   */
  async uploadSummaryToS3() {
    logger.info('📤 رفع التقرير الشامل إلى S3...');
    
    const s3Config = this.config.storage.s3;
    const fileStream = fs.createReadStream(this.summaryPath);
    const fileStats = fs.statSync(this.summaryPath);
    
    const uploadParams = {
      Bucket: s3Config.bucket,
      Key: `${s3Config.folders.full}/${this.summaryFileName}`,
      Body: fileStream,
      ContentLength: fileStats.size,
      ContentType: 'application/json',
      StorageClass: 'STANDARD',
      ServerSideEncryption: s3Config.encryption,
      Metadata: {
        'backup-timestamp': this.timestamp,
        'backup-type': 'summary',
        'project': this.config.project.name,
        'environment': this.config.project.environment,
      }
    };
    
    try {
      await this.s3.upload(uploadParams).promise();
      logger.info('📤 تم رفع التقرير الشامل إلى S3');
    } catch (error) {
      throw new Error(`فشل رفع التقرير إلى S3: ${error.message}`);
    }
  }

  /**
   * تنظيف شامل للنسخ القديمة
   */
  async performGlobalCleanup() {
    logger.info('🧹 تنظيف شامل للنسخ القديمة...');
    
    const cleanupTasks = [
      this.cleanupOldFullBackups(),
      this.cleanupOldComponentBackups('database'),
      this.cleanupOldComponentBackups('codebase'),
      this.cleanupOldComponentBackups('assets'),
    ];
    
    try {
      await Promise.all(cleanupTasks);
      logger.info('✅ انتهى التنظيف الشامل بنجاح');
    } catch (error) {
      logger.warn('⚠️ تحذير: فشل في بعض عمليات التنظيف:', error.message);
    }
  }

  /**
   * تنظيف النسخ الشاملة القديمة
   */
  async cleanupOldFullBackups() {
    const s3Config = this.config.storage.s3;
    const retentionConfig = this.config.retention.monthly; // النسخ الشاملة شهرية
    
    try {
      const objects = await this.s3.listObjectsV2({
        Bucket: s3Config.bucket,
        Prefix: `${s3Config.folders.full}/full-backup-`,
      }).promise();
      
      if (objects.Contents.length <= retentionConfig.keep) {
        return;
      }
      
      const sortedObjects = objects.Contents
        .sort((a, b) => new Date(b.LastModified) - new Date(a.LastModified))
        .slice(retentionConfig.keep);
      
      for (const object of sortedObjects) {
        await this.s3.deleteObject({
          Bucket: s3Config.bucket,
          Key: object.Key
        }).promise();
        
        // حذف التقرير المرتبط
        const summaryKey = object.Key.replace('full-backup-', 'backup-summary-').replace('.tar.gz', '.json');
        try {
          await this.s3.deleteObject({
            Bucket: s3Config.bucket,
            Key: summaryKey
          }).promise();
        } catch (e) {
          // تجاهل إذا لم يوجد ملف التقرير
        }
        
        logger.info(`🗑️ تم حذف النسخة الشاملة القديمة: ${object.Key}`);
      }
      
    } catch (error) {
      logger.warn('⚠️ فشل في تنظيف النسخ الشاملة القديمة:', error.message);
    }
  }

  /**
   * تنظيف نسخ مكون محدد
   */
  async cleanupOldComponentBackups(componentName) {
    // هذه الوظيفة تستدعي cleanup الخاص بكل مكون
    // تم تنفيذها داخل كل مكون بالفعل
    logger.debug(`🧹 تنظيف ${componentName} backups تم بواسطة المكون نفسه`);
  }

  /**
   * تنظيف الملفات المؤقتة
   */
  async cleanupTempFiles(downloadedFiles) {
    logger.info('🧹 تنظيف الملفات المؤقتة...');
    
    try {
      // حذف الملفات المحملة
      for (const file of downloadedFiles) {
        if (fs.existsSync(file.localPath)) {
          fs.unlinkSync(file.localPath);
        }
      }
      
      // حذف ملفات أخرى
      if (fs.existsSync(this.fullBackupPath)) fs.unlinkSync(this.fullBackupPath);
      if (fs.existsSync(this.summaryPath)) fs.unlinkSync(this.summaryPath);
      
      logger.info('✅ تم تنظيف الملفات المؤقتة');
    } catch (error) {
      logger.warn('⚠️ تحذير: فشل في تنظيف بعض الملفات المؤقتة:', error.message);
    }
  }

  /**
   * إنهاء العملية الشاملة
   */
  async finalize(success, error = null) {
    this.orchestrationStats.endTime = new Date();
    this.orchestrationStats.duration = this.orchestrationStats.endTime - this.orchestrationStats.startTime;
    this.orchestrationStats.success = success;
    this.orchestrationStats.error = error;
    
    // تسجيل النتائج
    if (success) {
      logger.info('🎉 تمت عملية النسخ الاحتياطي الشامل بنجاح!');
      logger.info(`📊 الإحصائيات الشاملة:`);
      logger.info(`   ⏱️ المدة الإجمالية: ${Math.round(this.orchestrationStats.duration / 1000)} ثانية`);
      logger.info(`   ✅ الخطوات المكتملة: ${this.orchestrationStats.completedSteps}/${this.orchestrationStats.totalSteps}`);
      logger.info(`   ❌ الخطوات الفاشلة: ${this.orchestrationStats.failedSteps}`);
      logger.info(`   📈 معدل النجاح: ${this.calculateSuccessRate()}%`);
      
      const totalSize = Object.values(this.orchestrationStats.components)
        .reduce((sum, comp) => sum + comp.size, 0);
      logger.info(`   📦 الحجم الإجمالي: ${formatBytes(totalSize)}`);
      
    } else {
      logger.error('❌ فشلت عملية النسخ الاحتياطي الشامل!');
      if (error) {
        logger.error(`   💬 السبب: ${error.message}`);
      }
    }
    
    // إرسال الإشعارات
    await this.sendComprehensiveNotifications(success, error);
  }

  /**
   * إرسال الإشعارات الشاملة
   */
  async sendComprehensiveNotifications(success, error = null) {
    const notificationConfig = this.config.notifications;
    
    if (!notificationConfig.email.enabled) return;
    
    const subject = success 
      ? `✅ نجحت عملية النسخ الاحتياطي الشامل - ${this.config.project.name}`
      : `❌ فشلت عملية النسخ الاحتياطي الشامل - ${this.config.project.name}`;
    
    const body = this.generateComprehensiveEmailBody(success, error);
    
    try {
      await sendNotification(subject, body, notificationConfig.email);
      logger.info('📧 تم إرسال الإشعار الشامل بالبريد الإلكتروني');
    } catch (notificationError) {
      logger.warn('⚠️ فشل إرسال الإشعار الشامل:', notificationError.message);
    }
  }

  /**
   * إنشاء محتوى الإيميل الشامل
   */
  generateComprehensiveEmailBody(success, error = null) {
    const duration = Math.round(this.orchestrationStats.duration / 1000);
    const totalSize = Object.values(this.orchestrationStats.components)
      .reduce((sum, comp) => sum + comp.size, 0);
    
    let body = `
# تقرير النسخ الاحتياطي الشامل

## معلومات عامة
- **المشروع**: ${this.config.project.name}
- **البيئة**: ${this.config.project.environment}
- **النسخة**: ${this.config.project.version}
- **التاريخ والوقت**: ${new Date().toLocaleString('ar-SA', { timeZone: 'Asia/Riyadh' })}
- **الحالة**: ${success ? '✅ نجح بالكامل' : '❌ فشل'}

## تفاصيل العملية الشاملة
- **وقت البداية**: ${this.orchestrationStats.startTime.toLocaleString('ar-SA')}
- **وقت النهاية**: ${this.orchestrationStats.endTime.toLocaleString('ar-SA')}
- **المدة الإجمالية**: ${duration} ثانية (${Math.round(duration/60)} دقيقة)
- **الخطوات المكتملة**: ${this.orchestrationStats.completedSteps}/${this.orchestrationStats.totalSteps}
- **الخطوات الفاشلة**: ${this.orchestrationStats.failedSteps}
- **معدل النجاح**: ${this.calculateSuccessRate()}%
- **الحجم الإجمالي**: ${formatBytes(totalSize)}

## تفاصيل المكونات

### قاعدة البيانات
- **الحالة**: ${this.getStatusEmoji(this.orchestrationStats.components.database.status)} ${this.orchestrationStats.components.database.status}
- **المدة**: ${Math.round(this.orchestrationStats.components.database.duration / 1000)} ثانية
- **الحجم**: ${formatBytes(this.orchestrationStats.components.database.size)}
${this.orchestrationStats.components.database.error ? `- **الخطأ**: ${this.orchestrationStats.components.database.error}` : ''}

### الكود (Repository)
- **الحالة**: ${this.getStatusEmoji(this.orchestrationStats.components.codebase.status)} ${this.orchestrationStats.components.codebase.status}
- **المدة**: ${Math.round(this.orchestrationStats.components.codebase.duration / 1000)} ثانية
- **الحجم**: ${formatBytes(this.orchestrationStats.components.codebase.size)}
${this.orchestrationStats.components.codebase.error ? `- **الخطأ**: ${this.orchestrationStats.components.codebase.error}` : ''}

### الأصول (Assets)
- **الحالة**: ${this.getStatusEmoji(this.orchestrationStats.components.assets.status)} ${this.orchestrationStats.components.assets.status}
- **المدة**: ${Math.round(this.orchestrationStats.components.assets.duration / 1000)} ثانية
- **الحجم**: ${formatBytes(this.orchestrationStats.components.assets.size)}
${this.orchestrationStats.components.assets.error ? `- **الخطأ**: ${this.orchestrationStats.components.assets.error}` : ''}

### النسخة الموحدة
- **الحالة**: ${this.getStatusEmoji(this.orchestrationStats.components.fullBackup.status)} ${this.orchestrationStats.components.fullBackup.status}
- **المدة**: ${Math.round(this.orchestrationStats.components.fullBackup.duration / 1000)} ثانية
- **الحجم**: ${formatBytes(this.orchestrationStats.components.fullBackup.size)}
${this.orchestrationStats.components.fullBackup.error ? `- **الخطأ**: ${this.orchestrationStats.components.fullBackup.error}` : ''}
`;

    if (!success && error) {
      body += `\n## تفاصيل الخطأ الرئيسي\n\`\`\`\n${error.message}\n\`\`\`\n`;
    }

    body += `\n## معلومات النظام
- **نظام التشغيل**: ${this.systemInfo.platform} ${this.systemInfo.arch}
- **إصدار Node.js**: ${this.systemInfo.nodeVersion}
- **المضيف**: ${this.systemInfo.hostname}
- **المساحة المتاحة**: ${formatBytes(this.systemInfo.freeDiskSpace)}
- **الذاكرة المتاحة**: ${formatBytes(this.systemInfo.freeMemory)}

## إعدادات التخزين
- **S3 Bucket**: ${this.config.storage.s3.bucket}
- **المنطقة**: ${this.config.storage.s3.region}
- **التشفير**: ${this.config.storage.s3.encryption}
- **فئة التخزين**: ${this.config.storage.s3.storageClass}

## الخطوات التالية
${success ? `
✅ النسخة الاحتياطية متوفرة للاسترجاع في أي وقت
✅ تم تحديث سياسات الاحتفاظ والتنظيف
✅ جميع المكونات محمية ومشفرة
` : `
❌ يرجى مراجعة السجلات لمعرفة سبب الفشل
❌ قد تحتاج لإعادة تشغيل النسخ الاحتياطي يدوياً
❌ تحقق من الاتصالات والصلاحيات
`}

---
تم إنشاء هذا التقرير تلقائياً بواسطة نظام النسخ الاحتياطي الشامل.
للاستعلامات أو المساعدة، يرجى التواصل مع فريق الدعم التقني.
`;

    return body;
  }

  /**
   * الحصول على رمز الحالة
   */
  getStatusEmoji(status) {
    switch (status) {
      case 'completed': return '✅';
      case 'running': return '🔄';
      case 'failed': return '❌';
      case 'pending': return '⏳';
      default: return '❓';
    }
  }

  /**
   * حساب معدل النجاح
   */
  calculateSuccessRate() {
    if (this.orchestrationStats.totalSteps === 0) return 0;
    return ((this.orchestrationStats.completedSteps / this.orchestrationStats.totalSteps) * 100).toFixed(1);
  }

  /**
   * حساب متوسط مدة المكونات
   */
  calculateAverageComponentDuration() {
    const durations = Object.values(this.orchestrationStats.components)
      .filter(comp => comp.status === 'completed')
      .map(comp => comp.duration);
    
    if (durations.length === 0) return 0;
    return Math.round(durations.reduce((sum, d) => sum + d, 0) / durations.length);
  }

  /**
   * جمع معلومات النظام
   */
  gatherSystemInfo() {
    const os = require('os');
    
    return {
      platform: os.platform(),
      arch: os.arch(),
      hostname: os.hostname(),
      nodeVersion: process.version,
      uptime: os.uptime(),
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      freeDiskSpace: 0, // سيتم تحديثها في checkSystemResources
      loadAverage: os.loadavg(),
      cpuCount: os.cpus().length,
      networkInterfaces: Object.keys(os.networkInterfaces()),
    };
  }

  /**
   * تسجيل معلومات النظام
   */
  logSystemInfo() {
    logger.info('🖥️ معلومات النظام:');
    logger.info(`   💻 المنصة: ${this.systemInfo.platform} ${this.systemInfo.arch}`);
    logger.info(`   🏠 المضيف: ${this.systemInfo.hostname}`);
    logger.info(`   ⚡ Node.js: ${this.systemInfo.nodeVersion}`);
    logger.info(`   🧠 الذاكرة: ${formatBytes(this.systemInfo.freeMemory)} / ${formatBytes(this.systemInfo.totalMemory)}`);
    logger.info(`   ⚙️ المعالجات: ${this.systemInfo.cpuCount}`);
  }

  /**
   * الحصول على المساحة المتاحة
   */
  async getFreeDiskSpace() {
    try {
      const { stdout } = await this.execCommand(`df -h "${this.tempDir}" | tail -1 | awk '{print $4}'`);
      const sizeStr = stdout.trim();
      
      // تحويل من وحدة النظام إلى بايت (تقريبي)
      if (sizeStr.endsWith('G')) {
        return parseFloat(sizeStr) * 1024 * 1024 * 1024;
      } else if (sizeStr.endsWith('M')) {
        return parseFloat(sizeStr) * 1024 * 1024;
      } else if (sizeStr.endsWith('K')) {
        return parseFloat(sizeStr) * 1024;
      }
      
      return parseInt(sizeStr) || 0;
    } catch (error) {
      logger.warn('⚠️ تحذير: فشل في حساب المساحة المتاحة');
      return 0;
    }
  }

  // اختبارات الاتصال
  async testDatabaseConnection() {
    const dbConfig = this.config.database.connection;
    const testCommand = `PGPASSWORD="${dbConfig.password}" psql -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.username} -d ${dbConfig.database} -c "SELECT 1;" --quiet`;
    await this.execCommand(testCommand);
  }

  async testS3Connection() {
    await this.s3.headBucket({ Bucket: this.config.storage.s3.bucket }).promise();
  }

  async testGitHubConnection() {
    const { Octokit } = require('@octokit/rest');
    const octokit = new Octokit({ auth: this.config.repository.token });
    await octokit.rest.users.getAuthenticated();
  }

  async testCloudinaryConnection() {
    const cloudinary = require('cloudinary').v2;
    cloudinary.config({
      cloud_name: this.config.storage.cloudinary.cloudName,
      api_key: this.config.storage.cloudinary.apiKey,
      api_secret: this.config.storage.cloudinary.apiSecret,
    });
    await cloudinary.api.ping();
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
          resolve({ stdout, stderr });
        }
      });
    });
  }

  /**
   * إعداد الجدولة
   */
  setupScheduling() {
    logger.info('⏰ إعداد جدولة النسخ الاحتياطية...');
    
    const schedulerConfig = this.config.scheduler;
    
    // نسخة احتياطية يومية
    if (schedulerConfig.daily.enabled) {
      const dailyJob = cron.schedule(schedulerConfig.daily.time, async () => {
        logger.info('🔔 بدء النسخ الاحتياطي اليومي المجدول');
        try {
          await this.executePartialBackup('database'); // عادة قاعدة البيانات يومياً
        } catch (error) {
          logger.error('❌ فشل النسخ الاحتياطي اليومي المجدول:', error);
        }
      }, {
        scheduled: false,
        timezone: schedulerConfig.daily.timezone
      });
      
      this.scheduledJobs.push({ name: 'daily', job: dailyJob, type: 'database' });
    }
    
    // نسخة احتياطية أسبوعية
    if (schedulerConfig.weekly.enabled) {
      const weeklyJob = cron.schedule(schedulerConfig.weekly.time, async () => {
        logger.info('🔔 بدء النسخ الاحتياطي الأسبوعي المجدول');
        try {
          await this.executeAllBackups(); // جميع المكونات أسبوعياً
        } catch (error) {
          logger.error('❌ فشل النسخ الاحتياطي الأسبوعي المجدول:', error);
        }
      }, {
        scheduled: false,
        timezone: schedulerConfig.weekly.timezone
      });
      
      this.scheduledJobs.push({ name: 'weekly', job: weeklyJob, type: 'all' });
    }
    
    // نسخة احتياطية شهرية
    if (schedulerConfig.monthly.enabled) {
      const monthlyJob = cron.schedule(schedulerConfig.monthly.time, async () => {
        logger.info('🔔 بدء النسخ الاحتياطي الشهري المجدول');
        try {
          await this.executeFullBackup('full'); // نسخة شاملة شهرياً
        } catch (error) {
          logger.error('❌ فشل النسخ الاحتياطي الشهري المجدول:', error);
        }
      }, {
        scheduled: false,
        timezone: schedulerConfig.monthly.timezone
      });
      
      this.scheduledJobs.push({ name: 'monthly', job: monthlyJob, type: 'full' });
    }
    
    logger.info(`✅ تم إعداد ${this.scheduledJobs.length} وظيفة مجدولة`);
  }

  /**
   * بدء الجدولة
   */
  startScheduling() {
    logger.info('▶️ بدء تشغيل الجدولة...');
    
    for (const scheduledJob of this.scheduledJobs) {
      scheduledJob.job.start();
      logger.info(`✅ تم تشغيل وظيفة ${scheduledJob.name} (${scheduledJob.type})`);
    }
    
    logger.info('🎯 جميع الوظائف المجدولة نشطة');
  }

  /**
   * إيقاف الجدولة
   */
  stopScheduling() {
    logger.info('⏹️ إيقاف الجدولة...');
    
    for (const scheduledJob of this.scheduledJobs) {
      scheduledJob.job.stop();
      logger.info(`🛑 تم إيقاف وظيفة ${scheduledJob.name}`);
    }
    
    logger.info('✅ تم إيقاف جميع الوظائف المجدولة');
  }
}

// تشغيل النسخ الاحتياطي إذا تم استدعاء الملف مباشرة
if (require.main === module) {
  const orchestrator = new BackupOrchestrator();
  
  // تحديد نوع النسخ الاحتياطي من الوسائط
  const backupType = process.argv[2] || 'manual';
  
  orchestrator.executeFullBackup(backupType)
    .then(() => {
      logger.info('🎉 انتهت عملية النسخ الاحتياطي الشامل بنجاح');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('❌ فشلت عملية النسخ الاحتياطي الشامل:', error);
      process.exit(1);
    });
}

module.exports = BackupOrchestrator;
