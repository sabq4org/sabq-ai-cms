// نقل البيانات باستخدام Prisma - أكثر أماناً للعلاقات المعقدة
const { PrismaClient } = require('@prisma/client');

// إنشاء clients منفصلين لكل قاعدة بيانات
const oldDb = new PrismaClient({
  datasources: {
    db: {
      url: process.env.OLD_DATABASE_URL
    }
  }
});

const newDb = new PrismaClient({
  datasources: {
    db: {
      url: process.env.NEW_DATABASE_URL || process.env.DATABASE_URL
    }
  }
});

// ألوان للـ console
const log = {
  info: (msg) => console.log(`\x1b[34m${msg}\x1b[0m`),
  success: (msg) => console.log(`\x1b[32m${msg}\x1b[0m`),
  error: (msg) => console.log(`\x1b[31m${msg}\x1b[0m`),
  warning: (msg) => console.log(`\x1b[33m${msg}\x1b[0m`)
};

// ترتيب الجداول حسب التبعيات
const migrationOrder = [
  // جداول مستقلة أولاً
  { name: 'roles', model: 'roles' },
  { name: 'users', model: 'users' },
  { name: 'categories', model: 'categories' },
  { name: 'tags', model: 'tags' },
  { name: 'team_members', model: 'team_members' },
  
  // جداول تعتمد على users
  { name: 'reporters', model: 'reporters' },
  { name: 'article_authors', model: 'article_authors' },
  
  // المحتوى الأساسي
  { name: 'articles', model: 'articles' },
  { name: 'opinion_articles', model: 'opinion_articles' },
  
  // العلاقات والتفاعلات
  { name: 'interactions', model: 'interactions' },
  { name: 'article_tags', model: 'article_tags' },
  { name: 'article_quotes', model: 'article_quotes' },
  { name: 'comments', model: 'comments' },
  
  // البيانات الإضافية
  { name: 'user_preferences', model: 'user_preferences' },
  { name: 'user_interests', model: 'user_interests' },
  { name: 'messages', model: 'messages' },
  
  // التحليلات والإحصائيات
  { name: 'analytics_data', model: 'analytics_data' },
  { name: 'activity_logs', model: 'activity_logs' }
];

async function migrateTable(tableInfo) {
  const { name, model } = tableInfo;
  
  try {
    log.info(`\n📋 نقل جدول ${name}...`);
    
    // عد السجلات في القاعدة القديمة
    const oldCount = await oldDb[model].count();
    log.info(`   عدد السجلات: ${oldCount}`);
    
    if (oldCount === 0) {
      log.warning(`   تخطي - الجدول فارغ`);
      return { table: name, status: 'skipped', count: 0 };
    }
    
    // جلب البيانات على دفعات
    const batchSize = 100;
    let transferred = 0;
    
    for (let skip = 0; skip < oldCount; skip += batchSize) {
      const batch = await oldDb[model].findMany({
        skip,
        take: batchSize
      });
      
      // إدراج الدفعة
      for (const record of batch) {
        try {
          await newDb[model].create({ data: record });
          transferred++;
        } catch (err) {
          // محاولة التحديث إذا كان السجل موجوداً
          if (err.code === 'P2002') {
            try {
              await newDb[model].update({
                where: { id: record.id },
                data: record
              });
              transferred++;
            } catch (updateErr) {
              log.error(`   ❌ فشل نقل سجل ${record.id}: ${updateErr.message}`);
            }
          } else {
            log.error(`   ❌ خطأ: ${err.message}`);
          }
        }
      }
      
      // عرض التقدم
      if (transferred % 500 === 0) {
        log.info(`   ... تم نقل ${transferred}/${oldCount}`);
      }
    }
    
    log.success(`   ✅ تم نقل ${transferred} سجل`);
    
    // التحقق من العدد النهائي
    const newCount = await newDb[model].count();
    if (newCount !== oldCount) {
      log.warning(`   ⚠️  تحذير: العدد لا يتطابق (قديم: ${oldCount}, جديد: ${newCount})`);
    }
    
    return { table: name, status: 'success', count: transferred, oldCount, newCount };
    
  } catch (error) {
    log.error(`   ❌ فشل نقل الجدول: ${error.message}`);
    return { table: name, status: 'error', error: error.message };
  }
}

async function updateSequences() {
  log.info('\n🔢 تحديث sequences...');
  
  try {
    // جلب جميع sequences
    const sequences = await newDb.$queryRaw`
      SELECT 
        schemaname,
        sequencename,
        last_value
      FROM pg_sequences
      WHERE schemaname = 'public'
    `;
    
    for (const seq of sequences) {
      // تحديث كل sequence للقيمة الصحيحة
      const tableName = seq.sequencename.replace('_id_seq', '');
      
      try {
        await newDb.$executeRaw`
          SELECT setval(
            ${seq.sequencename}::regclass,
            COALESCE((SELECT MAX(id) FROM ${tableName}), 1)
          )
        `;
      } catch (err) {
        // تجاهل الأخطاء للجداول بدون id
      }
    }
    
    log.success('   ✅ تم تحديث sequences');
  } catch (error) {
    log.warning('   ⚠️  فشل تحديث بعض sequences');
  }
}

async function migrate() {
  console.log('🚀 نقل البيانات باستخدام Prisma');
  console.log('=================================\n');
  
  // التحقق من المتغيرات
  if (!process.env.OLD_DATABASE_URL) {
    log.error('❌ خطأ: OLD_DATABASE_URL غير موجود');
    process.exit(1);
  }
  
  if (!process.env.NEW_DATABASE_URL && !process.env.DATABASE_URL) {
    log.error('❌ خطأ: NEW_DATABASE_URL أو DATABASE_URL غير موجود');
    process.exit(1);
  }
  
  const results = [];
  const startTime = Date.now();
  
  try {
    // اختبار الاتصال
    log.info('🔌 اختبار الاتصال...');
    await oldDb.$connect();
    await newDb.$connect();
    log.success('✅ تم الاتصال بقواعد البيانات\n');
    
    // نقل الجداول بالترتيب
    for (const table of migrationOrder) {
      const result = await migrateTable(table);
      results.push(result);
    }
    
    // تحديث sequences
    await updateSequences();
    
    // عرض الملخص
    console.log('\n📊 ملخص النقل:');
    console.log('================');
    
    let totalSuccess = 0;
    let totalRecords = 0;
    
    results.forEach(result => {
      const status = result.status === 'success' ? '✅' : 
                    result.status === 'skipped' ? '⏭️' : '❌';
      console.log(`${status} ${result.table}: ${result.count || 0} سجل`);
      
      if (result.status === 'success') {
        totalSuccess++;
        totalRecords += result.count;
      }
    });
    
    const duration = Math.round((Date.now() - startTime) / 1000);
    
    console.log('\n📈 الإحصائيات النهائية:');
    console.log(`   - الجداول المنقولة: ${totalSuccess}/${migrationOrder.length}`);
    console.log(`   - إجمالي السجلات: ${totalRecords}`);
    console.log(`   - الوقت المستغرق: ${duration} ثانية`);
    
    if (totalSuccess === migrationOrder.length) {
      log.success('\n🎉 تم نقل جميع البيانات بنجاح!');
    } else {
      log.warning('\n⚠️  تم النقل مع بعض التحذيرات');
    }
    
  } catch (error) {
    log.error(`\n❌ خطأ عام: ${error.message}`);
    console.error(error);
  } finally {
    await oldDb.$disconnect();
    await newDb.$disconnect();
  }
}

// بدء النقل
migrate().catch(console.error);
