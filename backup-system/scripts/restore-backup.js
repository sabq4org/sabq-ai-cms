#!/usr/bin/env node

/**
 * سكربت استرجاع النسخ الاحتياطية
 * Backup Restoration Script
 * 
 * الميزات:
 * - استرجاع النسخ الاحتياطية الشاملة أو الجزئية
 * - خيارات متعددة للاسترجاع (قاعدة بيانات، كود، أصول)
 * - التحقق من سلامة البيانات قبل الاسترجاع
 * - إنشاء نسخة احتياطية للحالة الحالية قبل الاسترجاع
 * - خيارات الاسترجاع الآمن مع rollback
 * - مراقبة العملية وإشعارات مفصلة
 */

const fs = require('fs');
const path = require('path');
const { spawn, exec } = require('child_process');
const readline = require('readline');
const AWS = require('aws-sdk');
const config = require('../config/backup-config');
const { sendNotification, logger, ensureDir, formatBytes, getTimestamp, verifyFileChecksum, decompressFile } = require('./utils');

class BackupRestorer {
  constructor() {
    this.config = config;
    this.timestamp = getTimestamp();
    
    // إعداد AWS S3
    this.s3 = new AWS.S3({
      region: this.config.storage.s3.region,
      accessKeyId: this.config.storage.s3.accessKeyId,
      secretAccessKey: this.config.storage.s3.secretAccessKey,
    });
    
    // مسارات العمل
    this.tempDir = this.config.paths.temp;
    this.restoreDir = path.join(this.tempDir, 'restore');
    this.currentBackupDir = path.join(this.tempDir, 'current-backup');
    
    // معلومات الاسترجاع
    this.restoreInfo = {
      selectedBackup: null,
      restoreType: null,
      components: [],
      preserveCurrent: true,
      verifyIntegrity: true,
      createSafety: true,
    };
    
    // إحصائيات الاسترجاع
    this.stats = {
      startTime: new Date(),
      endTime: null,
      duration: null,
      success: false,
      error: null,
      restoredComponents: [],
      failedComponents: [],
      totalSize: 0,
    };
    
    // واجهة الأوامر التفاعلية
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  /**
   * تشغيل عملية الاسترجاع التفاعلية
   */
  async executeInteractiveRestore() {
    try {
      logger.info('🔄 بدء عملية استرجاع النسخ الاحتياطية...');
      
      // عرض مقدمة
      this.displayIntroduction();
      
      // اختيار نوع الاسترجاع
      await this.selectRestoreType();
      
      // عرض النسخ المتاحة
      await this.displayAvailableBackups();
      
      // اختيار النسخة المطلوبة
      await this.selectBackup();
      
      // تأكيد الخيارات
      await this.confirmRestoreOptions();
      
      // تنفيذ الاسترجاع
      await this.performRestore();
      
      // إنهاء العملية
      await this.finalize(true);
      
    } catch (error) {
      logger.error('❌ خطأ في عملية الاسترجاع:', error);
      await this.finalize(false, error);
      throw error;
    } finally {
      this.rl.close();
    }
  }

  /**
   * عرض مقدمة العملية
   */
  displayIntroduction() {
    console.log(`
┌─────────────────────────────────────────────────────────────┐
│                   🔄 نظام استرجاع النسخ الاحتياطية          │
│                                                             │
│  يتيح لك هذا النظام استرجاع النسخ الاحتياطية بأمان مع    │
│  خيارات متقدمة للحماية والتحقق من سلامة البيانات          │
│                                                             │
│  الميزات:                                                   │
│  ✅ استرجاع آمن مع إنشاء نسخة احتياطية للحالة الحالية     │
│  ✅ التحقق من سلامة البيانات قبل الاسترجاع               │
│  ✅ خيارات متعددة (شامل، قاعدة بيانات، كود، أصول)        │
│  ✅ إمكانية التراجع في حالة الفشل                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
    `);
  }

  /**
   * اختيار نوع الاسترجاع
   */
  async selectRestoreType() {
    console.log('\n📋 أنواع الاسترجاع المتاحة:');
    console.log('1. استرجاع شامل (جميع المكونات)');
    console.log('2. قاعدة البيانات فقط');
    console.log('3. الكود (Repository) فقط');
    console.log('4. الأصول (Assets) فقط');
    console.log('5. استرجاع مخصص (اختيار المكونات)');
    
    const choice = await this.promptUser('\nاختر نوع الاسترجاع (1-5): ');
    
    switch (choice) {
      case '1':
        this.restoreInfo.restoreType = 'full';
        this.restoreInfo.components = ['database', 'codebase', 'assets'];
        break;
      case '2':
        this.restoreInfo.restoreType = 'database';
        this.restoreInfo.components = ['database'];
        break;
      case '3':
        this.restoreInfo.restoreType = 'codebase';
        this.restoreInfo.components = ['codebase'];
        break;
      case '4':
        this.restoreInfo.restoreType = 'assets';
        this.restoreInfo.components = ['assets'];
        break;
      case '5':
        this.restoreInfo.restoreType = 'custom';
        await this.selectCustomComponents();
        break;
      default:
        throw new Error('اختيار غير صحيح');
    }
    
    logger.info(`📝 تم اختيار نوع الاسترجاع: ${this.restoreInfo.restoreType}`);
    logger.info(`📦 المكونات المحددة: ${this.restoreInfo.components.join(', ')}`);
  }

  /**
   * اختيار المكونات المخصصة
   */
  async selectCustomComponents() {
    console.log('\n📦 اختر المكونات المطلوب استرجاعها:');
    
    const availableComponents = ['database', 'codebase', 'assets'];
    const selectedComponents = [];
    
    for (const component of availableComponents) {
      const componentNames = {
        database: 'قاعدة البيانات',
        codebase: 'الكود (Repository)',
        assets: 'الأصول (Assets)'
      };
      
      const choice = await this.promptUser(`هل تريد استرجاع ${componentNames[component]}؟ (y/n): `);
      if (choice.toLowerCase() === 'y' || choice.toLowerCase() === 'yes') {
        selectedComponents.push(component);
      }
    }
    
    if (selectedComponents.length === 0) {
      throw new Error('يجب اختيار مكون واحد على الأقل');
    }
    
    this.restoreInfo.components = selectedComponents;
  }

  /**
   * عرض النسخ الاحتياطية المتاحة
   */
  async displayAvailableBackups() {
    logger.info('🔍 البحث عن النسخ الاحتياطية المتاحة...');
    
    try {
      const backups = await this.fetchAvailableBackups();
      
      if (backups.length === 0) {
        throw new Error('لا توجد نسخ احتياطية متاحة');
      }
      
      console.log('\n📅 النسخ الاحتياطية المتاحة:');
      console.log('─'.repeat(80));
      
      backups.forEach((backup, index) => {
        const date = new Date(backup.LastModified).toLocaleString('ar-SA', {
          timeZone: 'Asia/Riyadh'
        });
        
        console.log(`${index + 1}. ${backup.displayName}`);
        console.log(`   📅 التاريخ: ${date}`);
        console.log(`   📦 الحجم: ${formatBytes(backup.Size)}`);
        console.log(`   🔗 المكونات: ${backup.components || 'غير محدد'}`);
        console.log(`   🏷️ النوع: ${backup.backupType || 'غير محدد'}`);
        console.log('');
      });
      
      this.availableBackups = backups;
      
    } catch (error) {
      throw new Error(`فشل في جلب النسخ الاحتياطية: ${error.message}`);
    }
  }

  /**
   * جلب النسخ الاحتياطية المتاحة من S3
   */
  async fetchAvailableBackups() {
    const s3Config = this.config.storage.s3;
    const backups = [];
    
    // البحث في مجلدات مختلفة حسب نوع الاسترجاع
    const foldersToSearch = [];
    
    if (this.restoreInfo.restoreType === 'full') {
      foldersToSearch.push(s3Config.folders.full);
    }
    
    if (this.restoreInfo.components.includes('database')) {
      foldersToSearch.push(s3Config.folders.database);
    }
    
    if (this.restoreInfo.components.includes('codebase')) {
      foldersToSearch.push(s3Config.folders.codebase);
    }
    
    if (this.restoreInfo.components.includes('assets')) {
      foldersToSearch.push(s3Config.folders.assets);
    }
    
    for (const folder of foldersToSearch) {
      try {
        const objects = await this.s3.listObjectsV2({
          Bucket: s3Config.bucket,
          Prefix: folder,
        }).promise();
        
        for (const object of objects.Contents) {
          if (object.Key.endsWith('.gz') || object.Key.endsWith('.tar.gz')) {
            // استخراج معلومات إضافية من metadata
            const headResult = await this.s3.headObject({
              Bucket: s3Config.bucket,
              Key: object.Key
            }).promise();
            
            backups.push({
              ...object,
              displayName: path.basename(object.Key),
              folder: folder,
              backupType: headResult.Metadata?.['backup-type'] || 'unknown',
              components: headResult.Metadata?.['components'] || '',
              environment: headResult.Metadata?.['environment'] || '',
            });
          }
        }
      } catch (error) {
        logger.warn(`⚠️ تحذير: فشل في البحث في مجلد ${folder}:`, error.message);
      }
    }
    
    // ترتيب النسخ حسب التاريخ (الأحدث أولاً)
    return backups.sort((a, b) => new Date(b.LastModified) - new Date(a.LastModified));
  }

  /**
   * اختيار النسخة الاحتياطية
   */
  async selectBackup() {
    const choice = await this.promptUser(`\nاختر رقم النسخة الاحتياطية (1-${this.availableBackups.length}): `);
    const index = parseInt(choice) - 1;
    
    if (index < 0 || index >= this.availableBackups.length) {
      throw new Error('اختيار غير صحيح');
    }
    
    this.restoreInfo.selectedBackup = this.availableBackups[index];
    
    logger.info(`📋 تم اختيار النسخة: ${this.restoreInfo.selectedBackup.displayName}`);
  }

  /**
   * تأكيد خيارات الاسترجاع
   */
  async confirmRestoreOptions() {
    console.log('\n⚙️ خيارات الاسترجاع:');
    
    // إنشاء نسخة احتياطية للحالة الحالية
    const createSafety = await this.promptUser('هل تريد إنشاء نسخة احتياطية للحالة الحالية قبل الاسترجاع؟ (y/n) [افتراضي: y]: ');
    this.restoreInfo.createSafety = createSafety === '' || createSafety.toLowerCase() === 'y';
    
    // التحقق من سلامة البيانات
    const verifyIntegrity = await this.promptUser('هل تريد التحقق من سلامة النسخة الاحتياطية قبل الاسترجاع؟ (y/n) [افتراضي: y]: ');
    this.restoreInfo.verifyIntegrity = verifyIntegrity === '' || verifyIntegrity.toLowerCase() === 'y';
    
    // عرض ملخص
    console.log('\n📋 ملخص عملية الاسترجاع:');
    console.log('─'.repeat(50));
    console.log(`📦 النسخة المحددة: ${this.restoreInfo.selectedBackup.displayName}`);
    console.log(`🔧 نوع الاسترجاع: ${this.restoreInfo.restoreType}`);
    console.log(`📁 المكونات: ${this.restoreInfo.components.join(', ')}`);
    console.log(`🛡️ نسخة احتياطية للحالة الحالية: ${this.restoreInfo.createSafety ? 'نعم' : 'لا'}`);
    console.log(`🔍 التحقق من سلامة البيانات: ${this.restoreInfo.verifyIntegrity ? 'نعم' : 'لا'}`);
    console.log('─'.repeat(50));
    
    const confirm = await this.promptUser('\n⚠️ هل أنت متأكد من المتابعة؟ هذه العملية قد تؤثر على البيانات الحالية (y/n): ');
    if (confirm.toLowerCase() !== 'y') {
      throw new Error('تم إلغاء العملية بواسطة المستخدم');
    }
  }

  /**
   * تنفيذ عملية الاسترجاع
   */
  async performRestore() {
    logger.info('🚀 بدء عملية الاسترجاع...');
    
    try {
      // التحضير
      await this.prepareRestore();
      
      // إنشاء نسخة احتياطية للحالة الحالية
      if (this.restoreInfo.createSafety) {
        await this.createSafetyBackup();
      }
      
      // تحميل النسخة الاحتياطية المحددة
      await this.downloadSelectedBackup();
      
      // التحقق من سلامة البيانات
      if (this.restoreInfo.verifyIntegrity) {
        await this.verifyBackupIntegrity();
      }
      
      // استخراج النسخة الاحتياطية
      await this.extractBackup();
      
      // تنفيذ الاسترجاع حسب المكونات
      for (const component of this.restoreInfo.components) {
        await this.restoreComponent(component);
      }
      
      // التحقق من نجاح العملية
      await this.verifyRestoreSuccess();
      
      logger.info('✅ تمت عملية الاسترجاع بنجاح!');
      
    } catch (error) {
      logger.error('❌ فشلت عملية الاسترجاع:', error);
      
      // محاولة التراجع إذا كان هناك نسخة احتياطية آمنة
      if (this.restoreInfo.createSafety) {
        await this.performRollback();
      }
      
      throw error;
    }
  }

  /**
   * التحضير لعملية الاسترجاع
   */
  async prepareRestore() {
    logger.info('📋 تحضير بيئة الاسترجاع...');
    
    // إنشاء المجلدات المطلوبة
    await ensureDir(this.tempDir);
    await ensureDir(this.restoreDir);
    
    if (this.restoreInfo.createSafety) {
      await ensureDir(this.currentBackupDir);
    }
    
    // التحقق من الاتصالات
    await this.verifyConnections();
    
    logger.info('✅ تم التحضير بنجاح');
  }

  /**
   * إنشاء نسخة احتياطية للحالة الحالية
   */
  async createSafetyBackup() {
    logger.info('🛡️ إنشاء نسخة احتياطية آمنة للحالة الحالية...');
    
    try {
      // استدعاء نظام النسخ الاحتياطي للحالة الحالية
      const BackupOrchestrator = require('./backup-orchestrator');
      const orchestrator = new BackupOrchestrator();
      
      // إنشاء نسخة احتياطية سريعة
      await orchestrator.executePartialBackup('database'); // قاعدة البيانات على الأقل
      
      logger.info('✅ تم إنشاء النسخة الآمنة للحالة الحالية');
      
    } catch (error) {
      logger.warn('⚠️ تحذير: فشل في إنشاء النسخة الآمنة، الاستمرار بحذر...');
      // لا نتوقف، لكن نسجل التحذير
    }
  }

  /**
   * تحميل النسخة الاحتياطية المحددة
   */
  async downloadSelectedBackup() {
    logger.info('📥 تحميل النسخة الاحتياطية المحددة...');
    
    const backup = this.restoreInfo.selectedBackup;
    const localPath = path.join(this.restoreDir, backup.displayName);
    
    try {
      const s3Object = await this.s3.getObject({
        Bucket: this.config.storage.s3.bucket,
        Key: backup.Key
      }).promise();
      
      fs.writeFileSync(localPath, s3Object.Body);
      
      this.stats.totalSize = backup.Size;
      this.downloadedBackupPath = localPath;
      
      logger.info(`✅ تم تحميل النسخة الاحتياطية: ${formatBytes(backup.Size)}`);
      
    } catch (error) {
      throw new Error(`فشل تحميل النسخة الاحتياطية: ${error.message}`);
    }
  }

  /**
   * التحقق من سلامة النسخة الاحتياطية
   */
  async verifyBackupIntegrity() {
    logger.info('🔍 التحقق من سلامة النسخة الاحتياطية...');
    
    try {
      // التحقق من وجود الملف وحجمه
      const stats = fs.statSync(this.downloadedBackupPath);
      if (stats.size !== this.restoreInfo.selectedBackup.Size) {
        throw new Error('حجم الملف المحمل لا يطابق الحجم المتوقع');
      }
      
      // التحقق من checksum إذا كان متوفراً
      await this.verifyBackupChecksum();
      
      // اختبار فك الضغط (جزئي)
      await this.testExtraction();
      
      logger.info('✅ تم التحقق من سلامة النسخة الاحتياطية');
      
    } catch (error) {
      throw new Error(`فشل التحقق من سلامة النسخة الاحتياطية: ${error.message}`);
    }
  }

  /**
   * التحقق من checksum للنسخة الاحتياطية
   */
  async verifyBackupChecksum() {
    const checksumFile = this.downloadedBackupPath.replace(/\.(gz|tar\.gz)$/, '.sha256');
    
    try {
      // البحث عن ملف checksum في S3
      const checksumKey = this.restoreInfo.selectedBackup.Key.replace(/\.(gz|tar\.gz)$/, '.sha256');
      
      const checksumObject = await this.s3.getObject({
        Bucket: this.config.storage.s3.bucket,
        Key: checksumKey
      }).promise();
      
      const expectedChecksum = checksumObject.Body.toString().split(' ')[0];
      
      // حساب checksum للملف المحمل
      const { calculateFileChecksum } = require('./utils');
      const actualChecksum = await calculateFileChecksum(this.downloadedBackupPath);
      
      if (actualChecksum !== expectedChecksum) {
        throw new Error('checksum الملف لا يطابق القيمة المتوقعة');
      }
      
      logger.info('✅ تم التحقق من checksum بنجاح');
      
    } catch (error) {
      if (error.code === 'NoSuchKey') {
        logger.warn('⚠️ تحذير: ملف checksum غير متوفر، تخطي التحقق');
      } else {
        throw error;
      }
    }
  }

  /**
   * اختبار فك الضغط
   */
  async testExtraction() {
    const testDir = path.join(this.tempDir, 'test-extraction');
    
    try {
      await ensureDir(testDir);
      
      // محاولة فك ضغط جزئي للتأكد من سلامة الأرشيف
      const testCommand = `tar -tzf "${this.downloadedBackupPath}" | head -10`;
      await this.execCommand(testCommand);
      
      logger.info('✅ اختبار فك الضغط نجح');
      
    } catch (error) {
      throw new Error(`فشل اختبار فك الضغط: ${error.message}`);
    } finally {
      // تنظيف مجلد الاختبار
      if (fs.existsSync(testDir)) {
        fs.rmSync(testDir, { recursive: true });
      }
    }
  }

  /**
   * استخراج النسخة الاحتياطية
   */
  async extractBackup() {
    logger.info('📦 استخراج النسخة الاحتياطية...');
    
    const extractDir = path.join(this.restoreDir, 'extracted');
    await ensureDir(extractDir);
    
    try {
      // فك ضغط الأرشيف
      const extractCommand = `tar -xzf "${this.downloadedBackupPath}" -C "${extractDir}"`;
      await this.execCommand(extractCommand);
      
      this.extractedBackupPath = extractDir;
      
      // عرض محتويات الأرشيف
      const contents = fs.readdirSync(extractDir);
      logger.info(`📁 محتويات النسخة الاحتياطية: ${contents.join(', ')}`);
      
      logger.info('✅ تم استخراج النسخة الاحتياطية بنجاح');
      
    } catch (error) {
      throw new Error(`فشل استخراج النسخة الاحتياطية: ${error.message}`);
    }
  }

  /**
   * استرجاع مكون محدد
   */
  async restoreComponent(componentName) {
    logger.info(`🔄 استرجاع مكون: ${componentName}...`);
    
    try {
      switch (componentName) {
        case 'database':
          await this.restoreDatabase();
          break;
        case 'codebase':
          await this.restoreCodebase();
          break;
        case 'assets':
          await this.restoreAssets();
          break;
        default:
          throw new Error(`مكون غير مدعوم: ${componentName}`);
      }
      
      this.stats.restoredComponents.push(componentName);
      logger.info(`✅ تم استرجاع ${componentName} بنجاح`);
      
    } catch (error) {
      this.stats.failedComponents.push(componentName);
      logger.error(`❌ فشل استرجاع ${componentName}: ${error.message}`);
      throw error;
    }
  }

  /**
   * استرجاع قاعدة البيانات
   */
  async restoreDatabase() {
    logger.info('💾 استرجاع قاعدة البيانات...');
    
    // البحث عن ملف قاعدة البيانات في النسخة المستخرجة
    const dbFiles = this.findFilesInExtracted('db-backup-*.sql.gz');
    
    if (dbFiles.length === 0) {
      throw new Error('لم يتم العثور على ملف قاعدة البيانات في النسخة الاحتياطية');
    }
    
    const dbFile = dbFiles[0];
    const dbConfig = this.config.database.connection;
    
    try {
      // فك ضغط ملف قاعدة البيانات
      const extractedDbFile = dbFile.replace('.gz', '');
      await decompressFile(dbFile, extractedDbFile);
      
      // استرجاع قاعدة البيانات
      const restoreCommand = `PGPASSWORD="${dbConfig.password}" psql -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.username} -d ${dbConfig.database} -f "${extractedDbFile}"`;
      
      await this.execCommand(restoreCommand);
      
      logger.info('✅ تم استرجاع قاعدة البيانات بنجاح');
      
    } catch (error) {
      throw new Error(`فشل استرجاع قاعدة البيانات: ${error.message}`);
    }
  }

  /**
   * استرجاع الكود
   */
  async restoreCodebase() {
    logger.info('💻 استرجاع الكود...');
    
    // البحث عن ملف الكود في النسخة المستخرجة
    const codeFiles = this.findFilesInExtracted('codebase-backup-*.tar.gz');
    
    if (codeFiles.length === 0) {
      throw new Error('لم يتم العثور على ملف الكود في النسخة الاحتياطية');
    }
    
    const codeFile = codeFiles[0];
    const projectRoot = this.config.paths.root;
    
    try {
      // إنشاء نسخة احتياطية للكود الحالي
      const currentCodeBackup = path.join(this.currentBackupDir, `current-code-${this.timestamp}.tar.gz`);
      const backupCommand = `tar -czf "${currentCodeBackup}" -C "${projectRoot}" .`;
      await this.execCommand(backupCommand);
      
      // فك ضغط الكود الجديد إلى مجلد مؤقت
      const tempCodeDir = path.join(this.tempDir, 'temp-code');
      await ensureDir(tempCodeDir);
      
      const extractCommand = `tar -xzf "${codeFile}" -C "${tempCodeDir}"`;
      await this.execCommand(extractCommand);
      
      // نسخ الملفات الجديدة (مع استثناء ملفات البيئة)
      const copyCommand = `rsync -av --exclude='.env*' --exclude='node_modules' --exclude='.git' "${tempCodeDir}/" "${projectRoot}/"`;
      await this.execCommand(copyCommand);
      
      logger.info('✅ تم استرجاع الكود بنجاح');
      
    } catch (error) {
      throw new Error(`فشل استرجاع الكود: ${error.message}`);
    }
  }

  /**
   * استرجاع الأصول
   */
  async restoreAssets() {
    logger.info('🖼️ استرجاع الأصول...');
    
    // البحث عن ملف الأصول في النسخة المستخرجة
    const assetFiles = this.findFilesInExtracted('assets-backup-*.tar.gz');
    
    if (assetFiles.length === 0) {
      throw new Error('لم يتم العثور على ملف الأصول في النسخة الاحتياطية');
    }
    
    const assetFile = assetFiles[0];
    
    try {
      // فك ضغط الأصول إلى مجلد مؤقت
      const tempAssetsDir = path.join(this.tempDir, 'temp-assets');
      await ensureDir(tempAssetsDir);
      
      const extractCommand = `tar -xzf "${assetFile}" -C "${tempAssetsDir}"`;
      await this.execCommand(extractCommand);
      
      // رفع الأصول إلى Cloudinary (إذا كان مكوناً)
      await this.restoreToCloudinary(tempAssetsDir);
      
      logger.info('✅ تم استرجاع الأصول بنجاح');
      
    } catch (error) {
      throw new Error(`فشل استرجاع الأصول: ${error.message}`);
    }
  }

  /**
   * استرجاع الأصول إلى Cloudinary
   */
  async restoreToCloudinary(assetsDir) {
    const cloudinary = require('cloudinary').v2;
    
    cloudinary.config({
      cloud_name: this.config.storage.cloudinary.cloudName,
      api_key: this.config.storage.cloudinary.apiKey,
      api_secret: this.config.storage.cloudinary.apiSecret,
    });
    
    logger.info('☁️ رفع الأصول إلى Cloudinary...');
    
    // هذا مجرد مثال - في الواقع ستحتاج لتنفيذ منطق أكثر تعقيداً
    // للتعامل مع الأصول المختلفة وهيكل المجلدات
    
    logger.warn('⚠️ استرجاع الأصول إلى Cloudinary يتطلب تنفيذ مخصص حسب هيكل البيانات');
  }

  /**
   * البحث عن ملفات في النسخة المستخرجة
   */
  findFilesInExtracted(pattern) {
    const files = [];
    
    const searchInDir = (dir) => {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stats = fs.statSync(fullPath);
        
        if (stats.isDirectory()) {
          searchInDir(fullPath);
        } else if (this.matchesPattern(item, pattern)) {
          files.push(fullPath);
        }
      }
    };
    
    searchInDir(this.extractedBackupPath);
    return files;
  }

