#!/usr/bin/env node

/**
 * التحكم الرئيسي في نظام النسخ الاحتياطية
 * Main Backup System Controller
 * 
 * نقطة دخول موحدة لجميع عمليات النظام
 */

const path = require('path');
const { logger } = require('./scripts/utils');

class BackupSystemController {
  constructor() {
    this.commands = {
      // عمليات النسخ الاحتياطي
      'backup': {
        description: 'إنشاء نسخة احتياطية',
        handler: this.handleBackup.bind(this),
        options: [
          { name: '--type', description: 'نوع النسخة (full, database, codebase, assets)', default: 'full' },
          { name: '--schedule', description: 'تشغيل مجدول (daily, weekly, monthly)' },
          { name: '--components', description: 'مكونات محددة (مفصولة بفواصل)' }
        ]
      },
      
      // عمليات الاسترجاع
      'restore': {
        description: 'استرجاع نسخة احتياطية',
        handler: this.handleRestore.bind(this),
        options: [
          { name: '--interactive', description: 'وضع تفاعلي (افتراضي)', default: true },
          { name: '--backup', description: 'ملف النسخة الاحتياطية المحدد' },
          { name: '--type', description: 'نوع الاسترجاع (full, database, codebase, assets)' }
        ]
      },
      
      // الفحص والتشخيص
      'diagnose': {
        description: 'فحص شامل للنظام',
        handler: this.handleDiagnose.bind(this),
        options: [
          { name: '--quick', description: 'فحص سريع' },
          { name: '--full', description: 'فحص شامل (افتراضي)', default: true }
        ]
      },
      
      // إدارة النظام
      'setup': {
        description: 'إعداد النظام للمرة الأولى',
        handler: this.handleSetup.bind(this),
        options: [
          { name: '--force', description: 'إعادة الإعداد بالقوة' }
        ]
      },
      
      'status': {
        description: 'عرض حالة النظام',
        handler: this.handleStatus.bind(this),
        options: []
      },
      
      'cleanup': {
        description: 'تنظيف النسخ القديمة',
        handler: this.handleCleanup.bind(this),
        options: [
          { name: '--older-than', description: 'حذف النسخ الأقدم من (أيام)', default: '30' },
          { name: '--dry-run', description: 'عرض فقط دون حذف' }
        ]
      },
      
      // إدارة الجدولة
      'schedule': {
        description: 'إدارة الجدولة التلقائية',
        handler: this.handleSchedule.bind(this),
        options: [
          { name: '--start', description: 'تشغيل الجدولة' },
          { name: '--stop', description: 'إيقاف الجدولة' },
          { name: '--restart', description: 'إعادة تشغيل الجدولة' },
          { name: '--status', description: 'عرض حالة الجدولة' }
        ]
      },
      
      // المساعدة
      'help': {
        description: 'عرض هذه المساعدة',
        handler: this.handleHelp.bind(this),
        options: [
          { name: '[command]', description: 'عرض مساعدة أمر محدد' }
        ]
      }
    };
  }

  /**
   * تشغيل النظام
   */
  async run(args = process.argv.slice(2)) {
    try {
      // عرض الترحيب
      this.displayWelcome();
      
      // تحليل الأوامر
      const { command, options } = this.parseArgs(args);
      
      // تنفيذ الأمر
      if (this.commands[command]) {
        await this.commands[command].handler(options);
      } else {
        throw new Error(`أمر غير معروف: ${command}. استخدم 'help' لعرض الأوامر المتاحة.`);
      }
      
    } catch (error) {
      logger.error('❌ خطأ في تنفيذ الأمر:', error.message);
      process.exit(1);
    }
  }

