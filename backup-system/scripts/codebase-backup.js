#!/usr/bin/env node

/**
 * نسخ احتياطي للكود من GitHub Repository
 * GitHub Repository Backup Script
 * 
 * الميزات:
 * - تحميل نسخة كاملة من المستودع (GitHub Repository)
 * - إنشاء أرشيف مضغوط مع استبعاد الملفات غير المطلوبة
 * - رفع إلى AWS S3 مع metadata
 * - إدارة النسخ القديمة
 * - توثيق تفصيلي للتغييرات والإحصائيات
 */

const fs = require('fs');
const path = require('path');
const { spawn, exec } = require('child_process');
const archiver = require('archiver');
const { Octokit } = require('@octokit/rest');
const AWS = require('aws-sdk');
const config = require('../config/backup-config');
const { sendNotification, logger, ensureDir, formatBytes, getTimestamp } = require('./utils');

class CodebaseBackup {
  constructor() {
    this.config = config;
    this.timestamp = getTimestamp();
    this.backupFileName = `codebase-backup-${this.timestamp}.tar.gz`;
    this.metadataFileName = `codebase-metadata-${this.timestamp}.json`;
    
    // إعداد GitHub API
    this.octokit = new Octokit({
      auth: this.config.repository.token,
    });
    
    // إعداد AWS S3
    this.s3 = new AWS.S3({
      region: this.config.storage.s3.region,
      accessKeyId: this.config.storage.s3.accessKeyId,
      secretAccessKey: this.config.storage.s3.secretAccessKey,
    });
    
    // مسارات الملفات
    this.tempDir = this.config.paths.temp;
    this.repoDir = path.join(this.tempDir, 'repo-clone');
    this.backupPath = path.join(this.tempDir, this.backupFileName);
    this.metadataPath = path.join(this.tempDir, this.metadataFileName);
    
    // معلومات المستودع
    this.repoInfo = null;
    this.commitInfo = null;
    this.fileStats = {
      totalFiles: 0,
      totalSize: 0,
      archiveSize: 0,
      compressionRatio: 0,
    };
    
    // إحصائيات العملية
    this.stats = {
      startTime: new Date(),
      endTime: null,
      duration: null,
      success: false,
      error: null,
    };
  }

  /**
   * تنفيذ النسخ الاحتياطي الكامل
   */
  async execute() {
    try {
      logger.info('🚀 بدء عملية النسخ الاحتياطي للكود...');
      
      // التحضير
      await this.prepare();
      
      // جمع معلومات المستودع
      await this.gatherRepositoryInfo();
      
      // استنساخ المستودع
      await this.cloneRepository();
      
      // تنظيف الملفات غير المطلوبة
      await this.cleanupUnnecessaryFiles();
      
      // إنشاء الأرشيف المضغوط
      await this.createArchive();
      
      // إنشاء ملف البيانات الوصفية
      await this.createMetadata();
      
      // رفع إلى S3
      await this.uploadToS3();
      
      // تنظيف النسخ القديمة
      await this.cleanupOldBackups();
      
      // إنهاء العملية
      await this.finalize(true);
      
    } catch (error) {
      logger.error('❌ خطأ في عملية النسخ الاحتياطي للكود:', error);
      await this.finalize(false, error);
      throw error;
    }
  }

  /**
   * التحضير للعملية
   */
  async prepare() {
    logger.info('📋 تحضير بيئة النسخ الاحتياطي للكود...');
    
    // إنشاء المجلدات المطلوبة
    await ensureDir(this.tempDir);
    await ensureDir(this.repoDir);
    
    // التحقق من متطلبات البرامج
    await this.checkRequirements();
    
    // التحقق من صحة إعدادات GitHub
    await this.validateGitHubAccess();
    
    logger.info('✅ تم التحضير بنجاح');
  }

