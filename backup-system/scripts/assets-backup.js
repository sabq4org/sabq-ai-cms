#!/usr/bin/env node

/**
 * نسخ احتياطي للأصول (Assets) - الصور والملفات من Cloudinary و AWS S3
 * Assets Backup Script - Images and Files from Cloudinary and AWS S3
 * 
 * الميزات:
 * - نسخ احتياطي شامل للصور من Cloudinary
 * - نسخ احتياطي للملفات من AWS S3
 * - تصدير metadata للصور مع tags وcontext
 * - رفع إلى S3 منفصل للنسخ الاحتياطية
 * - إدارة النسخ القديمة
 * - تقارير تفصيلية للأصول
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const axios = require('axios');
const archiver = require('archiver');
const cloudinary = require('cloudinary').v2;
const AWS = require('aws-sdk');
const config = require('../config/backup-config');
const { sendNotification, logger, ensureDir, formatBytes, getTimestamp } = require('./utils');

class AssetsBackup {
  constructor() {
    this.config = config;
    this.timestamp = getTimestamp();
    this.backupFileName = `assets-backup-${this.timestamp}.tar.gz`;
    this.metadataFileName = `assets-metadata-${this.timestamp}.json`;
    
    // إعداد Cloudinary
    cloudinary.config({
      cloud_name: this.config.storage.cloudinary.cloudName,
      api_key: this.config.storage.cloudinary.apiKey,
      api_secret: this.config.storage.cloudinary.apiSecret,
    });
    
    // إعداد AWS S3 للنسخ الاحتياطية
    this.s3 = new AWS.S3({
      region: this.config.storage.s3.region,
      accessKeyId: this.config.storage.s3.accessKeyId,
      secretAccessKey: this.config.storage.s3.secretAccessKey,
    });
    
    // مسارات الملفات
    this.tempDir = this.config.paths.temp;
    this.assetsDir = path.join(this.tempDir, 'assets-download');
    this.cloudinaryDir = path.join(this.assetsDir, 'cloudinary');
    this.s3AssetsDir = path.join(this.assetsDir, 's3-assets');
    this.backupPath = path.join(this.tempDir, this.backupFileName);
    this.metadataPath = path.join(this.tempDir, this.metadataFileName);
    
    // إحصائيات الأصول
    this.assetsStats = {
      cloudinary: {
        totalResources: 0,
        totalSize: 0,
        downloadedFiles: 0,
        downloadedSize: 0,
        failedDownloads: 0,
        resourceTypes: {},
        folders: {},
      },
      s3Assets: {
        totalObjects: 0,
        totalSize: 0,
        downloadedFiles: 0,
        downloadedSize: 0,
        failedDownloads: 0,
      },
      archive: {
        size: 0,
        compressionRatio: 0,
      }
    };
    
    // metadata للأصول
    this.assetsMetadata = {
      cloudinary: {
        resources: [],
        folders: [],
        transformations: [],
      },
      s3Assets: {
        objects: [],
      }
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
      logger.info('🚀 بدء عملية النسخ الاحتياطي للأصول...');
      
      // التحضير
      await this.prepare();
      
      // نسخ احتياطي من Cloudinary
      await this.backupCloudinaryAssets();
      
      // نسخ احتياطي من S3 الحالي (إذا وجد)
      await this.backupS3Assets();
      
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
      logger.error('❌ خطأ في عملية النسخ الاحتياطي للأصول:', error);
      await this.finalize(false, error);
      throw error;
    }
  }

  /**
   * التحضير للعملية
   */
  async prepare() {
    logger.info('📋 تحضير بيئة النسخ الاحتياطي للأصول...');
    
    // إنشاء المجلدات المطلوبة
    await ensureDir(this.tempDir);
    await ensureDir(this.assetsDir);
    await ensureDir(this.cloudinaryDir);
    await ensureDir(this.s3AssetsDir);
    
    // التحقق من صحة إعدادات Cloudinary
    await this.validateCloudinaryAccess();
    
    logger.info('✅ تم التحضير بنجاح');
  }

  /**
   * التحقق من صحة الوصول إلى Cloudinary
   */
  async validateCloudinaryAccess() {
    try {
      const result = await cloudinary.api.ping();
      logger.info('✅ تم التحقق من Cloudinary بنجاح');
      return result;
    } catch (error) {
      throw new Error(`فشل التحقق من Cloudinary: ${error.message}`);
    }
  }

  /**
   * نسخ احتياطي للأصول من Cloudinary
   */
  async backupCloudinaryAssets() {
    logger.info('🖼️ بدء النسخ الاحتياطي من Cloudinary...');
    
    const cloudinaryConfig = this.config.storage.cloudinary;
    
    try {
      // جمع معلومات جميع الموارد
      await this.gatherCloudinaryResources();
      
      // تحميل الموارد حسب النوع
      for (const resourceType of cloudinaryConfig.resourceTypes) {
        await this.downloadCloudinaryResources(resourceType);
      }
      
      logger.info(`✅ انتهى النسخ الاحتياطي من Cloudinary`);
      logger.info(`📊 إحصائيات Cloudinary:`);
      logger.info(`   📁 إجمالي الموارد: ${this.assetsStats.cloudinary.totalResources}`);
      logger.info(`   📥 تم تحميل: ${this.assetsStats.cloudinary.downloadedFiles}`);
      logger.info(`   ❌ فشل التحميل: ${this.assetsStats.cloudinary.failedDownloads}`);
      logger.info(`   📏 الحجم المحمل: ${formatBytes(this.assetsStats.cloudinary.downloadedSize)}`);
      
    } catch (error) {
      throw new Error(`فشل في النسخ الاحتياطي من Cloudinary: ${error.message}`);
    }
  }

  /**
   * جمع معلومات الموارد من Cloudinary
   */
  async gatherCloudinaryResources() {
    logger.info('📋 جمع معلومات الموارد من Cloudinary...');
    
    const cloudinaryConfig = this.config.storage.cloudinary;
    
    for (const resourceType of cloudinaryConfig.resourceTypes) {
      let nextCursor = null;
      let pageCount = 0;
      
      do {
        try {
          const options = {
            resource_type: resourceType,
            max_results: 500,
            context: cloudinaryConfig.includeContext,
            tags: cloudinaryConfig.includeTags,
            metadata: cloudinaryConfig.includeMetadata,
          };
          
          if (nextCursor) {
            options.next_cursor = nextCursor;
          }
          
          const result = await cloudinary.api.resources(options);
          
          // حفظ معلومات الموارد
          this.assetsMetadata.cloudinary.resources.push(...result.resources);
          
          // تحديث الإحصائيات
          this.assetsStats.cloudinary.totalResources += result.resources.length;
          
          for (const resource of result.resources) {
            this.assetsStats.cloudinary.totalSize += resource.bytes || 0;
            
            // تجميع إحصائيات حسب النوع
            if (!this.assetsStats.cloudinary.resourceTypes[resourceType]) {
              this.assetsStats.cloudinary.resourceTypes[resourceType] = 0;
            }
            this.assetsStats.cloudinary.resourceTypes[resourceType]++;
            
            // تجميع إحصائيات حسب المجلد
            if (resource.folder) {
              if (!this.assetsStats.cloudinary.folders[resource.folder]) {
                this.assetsStats.cloudinary.folders[resource.folder] = 0;
              }
              this.assetsStats.cloudinary.folders[resource.folder]++;
            }
          }
          
          nextCursor = result.next_cursor;
          pageCount++;
          
          logger.debug(`📄 صفحة ${pageCount} من ${resourceType}: ${result.resources.length} مورد`);
          
        } catch (error) {
          logger.warn(`⚠️ تحذير: فشل في جمع موارد ${resourceType}:`, error.message);
          break;
        }
        
      } while (nextCursor && pageCount < 100); // حد أقصى 100 صفحة لتجنب التعليق
    }
    
    logger.info(`📊 تم جمع ${this.assetsStats.cloudinary.totalResources} مورد من Cloudinary`);
  }

  /**
   * تحميل الموارد من Cloudinary حسب النوع
   */
  async downloadCloudinaryResources(resourceType) {
    logger.info(`📥 تحميل موارد ${resourceType} من Cloudinary...`);
    
    const resources = this.assetsMetadata.cloudinary.resources.filter(
      resource => resource.resource_type === resourceType
    );
    
    const typeDir = path.join(this.cloudinaryDir, resourceType);
    await ensureDir(typeDir);
    
    let downloadCount = 0;
    let failCount = 0;
    
    for (const resource of resources) {
      try {
        await this.downloadCloudinaryResource(resource, typeDir);
        downloadCount++;
        
        // تحديث الإحصائيات
        this.assetsStats.cloudinary.downloadedFiles++;
        this.assetsStats.cloudinary.downloadedSize += resource.bytes || 0;
        
        // تأخير قصير لتجنب تجاوز معدل الطلبات
        if (downloadCount % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
      } catch (error) {
        logger.warn(`⚠️ فشل تحميل ${resource.public_id}:`, error.message);
        failCount++;
        this.assetsStats.cloudinary.failedDownloads++;
      }
    }
    
    logger.info(`✅ ${resourceType}: تم تحميل ${downloadCount} ملف، فشل ${failCount} ملف`);
  }

  /**
   * تحميل مورد واحد من Cloudinary
   */
  async downloadCloudinaryResource(resource, typeDir) {
    const extension = resource.format || 'unknown';
    const fileName = `${resource.public_id.replace(/\//g, '_')}.${extension}`;
    const filePath = path.join(typeDir, fileName);
    
    // إنشاء المجلد إذا لم يكن موجوداً
    const fileDir = path.dirname(filePath);
    await ensureDir(fileDir);
    
    // تحميل الملف
    const response = await axios({
      method: 'GET',
      url: resource.secure_url,
      responseType: 'stream',
      timeout: 30000, // 30 ثانية timeout
    });
    
    return new Promise((resolve, reject) => {
      const writer = fs.createWriteStream(filePath);
      
      response.data.pipe(writer);
      
      writer.on('finish', resolve);
      writer.on('error', reject);
      
      // timeout للكتابة
      setTimeout(() => {
        writer.destroy();
        reject(new Error('Timeout downloading resource'));
      }, 60000); // دقيقة واحدة timeout للكتابة
    });
  }

  /**
   * نسخ احتياطي للأصول من S3 الحالي
   */
  async backupS3Assets() {
    logger.info('📦 بدء النسخ الاحتياطي من S3 الحالي...');
    
    try {
      // البحث عن buckets للصور في next.config.js
      const imageHosts = this.extractS3HostsFromConfig();
      
      if (imageHosts.length === 0) {
        logger.info('ℹ️ لم يتم العثور على S3 buckets للنسخ الاحتياطي');
        return;
      }
      
      for (const host of imageHosts) {
        await this.downloadS3Assets(host);
      }
      
      logger.info(`✅ انتهى النسخ الاحتياطي من S3`);
      logger.info(`📊 إحصائيات S3:`);
      logger.info(`   📁 إجمالي الكائنات: ${this.assetsStats.s3Assets.totalObjects}`);
      logger.info(`   📥 تم تحميل: ${this.assetsStats.s3Assets.downloadedFiles}`);
      logger.info(`   ❌ فشل التحميل: ${this.assetsStats.s3Assets.failedDownloads}`);
      logger.info(`   📏 الحجم المحمل: ${formatBytes(this.assetsStats.s3Assets.downloadedSize)}`);
      
    } catch (error) {
      logger.warn(`⚠️ تحذير: فشل في النسخ الاحتياطي من S3: ${error.message}`);
    }
  }

  /**
   * استخراج أسماء S3 hosts من next.config.js
   */
  extractS3HostsFromConfig() {
    const hosts = [];
    
    try {
      const configPath = path.join(this.config.paths.root, 'next.config.js');
      const configContent = fs.readFileSync(configPath, 'utf8');
      
      // البحث عن S3 hostnames في remotePatterns
      const s3Patterns = configContent.match(/hostname:\s*["']([^"']*s3[^"']*)["']/g);
      
      if (s3Patterns) {
        for (const pattern of s3Patterns) {
          const match = pattern.match(/hostname:\s*["']([^"']*)["']/);
          if (match && match[1]) {
            const hostname = match[1];
            // استخراج bucket name من hostname
            const bucketMatch = hostname.match(/^([^.]+)\.s3/);
            if (bucketMatch) {
              hosts.push({
                hostname: hostname,
                bucket: bucketMatch[1],
              });
            }
          }
        }
      }
      
    } catch (error) {
      logger.warn('⚠️ تحذير: فشل في قراءة next.config.js:', error.message);
    }
    
    return hosts;
  }

  /**
   * تحميل الأصول من S3 bucket محدد
   */
  async downloadS3Assets(hostInfo) {
    logger.info(`📥 تحميل الأصول من S3: ${hostInfo.bucket}...`);
    
    try {
      // قائمة الكائنات في bucket
      const listParams = {
        Bucket: hostInfo.bucket,
        MaxKeys: 1000, // حد أقصى للتجربة
      };
      
      const objects = await this.s3.listObjectsV2(listParams).promise();
      
      if (!objects.Contents || objects.Contents.length === 0) {
        logger.info(`ℹ️ لا توجد كائنات في bucket: ${hostInfo.bucket}`);
        return;
      }
      
      const bucketDir = path.join(this.s3AssetsDir, hostInfo.bucket);
      await ensureDir(bucketDir);
      
      let downloadCount = 0;
      let failCount = 0;
      
      for (const object of objects.Contents) {
        try {
          await this.downloadS3Object(hostInfo.bucket, object, bucketDir);
          downloadCount++;
          
          // تحديث الإحصائيات
          this.assetsStats.s3Assets.downloadedFiles++;
          this.assetsStats.s3Assets.downloadedSize += object.Size || 0;
          
        } catch (error) {
          logger.warn(`⚠️ فشل تحميل ${object.Key}:`, error.message);
          failCount++;
          this.assetsStats.s3Assets.failedDownloads++;
        }
      }
      
      this.assetsStats.s3Assets.totalObjects += objects.Contents.length;
      this.assetsStats.s3Assets.totalSize += objects.Contents.reduce((sum, obj) => sum + (obj.Size || 0), 0);
      
      logger.info(`✅ ${hostInfo.bucket}: تم تحميل ${downloadCount} ملف، فشل ${failCount} ملف`);
      
    } catch (error) {
      throw new Error(`فشل في تحميل الأصول من S3 bucket ${hostInfo.bucket}: ${error.message}`);
    }
  }

  /**
   * تحميل كائن واحد من S3
   */
  async downloadS3Object(bucket, object, bucketDir) {
    const fileName = object.Key.replace(/\//g, '_'); // تجنب مشاكل المسارات
    const filePath = path.join(bucketDir, fileName);
    
    const params = {
      Bucket: bucket,
      Key: object.Key,
    };
    
    const s3Object = await this.s3.getObject(params).promise();
    
    fs.writeFileSync(filePath, s3Object.Body);
    
    // حفظ metadata
    this.assetsMetadata.s3Assets.objects.push({
      bucket: bucket,
      key: object.Key,
      size: object.Size,
      lastModified: object.LastModified,
      etag: object.ETag,
      storageClass: object.StorageClass,
      metadata: s3Object.Metadata,
    });
  }

  /**
   * إنشاء أرشيف مضغوط للأصول
   */
  async createArchive() {
    logger.info('📦 إنشاء الأرشيف المضغوط للأصول...');
    
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
        this.assetsStats.archive.size = stats.size;
        
        const totalOriginalSize = this.assetsStats.cloudinary.downloadedSize + this.assetsStats.s3Assets.downloadedSize;
        this.assetsStats.archive.compressionRatio = totalOriginalSize > 0 
          ? ((totalOriginalSize - this.assetsStats.archive.size) / totalOriginalSize * 100).toFixed(2)
          : 0;
        
        logger.info(`✅ تم إنشاء أرشيف الأصول بنجاح`);
        logger.info(`📦 حجم الأرشيف: ${formatBytes(this.assetsStats.archive.size)}`);
        logger.info(`🗜️ نسبة الضغط: ${this.assetsStats.archive.compressionRatio}%`);
        
        resolve();
      });
      
      output.on('error', reject);
      archive.on('error', reject);
      
      archive.pipe(output);
      
      // إضافة محتويات مجلد الأصول إلى الأرشيف
      archive.directory(this.assetsDir, false);
      
      archive.finalize();
    });
  }

  /**
   * إنشاء ملف البيانات الوصفية
   */
  async createMetadata() {
    logger.info('📋 إنشاء ملف البيانات الوصفية للأصول...');
    
    const metadata = {
      // معلومات النسخة الاحتياطية
      backup: {
        timestamp: this.timestamp,
        date: new Date().toISOString(),
        type: 'assets',
        version: this.config.project.version,
        environment: this.config.project.environment,
      },
      
      // إحصائيات الأصول
      statistics: this.assetsStats,
      
      // metadata الأصول
      assets: this.assetsMetadata,
      
      // إعدادات النسخ الاحتياطي
      backupConfig: {
        cloudinary: this.config.storage.cloudinary,
        s3: {
          bucket: this.config.storage.s3.bucket,
          folders: this.config.storage.s3.folders,
        }
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
      logger.info('✅ تم إنشاء ملف البيانات الوصفية للأصول');
    } catch (error) {
      throw new Error(`فشل في إنشاء ملف البيانات الوصفية: ${error.message}`);
    }
  }

  /**
   * رفع النسخة الاحتياطية إلى AWS S3
   */
  async uploadToS3() {
    logger.info('☁️ رفع النسخة الاحتياطية للأصول إلى AWS S3...');
    
    const s3Config = this.config.storage.s3;
    
    // رفع ملف الأرشيف
    const archiveKey = `${s3Config.folders.assets}/${this.backupFileName}`;
    await this.uploadFileToS3(this.backupPath, archiveKey);
    
    // رفع ملف البيانات الوصفية
    const metadataKey = `${s3Config.folders.assets}/${this.metadataFileName}`;
    await this.uploadFileToS3(this.metadataPath, metadataKey);
    
    logger.info('✅ تم رفع النسخة الاحتياطية للأصول إلى S3 بنجاح');
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
        'backup-type': 'assets',
        'project': this.config.project.name,
        'environment': this.config.project.environment,
        'cloudinary-resources': this.assetsStats.cloudinary.totalResources.toString(),
        's3-objects': this.assetsStats.s3Assets.totalObjects.toString(),
        'total-assets': (this.assetsStats.cloudinary.totalResources + this.assetsStats.s3Assets.totalObjects).toString(),
        'file-size': fileStats.size.toString(),
        'compression-ratio': this.assetsStats.archive.compressionRatio.toString(),
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
    logger.info('🧹 تنظيف النسخ الاحتياطية القديمة للأصول...');
    
    const s3Config = this.config.storage.s3;
    const retentionConfig = this.config.retention.weekly; // الأصول أسبوعية
    
    try {
      // قائمة النسخ الاحتياطية الموجودة
      const listParams = {
        Bucket: s3Config.bucket,
        Prefix: `${s3Config.folders.assets}/assets-backup-`,
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
        const metadataKey = object.Key.replace('assets-backup-', 'assets-metadata-').replace('.tar.gz', '.json');
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
      if (fs.existsSync(this.assetsDir)) {
        await this.execCommand(`rm -rf "${this.assetsDir}"`);
      }
      if (fs.existsSync(this.backupPath)) fs.unlinkSync(this.backupPath);
      if (fs.existsSync(this.metadataPath)) fs.unlinkSync(this.metadataPath);
    } catch (cleanupError) {
      logger.warn('⚠️ تحذير: فشل في تنظيف الملفات المؤقتة:', cleanupError.message);
    }
    
    // تسجيل النتائج
    if (success) {
      const totalAssets = this.assetsStats.cloudinary.totalResources + this.assetsStats.s3Assets.totalObjects;
      const totalDownloaded = this.assetsStats.cloudinary.downloadedFiles + this.assetsStats.s3Assets.downloadedFiles;
      const totalFailed = this.assetsStats.cloudinary.failedDownloads + this.assetsStats.s3Assets.failedDownloads;
      
      logger.info('🎉 تمت عملية النسخ الاحتياطي للأصول بنجاح!');
      logger.info(`📊 الإحصائيات:`);
      logger.info(`   ⏱️ المدة: ${Math.round(this.stats.duration / 1000)} ثانية`);
      logger.info(`   📁 إجمالي الأصول: ${totalAssets.toLocaleString()}`);
      logger.info(`   📥 تم تحميل: ${totalDownloaded.toLocaleString()}`);
      logger.info(`   ❌ فشل التحميل: ${totalFailed.toLocaleString()}`);
      logger.info(`   📦 حجم الأرشيف: ${formatBytes(this.assetsStats.archive.size)}`);
      logger.info(`   🗜️ نسبة الضغط: ${this.assetsStats.archive.compressionRatio}%`);
    } else {
      logger.error('❌ فشلت عملية النسخ الاحتياطي للأصول!');
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
      ? `✅ نجحت عملية النسخ الاحتياطي للأصول - ${this.config.project.name}`
      : `❌ فشلت عملية النسخ الاحتياطي للأصول - ${this.config.project.name}`;
    
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
    const totalAssets = this.assetsStats.cloudinary.totalResources + this.assetsStats.s3Assets.totalObjects;
    const totalDownloaded = this.assetsStats.cloudinary.downloadedFiles + this.assetsStats.s3Assets.downloadedFiles;
    const totalFailed = this.assetsStats.cloudinary.failedDownloads + this.assetsStats.s3Assets.failedDownloads;
    
    let body = `
# تقرير النسخ الاحتياطي للأصول

## معلومات عامة
- **المشروع**: ${this.config.project.name}
- **البيئة**: ${this.config.project.environment}
- **التاريخ والوقت**: ${new Date().toLocaleString('ar-SA', { timeZone: 'Asia/Riyadh' })}
- **الحالة**: ${success ? '✅ نجح' : '❌ فشل'}

## تفاصيل العملية
- **وقت البداية**: ${this.stats.startTime.toLocaleString('ar-SA')}
- **وقت النهاية**: ${this.stats.endTime.toLocaleString('ar-SA')}
- **المدة الإجمالية**: ${duration} ثانية

## إحصائيات الأصول
- **إجمالي الأصول**: ${totalAssets.toLocaleString()}
- **تم تحميل**: ${totalDownloaded.toLocaleString()}
- **فشل التحميل**: ${totalFailed.toLocaleString()}
- **حجم الأرشيف**: ${formatBytes(this.assetsStats.archive.size)}
- **نسبة الضغط**: ${this.assetsStats.archive.compressionRatio}%

### Cloudinary
- **الموارد**: ${this.assetsStats.cloudinary.totalResources.toLocaleString()}
- **تم تحميل**: ${this.assetsStats.cloudinary.downloadedFiles.toLocaleString()}
- **فشل**: ${this.assetsStats.cloudinary.failedDownloads.toLocaleString()}
- **الحجم**: ${formatBytes(this.assetsStats.cloudinary.downloadedSize)}

### AWS S3
- **الكائنات**: ${this.assetsStats.s3Assets.totalObjects.toLocaleString()}
- **تم تحميل**: ${this.assetsStats.s3Assets.downloadedFiles.toLocaleString()}
- **فشل**: ${this.assetsStats.s3Assets.failedDownloads.toLocaleString()}
- **الحجم**: ${formatBytes(this.assetsStats.s3Assets.downloadedSize)}
`;

    if (!success && error) {
      body += `\n## تفاصيل الخطأ\n\`\`\`\n${error.message}\n\`\`\`\n`;
    }

    body += `\n## إعدادات النسخ الاحتياطي
- **التخزين**: AWS S3 (${this.config.storage.s3.bucket})
- **مجلد التخزين**: ${this.config.storage.s3.folders.assets}
- **Cloudinary**: ${this.config.storage.cloudinary.cloudName}

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
  const backup = new AssetsBackup();
  
  backup.execute()
    .then(() => {
      logger.info('🎉 انتهت عملية النسخ الاحتياطي للأصول بنجاح');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('❌ فشلت عملية النسخ الاحتياطي للأصول:', error);
      process.exit(1);
    });
}

module.exports = AssetsBackup;