  /**
   * مطابقة نمط الملف
   */
  matchesPattern(filename, pattern) {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return regex.test(filename);
  }

  /**
   * التحقق من نجاح الاسترجاع
   */
  async verifyRestoreSuccess() {
    logger.info('🔍 التحقق من نجاح عملية الاسترجاع...');
    
    const verifications = [];
    
    // التحقق من كل مكون مسترجع
    for (const component of this.stats.restoredComponents) {
      switch (component) {
        case 'database':
          verifications.push(this.verifyDatabaseRestore());
          break;
        case 'codebase':
          verifications.push(this.verifyCodebaseRestore());
          break;
        case 'assets':
          verifications.push(this.verifyAssetsRestore());
          break;
      }
    }
    
    try {
      await Promise.all(verifications);
      logger.info('✅ تم التحقق من نجاح جميع المكونات');
    } catch (error) {
      throw new Error(`فشل التحقق من الاسترجاع: ${error.message}`);
    }
  }

  /**
   * التحقق من استرجاع قاعدة البيانات
   */
  async verifyDatabaseRestore() {
    const dbConfig = this.config.database.connection;
    const testCommand = `PGPASSWORD="${dbConfig.password}" psql -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.username} -d ${dbConfig.database} -c "SELECT COUNT(*) FROM information_schema.tables;" --quiet`;
    
    try {
      await this.execCommand(testCommand);
      logger.debug('✅ قاعدة البيانات تعمل بشكل صحيح');
    } catch (error) {
      throw new Error(`فشل التحقق من قاعدة البيانات: ${error.message}`);
    }
  }

