#!/usr/bin/env node

/**
 * سكربت التحقق والتشخيص للنظام
 * System Health Check and Diagnostics Script
 * 
 * يقوم بفحص شامل للنظام والإعدادات
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const AWS = require('aws-sdk');
const config = require('../config/backup-config');
const { logger, formatBytes } = require('./utils');

class SystemDiagnostics {
  constructor() {
    this.config = config;
    this.checks = [];
    this.warnings = [];
    this.errors = [];
    this.summary = {
      total: 0,
      passed: 0,
      failed: 0,
      warnings: 0
    };
  }

  /**
   * تشغيل فحص شامل للنظام
   */
  async runFullDiagnostics() {
    logger.info('🔍 بدء الفحص الشامل للنظام...');
    
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    🔍 فحص النظام الشامل                      ║
║                                                              ║
║  يتم فحص جميع مكونات نظام النسخ الاحتياطية للتأكد من       ║
║  جاهزيتها للعمل وسلامة الإعدادات                          ║
╚══════════════════════════════════════════════════════════════╝
    `);

    try {
      // فحص الإعدادات الأساسية
      await this.checkBasicConfiguration();
      
      // فحص متغيرات البيئة
      await this.checkEnvironmentVariables();
      
      // فحص الاتصالات
      await this.checkConnections();
      
      // فحص الملفات والمجلدات
      await this.checkFilesAndDirectories();
      
      // فحص التبعيات
      await this.checkDependencies();
      
      // فحص صلاحيات النظام
      await this.checkSystemPermissions();
      
      // فحص مساحة التخزين
      await this.checkStorageSpace();
      
      // فحص إعدادات PM2
      await this.checkPM2Configuration();
      
      // عرض التقرير النهائي
      this.displayFinalReport();
      
    } catch (error) {
      logger.error('❌ خطأ في الفحص الشامل:', error);
      throw error;
    }
  }

  /**
   * فحص الإعدادات الأساسية
   */
  async checkBasicConfiguration() {
    logger.info('📋 فحص الإعدادات الأساسية...');
    
    this.addCheck('Configuration File', () => {
      const configPath = path.join(__dirname, '../config/backup-config.js');
      if (!fs.existsSync(configPath)) {
        throw new Error('ملف الإعدادات غير موجود');
      }
      
      // التحقق من الحقول المطلوبة
      const requiredFields = [
        'project', 'database', 'storage', 'schedule', 'retention'
      ];
      
      for (const field of requiredFields) {
        if (!this.config[field]) {
          throw new Error(`حقل مطلوب مفقود: ${field}`);
        }
      }
      
      return 'ملف الإعدادات موجود وصحيح';
    });

    this.addCheck('Project Configuration', () => {
      if (!this.config.project.name) {
        throw new Error('اسم المشروع غير محدد');
      }
      if (!this.config.project.environment) {
        throw new Error('بيئة المشروع غير محددة');
      }
      return `المشروع: ${this.config.project.name} (${this.config.project.environment})`;
    });

    this.addCheck('Backup Paths', () => {
      const paths = this.config.paths;
      if (!paths.root || !fs.existsSync(paths.root)) {
        throw new Error('مسار جذر المشروع غير صحيح');
      }
      if (!paths.temp) {
        throw new Error('مسار الملفات المؤقتة غير محدد');
      }
      return 'مسارات النظام صحيحة';
    });
  }

  /**
   * فحص متغيرات البيئة
   */
  async checkEnvironmentVariables() {
    logger.info('🔧 فحص متغيرات البيئة...');

    const requiredEnvVars = [
      // قاعدة البيانات
      { name: 'DATABASE_URL', description: 'رابط قاعدة البيانات' },
      { name: 'POSTGRES_HOST', description: 'خادم PostgreSQL' },
      { name: 'POSTGRES_USER', description: 'مستخدم قاعدة البيانات' },
      { name: 'POSTGRES_PASSWORD', description: 'كلمة مرور قاعدة البيانات' },
      { name: 'POSTGRES_DB', description: 'اسم قاعدة البيانات' },
      
      // AWS
      { name: 'AWS_ACCESS_KEY_ID', description: 'مفتاح الوصول AWS' },
      { name: 'AWS_SECRET_ACCESS_KEY', description: 'المفتاح السري AWS' },
      { name: 'AWS_S3_BUCKET', description: 'اسم bucket S3' },
      
      // Cloudinary
      { name: 'CLOUDINARY_CLOUD_NAME', description: 'اسم Cloudinary cloud' },
      { name: 'CLOUDINARY_API_KEY', description: 'مفتاح Cloudinary API' },
      { name: 'CLOUDINARY_API_SECRET', description: 'مفتاح Cloudinary السري' },
      
      // GitHub
      { name: 'GITHUB_TOKEN', description: 'رمز GitHub المميز' },
      
      // البريد الإلكتروني
      { name: 'SMTP_HOST', description: 'خادم البريد الإلكتروني' },
      { name: 'SMTP_USER', description: 'مستخدم البريد الإلكتروني' },
      { name: 'SMTP_PASS', description: 'كلمة مرور البريد الإلكتروني' }
    ];

    for (const envVar of requiredEnvVars) {
      this.addCheck(`Environment Variable: ${envVar.name}`, () => {
        const value = process.env[envVar.name];
        if (!value) {
          throw new Error(`متغير البيئة مفقود: ${envVar.description}`);
        }
        
        // إخفاء القيم الحساسة في السجلات
        const isSecret = envVar.name.includes('PASSWORD') || 
                        envVar.name.includes('SECRET') || 
                        envVar.name.includes('TOKEN');
        
        return isSecret ? 'محدد (مخفي للأمان)' : `محدد: ${value.substring(0, 10)}...`;
      });
    }

    this.addCheck('Encryption Key', () => {
      const key = process.env.BACKUP_ENCRYPTION_KEY;
      if (!key) {
        this.warnings.push('مفتاح التشفير غير محدد - سيتم تعطيل التشفير');
        return 'غير محدد (تحذير)';
      }
      if (key.length < 32) {
        throw new Error('مفتاح التشفير يجب أن يكون 32 حرف على الأقل');
      }
      return 'محدد وصحيح';
    });
  }

  /**
   * فحص الاتصالات
   */
  async checkConnections() {
    logger.info('🔌 فحص الاتصالات...');

    // فحص قاعدة البيانات
    this.addCheck('Database Connection', async () => {
      const dbConfig = this.config.database.connection;
      const testCommand = `PGPASSWORD="${dbConfig.password}" psql -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.username} -d ${dbConfig.database} -c "SELECT 1;" --quiet`;
      
      try {
        await this.execCommand(testCommand);
        return `متصل بـ ${dbConfig.host}:${dbConfig.port}`;
      } catch (error) {
        throw new Error(`فشل الاتصال بقاعدة البيانات: ${error.message}`);
      }
    });

    // فحص AWS S3
    this.addCheck('AWS S3 Connection', async () => {
      const s3 = new AWS.S3({
        region: this.config.storage.s3.region,
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      });

      try {
        await s3.headBucket({ Bucket: this.config.storage.s3.bucket }).promise();
        return `متصل بـ bucket: ${this.config.storage.s3.bucket}`;
      } catch (error) {
        throw new Error(`فشل الاتصال بـ S3: ${error.message}`);
      }
    });

    // فحص Cloudinary
    this.addCheck('Cloudinary Connection', async () => {
      const cloudinary = require('cloudinary').v2;
      
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });

      try {
        const result = await cloudinary.api.ping();
        return `متصل بـ cloud: ${process.env.CLOUDINARY_CLOUD_NAME}`;
      } catch (error) {
        throw new Error(`فشل الاتصال بـ Cloudinary: ${error.message}`);
      }
    });

    // فحص GitHub
    this.addCheck('GitHub Connection', async () => {
      const { Octokit } = require('@octokit/rest');
      const octokit = new Octokit({
        auth: process.env.GITHUB_TOKEN,
      });

      try {
        const { data } = await octokit.rest.repos.get({
          owner: this.config.storage.repository.owner,
          repo: this.config.storage.repository.name,
        });
        return `متصل بـ ${data.full_name}`;
      } catch (error) {
        throw new Error(`فشل الاتصال بـ GitHub: ${error.message}`);
      }
    });

    // فحص SMTP
    this.addCheck('SMTP Connection', async () => {
      const nodemailer = require('nodemailer');
      
      const transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      try {
        await transporter.verify();
        return `متصل بـ ${process.env.SMTP_HOST}`;
      } catch (error) {
        throw new Error(`فشل الاتصال بـ SMTP: ${error.message}`);
      }
    });
  }

  /**
   * فحص الملفات والمجلدات
   */
  async checkFilesAndDirectories() {
    logger.info('📁 فحص الملفات والمجلدات...');

    const requiredFiles = [
      { path: './backup-system/scripts/backup-orchestrator.js', description: 'المنسق الرئيسي' },
      { path: './backup-system/scripts/database-backup.js', description: 'نسخ قاعدة البيانات' },
      { path: './backup-system/scripts/codebase-backup.js', description: 'نسخ الكود' },
      { path: './backup-system/scripts/assets-backup.js', description: 'نسخ الأصول' },
      { path: './backup-system/scripts/restore-backup.js', description: 'استرجاع النسخ' },
      { path: './backup-system/scripts/utils.js', description: 'الأدوات المساعدة' },
      { path: './backup-system/config/backup-config.js', description: 'ملف الإعدادات' }
    ];

    for (const file of requiredFiles) {
      this.addCheck(`File: ${file.description}`, () => {
        const fullPath = path.resolve(file.path);
        if (!fs.existsSync(fullPath)) {
          throw new Error(`الملف غير موجود: ${file.path}`);
        }
        
        const stats = fs.statSync(fullPath);
        return `موجود (${formatBytes(stats.size)})`;
      });
    }

    // فحص المجلدات المطلوبة
    const requiredDirs = [
      { path: './backup-system', description: 'مجلد النظام الرئيسي' },
      { path: './backup-system/config', description: 'مجلد الإعدادات' },
      { path: './backup-system/scripts', description: 'مجلد السكربتات' },
      { path: './logs', description: 'مجلد السجلات', create: true }
    ];

    for (const dir of requiredDirs) {
      this.addCheck(`Directory: ${dir.description}`, () => {
        const fullPath = path.resolve(dir.path);
        if (!fs.existsSync(fullPath)) {
          if (dir.create) {
            fs.mkdirSync(fullPath, { recursive: true });
            return 'تم إنشاؤه';
          } else {
            throw new Error(`المجلد غير موجود: ${dir.path}`);
          }
        }
        return 'موجود';
      });
    }
  }

  /**
   * فحص التبعيات
   */
  async checkDependencies() {
    logger.info('📦 فحص التبعيات...');

    const requiredDependencies = [
      'winston', 'nodemailer', 'archiver', '@octokit/rest', 
      'node-cron', 'aws-sdk', 'cloudinary'
    ];

    for (const dep of requiredDependencies) {
      this.addCheck(`Dependency: ${dep}`, () => {
        try {
          const packagePath = require.resolve(dep);
          const packageJson = require(`${dep}/package.json`);
          return `مثبت (v${packageJson.version})`;
        } catch (error) {
          throw new Error(`غير مثبت - تشغيل: npm install ${dep}`);
        }
      });
    }

    // فحص أدوات النظام المطلوبة
    const systemTools = [
      { command: 'pg_dump', description: 'أداة نسخ PostgreSQL' },
      { command: 'tar', description: 'أداة الأرشفة' },
      { command: 'gzip', description: 'أداة الضغط' },
      { command: 'git', description: 'نظام التحكم بالإصدار' }
    ];

    for (const tool of systemTools) {
      this.addCheck(`System Tool: ${tool.description}`, async () => {
        try {
          await this.execCommand(`which ${tool.command}`);
          const version = await this.execCommand(`${tool.command} --version | head -1`);
          return `متوفر: ${version.trim()}`;
        } catch (error) {
          throw new Error(`غير متوفر - يرجى تثبيت ${tool.command}`);
        }
      });
    }
  }

  /**
   * فحص صلاحيات النظام
   */
  async checkSystemPermissions() {
    logger.info('🔐 فحص صلاحيات النظام...');

    // فحص صلاحيات الكتابة
    const writePaths = [
      { path: './logs', description: 'مجلد السجلات' },
      { path: '/tmp', description: 'المجلد المؤقت' },
      { path: this.config.paths.root, description: 'جذر المشروع' }
    ];

    for (const pathInfo of writePaths) {
      this.addCheck(`Write Permission: ${pathInfo.description}`, () => {
        try {
          const testFile = path.join(pathInfo.path, '.backup-write-test');
          fs.writeFileSync(testFile, 'test');
          fs.unlinkSync(testFile);
          return 'متاح';
        } catch (error) {
          throw new Error(`لا توجد صلاحية كتابة في: ${pathInfo.path}`);
        }
      });
    }

    // فحص صلاحيات التنفيذ
    this.addCheck('Execution Permissions', () => {
      const scriptPath = path.join(__dirname, 'backup-orchestrator.js');
      try {
        fs.accessSync(scriptPath, fs.constants.X_OK);
        return 'متاح';
      } catch (error) {
        this.warnings.push('قد تحتاج لتعديل صلاحيات تنفيذ السكربتات');
        return 'محدود (تحذير)';
      }
    });
  }

  /**
   * فحص مساحة التخزين
   */
  async checkStorageSpace() {
    logger.info('💾 فحص مساحة التخزين...');

    this.addCheck('Local Storage Space', async () => {
      try {
        const output = await this.execCommand('df -h .');
        const lines = output.trim().split('\n');
        const dataLine = lines[1];
        const columns = dataLine.split(/\s+/);
        const available = columns[3];
        const usage = columns[4];
        
        const usagePercent = parseInt(usage.replace('%', ''));
        if (usagePercent > 90) {
          throw new Error(`مساحة التخزين المحلية منخفضة: ${usage} مستخدم`);
        }
        
        return `متاح: ${available} (${usage} مستخدم)`;
      } catch (error) {
        this.warnings.push('لا يمكن فحص مساحة التخزين المحلية');
        return 'غير معروف (تحذير)';
      }
    });

    this.addCheck('S3 Storage Quota', async () => {
      try {
        const s3 = new AWS.S3({
          region: this.config.storage.s3.region,
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        });

        // فحص حجم النسخ الحالية
        const objects = await s3.listObjectsV2({
          Bucket: this.config.storage.s3.bucket,
          Prefix: 'backups/'
        }).promise();

        const totalSize = objects.Contents.reduce((sum, obj) => sum + obj.Size, 0);
        return `النسخ الحالية: ${formatBytes(totalSize)}`;
      } catch (error) {
        this.warnings.push('لا يمكن فحص مساحة S3');
        return 'غير معروف (تحذير)';
      }
    });
  }

  /**
   * فحص إعدادات PM2
   */
  async checkPM2Configuration() {
    logger.info('⚙️ فحص إعدادات PM2...');

    this.addCheck('PM2 Installation', async () => {
      try {
        await this.execCommand('pm2 --version');
        return 'مثبت';
      } catch (error) {
        this.warnings.push('PM2 غير مثبت - تشغيل: npm install -g pm2');
        return 'غير مثبت (تحذير)';
      }
    });

    this.addCheck('PM2 Config File', () => {
      const configPath = path.join(__dirname, '../config/pm2-backup.config.json');
      if (!fs.existsSync(configPath)) {
        throw new Error('ملف إعدادات PM2 غير موجود');
      }
      
      try {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        if (!config.apps || config.apps.length === 0) {
          throw new Error('لا توجد تطبيقات محددة في ملف PM2');
        }
        return `${config.apps.length} تطبيقات محددة`;
      } catch (error) {
        throw new Error(`ملف PM2 غير صحيح: ${error.message}`);
      }
    });

    this.addCheck('PM2 Running Processes', async () => {
      try {
        const output = await this.execCommand('pm2 jlist');
        const processes = JSON.parse(output);
        const backupProcesses = processes.filter(p => 
          p.name && p.name.includes('backup')
        );
        
        if (backupProcesses.length === 0) {
          this.warnings.push('لا توجد عمليات نسخ احتياطي نشطة في PM2');
          return '0 عمليات نشطة (تحذير)';
        }
        
        return `${backupProcesses.length} عمليات نشطة`;
      } catch (error) {
        this.warnings.push('لا يمكن فحص عمليات PM2');
        return 'غير معروف (تحذير)';
      }
    });
  }

  /**
   * إضافة فحص جديد
   */
  addCheck(name, checkFunction) {
    this.summary.total++;
    
    const runCheck = async () => {
      try {
        let result;
        if (typeof checkFunction === 'function') {
          result = await checkFunction();
        }
        
        this.checks.push({
          name,
          status: 'pass',
          message: result || 'نجح',
          type: 'success'
        });
        
        this.summary.passed++;
        console.log(`✅ ${name}: ${result || 'نجح'}`);
        
      } catch (error) {
        this.checks.push({
          name,
          status: 'fail',
          message: error.message,
          type: 'error'
        });
        
        this.errors.push(`${name}: ${error.message}`);
        this.summary.failed++;
        console.log(`❌ ${name}: ${error.message}`);
      }
    };

    return runCheck();
  }

  /**
   * عرض التقرير النهائي
   */
  displayFinalReport() {
    console.log('\n' + '═'.repeat(80));
    console.log('📊 تقرير الفحص النهائي');
    console.log('═'.repeat(80));
    
    console.log(`📋 إجمالي الفحوصات: ${this.summary.total}`);
    console.log(`✅ النجحة: ${this.summary.passed}`);
    console.log(`❌ الفاشلة: ${this.summary.failed}`);
    console.log(`⚠️ التحذيرات: ${this.warnings.length}`);
    
    const successRate = ((this.summary.passed / this.summary.total) * 100).toFixed(1);
    console.log(`📈 معدل النجاح: ${successRate}%`);
    
    if (this.errors.length > 0) {
      console.log('\n❌ الأخطاء التي تحتاج إصلاح:');
      this.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }
    
    if (this.warnings.length > 0) {
      console.log('\n⚠️ التحذيرات:');
      this.warnings.forEach((warning, index) => {
        console.log(`   ${index + 1}. ${warning}`);
      });
    }
    
    console.log('\n' + '═'.repeat(80));
    
    if (this.summary.failed === 0) {
      console.log('🎉 النظام جاهز للعمل! جميع الفحوصات نجحت.');
      
      if (this.warnings.length > 0) {
        console.log('💡 يُنصح بمراجعة التحذيرات لتحسين الأداء.');
      }
      
      console.log('\n🚀 يمكنك الآن تشغيل النسخ الاحتياطية:');
      console.log('   node backup-system/scripts/backup-orchestrator.js manual');
      console.log('   pm2 start backup-system/config/pm2-backup.config.json');
      
    } else {
      console.log('🔧 يرجى إصلاح الأخطاء قبل تشغيل النظام.');
      
      console.log('\n📋 خطوات الإصلاح المقترحة:');
      console.log('1. راجع متغيرات البيئة المفقودة');
      console.log('2. تأكد من تثبيت جميع التبعيات');
      console.log('3. تحقق من صلاحيات الوصول');
      console.log('4. اختبر الاتصالات يدوياً');
    }
    
    console.log('═'.repeat(80));
  }

  /**
   * تنفيذ أمر shell
   */
  execCommand(command) {
    return new Promise((resolve, reject) => {
      exec(command, { timeout: 30000 }, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`${error.message}: ${stderr}`));
        } else {
          resolve(stdout);
        }
      });
    });
  }
}

// تشغيل الفحص إذا تم استدعاء الملف مباشرة
if (require.main === module) {
  const diagnostics = new SystemDiagnostics();
  
  diagnostics.runFullDiagnostics()
    .then(() => {
      logger.info('🏁 انتهى الفحص الشامل للنظام');
      process.exit(diagnostics.summary.failed === 0 ? 0 : 1);
    })
    .catch((error) => {
      logger.error('❌ فشل الفحص الشامل:', error);
      process.exit(1);
    });
}

module.exports = SystemDiagnostics;