  /**
   * التحقق من توفر البرامج المطلوبة
   */
  async checkRequirements() {
    const commands = ['git', 'tar'];
    
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
   * التحقق من صحة الوصول إلى GitHub
   */
  async validateGitHubAccess() {
    try {
      const { data: user } = await this.octokit.rest.users.getAuthenticated();
      logger.info(`✅ تم التحقق من GitHub (مستخدم: ${user.login})`);
    } catch (error) {
      throw new Error(`فشل التحقق من GitHub: ${error.message}`);
    }
  }

  /**
   * جمع معلومات المستودع
   */
  async gatherRepositoryInfo() {
    logger.info('📊 جمع معلومات المستودع...');
    
    const repoConfig = this.config.repository;
    
    try {
      // معلومات المستودع الأساسية
      const { data: repo } = await this.octokit.rest.repos.get({
        owner: repoConfig.owner,
        repo: repoConfig.repo,
      });
      
      // معلومات آخر commit
      const { data: commits } = await this.octokit.rest.repos.listCommits({
        owner: repoConfig.owner,
        repo: repoConfig.repo,
        sha: repoConfig.branch,
        per_page: 1,
      });
      
      this.repoInfo = {
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description,
        defaultBranch: repo.default_branch,
        size: repo.size,
        language: repo.language,
        createdAt: repo.created_at,
        updatedAt: repo.updated_at,
        pushedAt: repo.pushed_at,
        stargazersCount: repo.stargazers_count,
        forksCount: repo.forks_count,
        openIssuesCount: repo.open_issues_count,
        cloneUrl: repo.clone_url,
        sshUrl: repo.ssh_url,
      };
      
      this.commitInfo = commits[0] ? {
        sha: commits[0].sha,
        message: commits[0].commit.message,
        author: commits[0].commit.author,
        committer: commits[0].commit.committer,
        url: commits[0].html_url,
      } : null;
      
      logger.info(`📋 المستودع: ${repo.full_name}`);
      logger.info(`📏 الحجم: ${repo.size} KB`);
      logger.info(`🔗 آخر commit: ${commits[0]?.sha?.substring(0, 8) || 'غير متوفر'}`);
      
    } catch (error) {
      throw new Error(`فشل في جمع معلومات المستودع: ${error.message}`);
    }
  }

  /**
   * استنساخ المستودع
   */
  async cloneRepository() {
    logger.info('📥 استنساخ المستودع...');
    
    const repoConfig = this.config.repository;
    const cloneUrl = `https://${repoConfig.token}@github.com/${repoConfig.owner}/${repoConfig.repo}.git`;
    
    // حذف المجلد إذا كان موجوداً
    if (fs.existsSync(this.repoDir)) {
      await this.execCommand(`rm -rf "${this.repoDir}"`);
    }
    
    // استنساخ المستودع
    const cloneCommand = `git clone --depth 1 --branch ${repoConfig.branch} "${cloneUrl}" "${this.repoDir}"`;
    
    try {
      await this.execCommand(cloneCommand);
      logger.info('✅ تم استنساخ المستودع بنجاح');
    } catch (error) {
      throw new Error(`فشل في استنساخ المستودع: ${error.message}`);
    }
  }

  /**
   * تنظيف الملفات غير المطلوبة
   */
  async cleanupUnnecessaryFiles() {
    logger.info('🧹 تنظيف الملفات غير المطلوبة...');
    
    const excludePaths = this.config.repository.excludePaths;
    
    for (const excludePath of excludePaths) {
      const fullPath = path.join(this.repoDir, excludePath);
      
      try {
        if (fs.existsSync(fullPath)) {
          await this.execCommand(`rm -rf "${fullPath}"`);
          logger.debug(`🗑️ تم حذف: ${excludePath}`);
        }
      } catch (error) {
        logger.warn(`⚠️ تحذير: فشل حذف ${excludePath}: ${error.message}`);
      }
    }
    
    // حذف مجلد .git لتوفير المساحة
    const gitDir = path.join(this.repoDir, '.git');
    if (fs.existsSync(gitDir)) {
      await this.execCommand(`rm -rf "${gitDir}"`);
      logger.debug('🗑️ تم حذف مجلد .git');
    }
    
    logger.info('✅ تم تنظيف الملفات غير المطلوبة');
  }

  /**
   * حساب إحصائيات الملفات
   */
  async calculateFileStats() {
    logger.info('📊 حساب إحصائيات الملفات...');
    
    try {
      // عدد الملفات
      const fileCountOutput = await this.execCommand(`find "${this.repoDir}" -type f | wc -l`);
      this.fileStats.totalFiles = parseInt(fileCountOutput.trim());
      
      // الحجم الإجمالي بالبايت
      const sizeOutput = await this.execCommand(`du -sb "${this.repoDir}" | cut -f1`);
      this.fileStats.totalSize = parseInt(sizeOutput.trim());
      
      logger.info(`📁 عدد الملفات: ${this.fileStats.totalFiles.toLocaleString()}`);
      logger.info(`📏 الحجم الإجمالي: ${formatBytes(this.fileStats.totalSize)}`);
      
    } catch (error) {
      logger.warn('⚠️ تحذير: فشل في حساب إحصائيات الملفات:', error.message);
    }
  }

  /**
   * إنشاء أرشيف مضغوط
   */
  async createArchive() {
    logger.info('📦 إنشاء الأرشيف المضغوط...');
    
    // حساب إحصائيات الملفات قبل الضغط
    await this.calculateFileStats();
    
    return new Promise((resolve, reject) => {
      const output = fs.createWriteStream(this.backupPath);
      const archive = archiver('tar', {
        gzip: true,
        gzipOptions: {
          level: 9, // أقصى ضغط
          chunkSize: 1024,
          windowBits: 15,
          memLevel: 8,
        }
      });
      
      output.on('close', () => {
        const stats = fs.statSync(this.backupPath);
        this.fileStats.archiveSize = stats.size;
        this.fileStats.compressionRatio = this.fileStats.totalSize > 0 
          ? ((this.fileStats.totalSize - this.fileStats.archiveSize) / this.fileStats.totalSize * 100).toFixed(2)
          : 0;
        
        logger.info(`✅ تم إنشاء الأرشيف بنجاح`);
        logger.info(`📦 حجم الأرشيف: ${formatBytes(this.fileStats.archiveSize)}`);
        logger.info(`🗜️ نسبة الضغط: ${this.fileStats.compressionRatio}%`);
        
        resolve();
      });
      
      output.on('error', reject);
      archive.on('error', reject);
      
      archive.pipe(output);
      
      // إضافة محتويات المجلد إلى الأرشيف
      archive.directory(this.repoDir, false);
      
      archive.finalize();
    });
  }

  /**
   * إنشاء ملف البيانات الوصفية
   */
  async createMetadata() {
    logger.info('📋 إنشاء ملف البيانات الوصفية...');
    
    const metadata = {
      // معلومات النسخة الاحتياطية
      backup: {
        timestamp: this.timestamp,
        date: new Date().toISOString(),
        type: 'codebase',
        version: this.config.project.version,
        environment: this.config.project.environment,
      },
      
      // معلومات المستودع
      repository: {
        ...this.repoInfo,
        branch: this.config.repository.branch,
        commit: this.commitInfo,
      },
      
      // إحصائيات الملفات
      fileStats: this.fileStats,
      
      // إعدادات النسخ الاحتياطي
      backupConfig: {
        includePaths: this.config.repository.includePaths,
        excludePaths: this.config.repository.excludePaths,
        createArchive: this.config.repository.createArchive,
        archiveFormat: this.config.repository.archiveFormat,
      },
      
      // معلومات النظام
      system: {
        platform: process.platform,
        nodeVersion: process.version,
        hostname: require('os').hostname(),
        timestamp: Date.now(),
      }
    };
    
    try {
      fs.writeFileSync(this.metadataPath, JSON.stringify(metadata, null, 2));
      logger.info('✅ تم إنشاء ملف البيانات الوصفية');
    } catch (error) {
      throw new Error(`فشل في إنشاء ملف البيانات الوصفية: ${error.message}`);
    }
  }

  /**
   * رفع النسخة الاحتياطية إلى AWS S3
   */
  async uploadToS3() {
    logger.info('☁️ رفع النسخة الاحتياطية إلى AWS S3...');
    
    const s3Config = this.config.storage.s3;
    
    // رفع ملف الأرشيف
    const archiveKey = `${s3Config.folders.codebase}/${this.backupFileName}`;
    await this.uploadFileToS3(this.backupPath, archiveKey);
    
    // رفع ملف البيانات الوصفية
    const metadataKey = `${s3Config.folders.codebase}/${this.metadataFileName}`;
    await this.uploadFileToS3(this.metadataPath, metadataKey);
    
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
        'backup-type': 'codebase',
        'project': this.config.project.name,
        'environment': this.config.project.environment,
        'repository': this.repoInfo?.fullName || 'unknown',
        'commit-sha': this.commitInfo?.sha || 'unknown',
        'file-size': fileStats.size.toString(),
        'total-files': this.fileStats.totalFiles.toString(),
        'compression-ratio': this.fileStats.compressionRatio.toString(),
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
        Prefix: `${s3Config.folders.codebase}/codebase-backup-`,
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
      
      // حذف النسخ القديمة مع ملفات البيانات الوصفية المرتبطة
      for (const object of sortedObjects) {
        // حذف ملف الأرشيف
        await this.s3.deleteObject({
          Bucket: s3Config.bucket,
          Key: object.Key
        }).promise();
        
        // حذف ملف البيانات الوصفية المرتبط
        const metadataKey = object.Key.replace('codebase-backup-', 'codebase-metadata-').replace('.tar.gz', '.json');
        try {
          await this.s3.deleteObject({
            Bucket: s3Config.bucket,
            Key: metadataKey
          }).promise();
        } catch (metadataError) {
          logger.warn(`⚠️ لم يتم العثور على ملف البيانات الوصفية: ${metadataKey}`);
        }
        
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
      if (fs.existsSync(this.repoDir)) {
        await this.execCommand(`rm -rf "${this.repoDir}"`);
      }
      if (fs.existsSync(this.backupPath)) fs.unlinkSync(this.backupPath);
      if (fs.existsSync(this.metadataPath)) fs.unlinkSync(this.metadataPath);
    } catch (cleanupError) {
      logger.warn('⚠️ تحذير: فشل في تنظيف الملفات المؤقتة:', cleanupError.message);
    }
    
    // تسجيل النتائج
    if (success) {
      logger.info('🎉 تمت عملية النسخ الاحتياطي للكود بنجاح!');
      logger.info(`📊 الإحصائيات:`);
      logger.info(`   ⏱️ المدة: ${Math.round(this.stats.duration / 1000)} ثانية`);
      logger.info(`   📁 عدد الملفات: ${this.fileStats.totalFiles.toLocaleString()}`);
      logger.info(`   📏 الحجم الأصلي: ${formatBytes(this.fileStats.totalSize)}`);
      logger.info(`   📦 حجم الأرشيف: ${formatBytes(this.fileStats.archiveSize)}`);
      logger.info(`   🗜️ نسبة الضغط: ${this.fileStats.compressionRatio}%`);
    } else {
      logger.error('❌ فشلت عملية النسخ الاحتياطي للكود!');
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
      ? `✅ نجحت عملية النسخ الاحتياطي للكود - ${this.config.project.name}`
      : `❌ فشلت عملية النسخ الاحتياطي للكود - ${this.config.project.name}`;
    
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
# تقرير النسخ الاحتياطي للكود

## معلومات عامة
- **المشروع**: ${this.config.project.name}
- **البيئة**: ${this.config.project.environment}
- **التاريخ والوقت**: ${new Date().toLocaleString('ar-SA', { timeZone: 'Asia/Riyadh' })}
- **الحالة**: ${success ? '✅ نجح' : '❌ فشل'}

## معلومات المستودع
- **المستودع**: ${this.repoInfo?.fullName || 'غير متوفر'}
- **الفرع**: ${this.config.repository.branch}
- **آخر commit**: ${this.commitInfo?.sha?.substring(0, 8) || 'غير متوفر'}
- **رسالة commit**: ${this.commitInfo?.message || 'غير متوفر'}

## تفاصيل العملية
- **وقت البداية**: ${this.stats.startTime.toLocaleString('ar-SA')}
- **وقت النهاية**: ${this.stats.endTime.toLocaleString('ar-SA')}
- **المدة الإجمالية**: ${duration} ثانية

## إحصائيات الملفات
- **عدد الملفات**: ${this.fileStats.totalFiles.toLocaleString()}
- **الحجم الأصلي**: ${formatBytes(this.fileStats.totalSize)}
- **حجم الأرشيف**: ${formatBytes(this.fileStats.archiveSize)}
- **نسبة الضغط**: ${this.fileStats.compressionRatio}%
`;

    if (!success && error) {
      body += `\n## تفاصيل الخطأ\n\`\`\`\n${error.message}\n\`\`\`\n`;
    }

    body += `\n## إعدادات النسخ الاحتياطي
- **التخزين**: AWS S3 (${this.config.storage.s3.bucket})
- **مجلد التخزين**: ${this.config.storage.s3.folders.codebase}
- **تنسيق الأرشيف**: ${this.config.repository.archiveFormat}

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
  const backup = new CodebaseBackup();
  
  backup.execute()
    .then(() => {
      logger.info('🎉 انتهت عملية النسخ الاحتياطي للكود بنجاح');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('❌ فشلت عملية النسخ الاحتياطي للكود:', error);
      process.exit(1);
    });
}

module.exports = CodebaseBackup;