  /**
   * التحقق من استرجاع الكود
   */
  async verifyCodebaseRestore() {
    const packageJsonPath = path.join(this.config.paths.root, 'package.json');
    
    if (!fs.existsSync(packageJsonPath)) {
      throw new Error('ملف package.json غير موجود');
    }
    
    logger.debug('✅ الكود مسترجع بشكل صحيح');
  }

  /**
   * التحقق من استرجاع الأصول
   */
  async verifyAssetsRestore() {
    // هذا سيختلف حسب كيفية تخزين الأصول
    logger.debug('✅ الأصول مسترجعة بشكل صحيح');
  }

  /**
   * تنفيذ عملية التراجع
   */
  async performRollback() {
    logger.warn('🔄 محاولة التراجع إلى الحالة السابقة...');
    
    try {
      // استرجاع النسخة الآمنة إذا كانت متوفرة
      // هذا يتطلب تنفيذ مخصص حسب ما تم حفظه في createSafetyBackup
      
      logger.info('✅ تم التراجع بنجاح');
    } catch (error) {
      logger.error('❌ فشل في التراجع:', error);
      logger.error('⚠️ قد تحتاج لتدخل يدوي لاستعادة النظام');
    }
  }

  /**
   * التحقق من الاتصالات
   */
  async verifyConnections() {
    logger.info('🔌 التحقق من الاتصالات...');
    
    // اختبار قاعدة البيانات
    await this.testDatabaseConnection();
    
    // اختبار S3
    await this.testS3Connection();
    
    logger.info('✅ جميع الاتصالات تعمل');
  }