  /**
   * عرض الترحيب
   */
  displayWelcome() {
    const version = require('../package.json')?.version || '1.0.0';
    
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║               🛡️ نظام النسخ الاحتياطية الشامل                ║
║                     Comprehensive Backup System             ║
║                                                              ║
║  نسخة ${version}                                          ║
║  صبق AI CMS - نظام إدارة المحتوى الذكي                    ║
╚══════════════════════════════════════════════════════════════╝
    `);
  }

  /**
   * تحليل الأوامر والخيارات
   */
  parseArgs(args) {
    if (args.length === 0) {
      return { command: 'help', options: {} };
    }
    
    const command = args[0];
    const options = {};
    
    for (let i = 1; i < args.length; i++) {
      const arg = args[i];
      
      if (arg.startsWith('--')) {
        const [key, value] = arg.split('=');
        const optionName = key.substring(2);
        
        if (value !== undefined) {
          options[optionName] = value;
        } else if (i + 1 < args.length && !args[i + 1].startsWith('--')) {
          options[optionName] = args[i + 1];
          i++;
        } else {
          options[optionName] = true;
        }
      } else if (!options.args) {
        options.args = [];
        options.args.push(arg);
      } else {
        options.args.push(arg);
      }
    }
    
    return { command, options };
  }

  /**
   * معالج النسخ الاحتياطي
   */
  async handleBackup(options) {
    logger.info('🔄 بدء عملية النسخ الاحتياطي...');
    
    const BackupOrchestrator = require('./scripts/backup-orchestrator');
    const orchestrator = new BackupOrchestrator();
    
    const backupType = options.type || 'full';
    const isScheduled = !!options.schedule;
    
    if (isScheduled) {
      logger.info(`📅 تشغيل النسخ المجدول: ${options.schedule}`);
      await orchestrator.executeScheduledBackup(options.schedule);
    } else if (options.components) {
      const components = options.components.split(',').map(c => c.trim());
      logger.info(`📦 نسخ احتياطي للمكونات: ${components.join(', ')}`);
      await orchestrator.executePartialBackup(components);
    } else {
      logger.info(`📋 نسخ احتياطي: ${backupType}`);
      await orchestrator.executeBackup(backupType);
    }
    
    logger.info('✅ انتهت عملية النسخ الاحتياطي بنجاح');
  }

  /**
   * معالج الاسترجاع
   */
  async handleRestore(options) {
    logger.info('🔄 بدء عملية الاسترجاع...');
    
    const BackupRestorer = require('./scripts/restore-backup');
    const restorer = new BackupRestorer();
    
    if (options.interactive !== false) {
      // وضع تفاعلي
      await restorer.executeInteractiveRestore();
    } else {
      // وضع مباشر (للاستخدام المتقدم)
      if (!options.backup) {
        throw new Error('يجب تحديد ملف النسخة الاحتياطية في الوضع غير التفاعلي');
      }
      
      // تنفيذ استرجاع مباشر (يحتاج تطوير إضافي)
      logger.warn('⚠️ الوضع غير التفاعلي قيد التطوير، سيتم استخدام الوضع التفاعلي');
      await restorer.executeInteractiveRestore();
    }
    
    logger.info('✅ انتهت عملية الاسترجاع بنجاح');
  }

  /**
   * معالج التشخيص
   */
  async handleDiagnose(options) {
    logger.info('🔍 بدء فحص النظام...');
    
    const SystemDiagnostics = require('./scripts/system-diagnostics');
    const diagnostics = new SystemDiagnostics();
    
    if (options.quick) {
      logger.info('⚡ فحص سريع...');
      // يمكن إضافة فحص سريع مخصص
      await diagnostics.runQuickCheck();
    } else {
      logger.info('🔍 فحص شامل...');
      await diagnostics.runFullDiagnostics();
    }
    
    logger.info('✅ انتهى فحص النظام');
  }

  /**
   * معالج الإعداد
   */
  async handleSetup(options) {
    logger.info('⚙️ بدء إعداد النظام...');
    
    console.log(`
🔧 مرحباً بك في معالج إعداد نظام النسخ الاحتياطية!

سيقوم هذا المعالج بمساعدتك في:
✅ التحقق من متطلبات النظام
✅ إعداد متغيرات البيئة
✅ اختبار الاتصالات
✅ إنشاء الملفات والمجلدات المطلوبة
✅ تكوين الجدولة التلقائية

هل تريد المتابعة؟ (y/n):
    `);
    
    // يمكن إضافة معالج إعداد تفاعلي هنا
    logger.info('🏗️ معالج الإعداد قيد التطوير...');
    logger.info('💡 يرجى مراجعة ملف README.md للإعداد اليدوي');
  }

  /**
   * معالج الحالة
   */
  async handleStatus(options) {
    logger.info('📊 عرض حالة النظام...');
    
    console.log('\n📋 حالة نظام النسخ الاحتياطية:');
    console.log('─'.repeat(60));
    
    try {
      // فحص سريع للمكونات الأساسية
      const fs = require('fs');
      const { exec } = require('child_process');
      
      // حالة الملفات
      const configExists = fs.existsSync('./backup-system/config/backup-config.js');
      console.log(`📄 ملف الإعدادات: ${configExists ? '✅ موجود' : '❌ مفقود'}`);
      
      const scriptsExist = fs.existsSync('./backup-system/scripts/backup-orchestrator.js');
      console.log(`📜 السكربتات: ${scriptsExist ? '✅ موجودة' : '❌ مفقودة'}`);
      
      // حالة متغيرات البيئة
      const envVars = ['DATABASE_URL', 'AWS_ACCESS_KEY_ID', 'GITHUB_TOKEN'];
      const missingEnvs = envVars.filter(env => !process.env[env]);
      console.log(`🔧 متغيرات البيئة: ${missingEnvs.length === 0 ? '✅ مكتملة' : `❌ مفقود ${missingEnvs.length}`}`);
      
      // حالة PM2
      exec('pm2 jlist', (error, stdout) => {
        if (!error) {
          try {
            const processes = JSON.parse(stdout);
            const backupProcesses = processes.filter(p => p.name && p.name.includes('backup'));
            console.log(`⚙️ عمليات PM2: ${backupProcesses.length} عملية نشطة`);
          } catch (e) {
            console.log('⚙️ عمليات PM2: ❌ خطأ في القراءة');
          }
        } else {
          console.log('⚙️ عمليات PM2: ❌ PM2 غير متاح');
        }
        
        console.log('─'.repeat(60));
        console.log('💡 استخدم "diagnose" لفحص شامل أو "help" للمساعدة');
      });
      
    } catch (error) {
      logger.error('❌ خطأ في عرض الحالة:', error.message);
    }
  }

  /**
   * معالج التنظيف
   */
  async handleCleanup(options) {
    logger.info('🧹 بدء تنظيف النسخ القديمة...');
    
    const olderThan = parseInt(options['older-than']) || 30;
    const dryRun = options['dry-run'];
    
    if (dryRun) {
      logger.info(`🔍 عرض النسخ الأقدم من ${olderThan} يوم (بدون حذف):`);
    } else {
      logger.info(`🗑️ حذف النسخ الأقدم من ${olderThan} يوم:`);
    }
    
    // استدعاء منطق التنظيف من المنسق
    const BackupOrchestrator = require('./scripts/backup-orchestrator');
    const orchestrator = new BackupOrchestrator();
    await orchestrator.cleanupOldBackups(olderThan, dryRun);
    
    logger.info('✅ انتهى التنظيف');
  }

  /**
   * معالج الجدولة
   */
  async handleSchedule(options) {
    const { exec } = require('child_process');
    const util = require('util');
    const execAsync = util.promisify(exec);
    
    if (options.start) {
      logger.info('🚀 تشغيل الجدولة التلقائية...');
      try {
        await execAsync('pm2 start backup-system/config/pm2-backup.config.json');
        logger.info('✅ تم تشغيل الجدولة التلقائية');
      } catch (error) {
        logger.error('❌ فشل تشغيل الجدولة:', error.message);
      }
    } else if (options.stop) {
      logger.info('⏸️ إيقاف الجدولة التلقائية...');
      try {
        await execAsync('pm2 stop all');
        logger.info('✅ تم إيقاف الجدولة التلقائية');
      } catch (error) {
        logger.error('❌ فشل إيقاف الجدولة:', error.message);
      }
    } else if (options.restart) {
      logger.info('🔄 إعادة تشغيل الجدولة التلقائية...');
      try {
        await execAsync('pm2 restart all');
        logger.info('✅ تم إعادة تشغيل الجدولة التلقائية');
      } catch (error) {
        logger.error('❌ فشل إعادة تشغيل الجدولة:', error.message);
      }
    } else if (options.status) {
      logger.info('📊 عرض حالة الجدولة...');
      try {
        const { stdout } = await execAsync('pm2 status');
        console.log(stdout);
      } catch (error) {
        logger.error('❌ فشل عرض حالة الجدولة:', error.message);
      }
    } else {
      console.log(`
🕐 إدارة الجدولة التلقائية:

الأوامر المتاحة:
  --start     تشغيل الجدولة
  --stop      إيقاف الجدولة  
  --restart   إعادة تشغيل الجدولة
  --status    عرض حالة الجدولة

مثال:
  node backup-controller.js schedule --start
      `);
    }
  }

  /**
   * معالج المساعدة
   */
  async handleHelp(options) {
    const commandName = options.args?.[0];
    
    if (commandName && this.commands[commandName]) {
      this.displayCommandHelp(commandName);
    } else {
      this.displayGeneralHelp();
    }
  }

  /**
   * عرض مساعدة عامة
   */
  displayGeneralHelp() {
    console.log(`
📚 نظام النسخ الاحتياطية الشامل - دليل الاستخدام

🎯 الاستخدام العام:
  node backup-controller.js <command> [options]

📋 الأوامر المتاحة:
`);

    Object.entries(this.commands).forEach(([name, info]) => {
      console.log(`  ${name.padEnd(12)} ${info.description}`);
    });

    console.log(`
🔧 أمثلة الاستخدام:
  node backup-controller.js backup --type=full
  node backup-controller.js backup --type=database
  node backup-controller.js restore --interactive
  node backup-controller.js diagnose --full
  node backup-controller.js status
  node backup-controller.js cleanup --older-than=30
  node backup-controller.js schedule --start

💡 للحصول على مساعدة مفصلة لأمر محدد:
  node backup-controller.js help <command>

📖 للمزيد من المعلومات، راجع:
  backup-system/README.md
    `);
  }

  /**
   * عرض مساعدة أمر محدد
   */
  displayCommandHelp(commandName) {
    const command = this.commands[commandName];
    
    console.log(`
📖 مساعدة الأمر: ${commandName}

📝 الوصف:
  ${command.description}

🔧 الاستخدام:
  node backup-controller.js ${commandName} [options]
`);

    if (command.options.length > 0) {
      console.log('⚙️ الخيارات المتاحة:');
      command.options.forEach(option => {
        const defaultText = option.default ? ` (افتراضي: ${option.default})` : '';
        console.log(`  ${option.name.padEnd(20)} ${option.description}${defaultText}`);
      });
    }

    console.log('\n💡 أمثلة:');
    this.displayCommandExamples(commandName);
  }

  /**
   * عرض أمثلة للأوامر
   */
  displayCommandExamples(commandName) {
    const examples = {
      backup: [
        'node backup-controller.js backup --type=full',
        'node backup-controller.js backup --type=database',
        'node backup-controller.js backup --components=database,codebase',
        'node backup-controller.js backup --schedule=daily'
      ],
      restore: [
        'node backup-controller.js restore',
        'node backup-controller.js restore --interactive',
        'node backup-controller.js restore --backup=backup-20250814.tar.gz'
      ],
      diagnose: [
        'node backup-controller.js diagnose',
        'node backup-controller.js diagnose --quick',
        'node backup-controller.js diagnose --full'
      ],
      cleanup: [
        'node backup-controller.js cleanup',
        'node backup-controller.js cleanup --older-than=7',
        'node backup-controller.js cleanup --dry-run'
      ],
      schedule: [
        'node backup-controller.js schedule --start',
        'node backup-controller.js schedule --status',
        'node backup-controller.js schedule --restart'
      ]
    };

    const commandExamples = examples[commandName] || [`node backup-controller.js ${commandName}`];
    
    commandExamples.forEach(example => {
      console.log(`  ${example}`);
    });
  }
}

// تشغيل النظام إذا تم استدعاء الملف مباشرة
if (require.main === module) {
  const controller = new BackupSystemController();
  controller.run().catch(error => {
    logger.error('❌ خطأ في تشغيل النظام:', error);
    process.exit(1);
  });
}

module.exports = BackupSystemController;