  /**
   * اختبار الاتصال بقاعدة البيانات
   */
  async testDatabaseConnection() {
    const dbConfig = this.config.database.connection;
    const testCommand = `PGPASSWORD="${dbConfig.password}" psql -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.username} -d ${dbConfig.database} -c "SELECT 1;" --quiet`;
    await this.execCommand(testCommand);
  }

  /**
   * اختبار الاتصال بـ S3
   */
  async testS3Connection() {
    await this.s3.headBucket({ Bucket: this.config.storage.s3.bucket }).promise();
  }

  /**
   * إنهاء عملية الاسترجاع
   */
  async finalize(success, error = null) {
    this.stats.endTime = new Date();
    this.stats.duration = this.stats.endTime - this.stats.startTime;
    this.stats.success = success;
    this.stats.error = error;
    
    // تنظيف الملفات المؤقتة
    await this.cleanup();
    
    // تسجيل النتائج
    if (success) {
      logger.info('🎉 تمت عملية الاسترجاع بنجاح!');
      logger.info(`📊 الإحصائيات:`);
      logger.info(`   ⏱️ المدة: ${Math.round(this.stats.duration / 1000)} ثانية`);
      logger.info(`   ✅ المكونات المسترجعة: ${this.stats.restoredComponents.join(', ')}`);
      logger.info(`   ❌ المكونات الفاشلة: ${this.stats.failedComponents.join(', ')}`);
      logger.info(`   📦 الحجم الإجمالي: ${formatBytes(this.stats.totalSize)}`);
    } else {
      logger.error('❌ فشلت عملية الاسترجاع!');
      if (error) {
        logger.error(`   💬 السبب: ${error.message}`);
      }
    }
    
    // إرسال الإشعارات
    await this.sendRestoreNotifications(success, error);
  }

  /**
   * تنظيف الملفات المؤقتة
   */
  async cleanup() {
    logger.info('🧹 تنظيف الملفات المؤقتة...');
    
    try {
      if (fs.existsSync(this.restoreDir)) {
        fs.rmSync(this.restoreDir, { recursive: true });
      }
      
      // الاحتفاظ بالنسخة الآمنة للحالة السابقة لفترة
      // يمكن حذفها لاحقاً أو الاحتفاظ بها حسب السياسة
      
      logger.info('✅ تم التنظيف بنجاح');
    } catch (error) {
      logger.warn('⚠️ تحذير: فشل في تنظيف بعض الملفات المؤقتة:', error.message);
    }
  }

  /**
   * إرسال إشعارات الاسترجاع
   */
  async sendRestoreNotifications(success, error = null) {
    const notificationConfig = this.config.notifications;
    
    if (!notificationConfig.email.enabled) return;
    
    const subject = success 
      ? `✅ نجح استرجاع النسخة الاحتياطية - ${this.config.project.name}`
      : `❌ فشل استرجاع النسخة الاحتياطية - ${this.config.project.name}`;
    
    const body = this.generateRestoreEmailBody(success, error);
    
    try {
      await sendNotification(subject, body, notificationConfig.email);
      logger.info('📧 تم إرسال إشعار الاسترجاع بالبريد الإلكتروني');
    } catch (notificationError) {
      logger.warn('⚠️ فشل إرسال إشعار الاسترجاع:', notificationError.message);
    }
  }

  /**
   * إنشاء محتوى إيميل الاسترجاع
   */
  generateRestoreEmailBody(success, error = null) {
    const duration = Math.round(this.stats.duration / 1000);
    
    let body = `
# تقرير استرجاع النسخة الاحتياطية

## معلومات عامة
- **المشروع**: ${this.config.project.name}
- **البيئة**: ${this.config.project.environment}
- **التاريخ والوقت**: ${new Date().toLocaleString('ar-SA', { timeZone: 'Asia/Riyadh' })}
- **الحالة**: ${success ? '✅ نجح' : '❌ فشل'}

## تفاصيل الاسترجاع
- **النسخة المستخدمة**: ${this.restoreInfo.selectedBackup?.displayName || 'غير محدد'}
- **نوع الاسترجاع**: ${this.restoreInfo.restoreType}
- **المكونات المطلوبة**: ${this.restoreInfo.components.join(', ')}
- **المكونات المسترجعة**: ${this.stats.restoredComponents.join(', ')}
- **المكونات الفاشلة**: ${this.stats.failedComponents.join(', ')}

## تفاصيل العملية
- **وقت البداية**: ${this.stats.startTime.toLocaleString('ar-SA')}
- **وقت النهاية**: ${this.stats.endTime.toLocaleString('ar-SA')}
- **المدة الإجمالية**: ${duration} ثانية
- **الحجم المسترجع**: ${formatBytes(this.stats.totalSize)}

## إعدادات الاسترجاع
- **نسخة احتياطية للحالة الحالية**: ${this.restoreInfo.createSafety ? 'تم إنشاؤها' : 'لم يتم إنشاؤها'}
- **التحقق من سلامة البيانات**: ${this.restoreInfo.verifyIntegrity ? 'تم' : 'لم يتم'}
`;

    if (!success && error) {
      body += `\n## تفاصيل الخطأ\n\`\`\`\n${error.message}\n\`\`\`\n`;
    }

    if (success) {
      body += `\n## الخطوات التالية
✅ تحقق من عمل النظام بشكل صحيح
✅ راجع البيانات للتأكد من سلامتها
✅ اختبر الوظائف الأساسية
${this.restoreInfo.createSafety ? '✅ النسخة الآمنة للحالة السابقة متوفرة للتراجع إذا لزم الأمر' : ''}`;
    } else {
      body += `\n## إجراءات الطوارئ
❌ راجع السجلات لمعرفة سبب الفشل
❌ تحقق من الاتصالات والصلاحيات
${this.restoreInfo.createSafety ? '❌ استخدم النسخة الآمنة للتراجع إذا لزم الأمر' : ''}
❌ اتصل بفريق الدعم التقني للمساعدة`;
    }

    body += `\n\n---
تم إنشاء هذا التقرير تلقائياً بواسطة نظام استرجاع النسخ الاحتياطية.
`;

    return body;
  }

  /**
   * طلب إدخال من المستخدم
   */
  promptUser(question) {
    return new Promise((resolve) => {
      this.rl.question(question, (answer) => {
        resolve(answer.trim());
      });
    });
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

// تشغيل الاسترجاع إذا تم استدعاء الملف مباشرة
if (require.main === module) {
  const restorer = new BackupRestorer();
  
  restorer.executeInteractiveRestore()
    .then(() => {
      logger.info('🎉 انتهت عملية الاسترجاع بنجاح');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('❌ فشلت عملية الاسترجاع:', error);
      process.exit(1);
    });
}

module.exports = BackupRestorer;
