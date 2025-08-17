const { Client } = require('pg');

// ================================================================================
// سكريبت مقارنة أداء قواعد البيانات
// يقيس سرعة العمليات الأساسية بين Supabase و DigitalOcean
// ================================================================================

// إعدادات قواعد البيانات
const DATABASES = {
  supabase: {
    name: 'Supabase',
    config: {
      host: process.env.SUPABASE_HOST || 'db.xxxxx.supabase.co',
      port: 5432,
      database: 'postgres',
      user: 'postgres',
      password: process.env.SUPABASE_PASSWORD || '',
      ssl: { rejectUnauthorized: false }
    }
  },
  'DigitalOcean': {
    url: process.env.DO_DATABASE_URL || 'postgresql://doadmin:YOUR_PASSWORD@db-sabq-ai-1755-do-user-23559731-0.m.db.ondigitalocean.com:25060/sabq_app_pool?sslmode=require',
    color: colors.cyan
  }
};

// الألوان للطباعة
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// دالة لقياس الوقت
async function measureTime(fn) {
  const start = process.hrtime.bigint();
  const result = await fn();
  const end = process.hrtime.bigint();
  const duration = Number(end - start) / 1e6; // تحويل إلى milliseconds
  return { result, duration };
}

// اختبارات الأداء
const performanceTests = {
  // 1. اختبار سرعة الاتصال
  async connectionTest(client) {
    const newClient = new Client(client.connectionParameters);
    const { duration } = await measureTime(async () => {
      await newClient.connect();
      await newClient.end();
    });
    return duration;
  },

  // 2. اختبار جلب قائمة المقالات
  async fetchArticlesList(client) {
    const { duration } = await measureTime(async () => {
      const result = await client.query(`
        SELECT id, title, slug, published_at, view_count 
        FROM articles 
        WHERE status = 'published' 
        ORDER BY published_at DESC 
        LIMIT 50
      `);
      return result.rows;
    });
    return duration;
  },

  // 3. اختبار جلب مقال مع التفاعلات
  async fetchArticleWithInteractions(client) {
    const { duration } = await measureTime(async () => {
      // أولاً نحصل على ID أول مقال
      const articles = await client.query('SELECT id FROM articles LIMIT 1');
      if (articles.rows.length === 0) return null;
      
      const articleId = articles.rows[0].id;
      
      // جلب المقال مع التفاعلات
      const result = await client.query(`
        SELECT 
          a.*,
          (SELECT COUNT(*) FROM interactions WHERE article_id = a.id AND type = 'like') as likes,
          (SELECT COUNT(*) FROM interactions WHERE article_id = a.id AND type = 'save') as saves,
          (SELECT COUNT(*) FROM comments WHERE article_id = a.id) as comments_count
        FROM articles a
        WHERE a.id = $1
      `, [articleId]);
      
      return result.rows[0];
    });
    return duration;
  },

  // 4. اختبار إدراج تفاعل
  async insertInteraction(client) {
    const { duration } = await measureTime(async () => {
      // استخدام معاملة لضمان عدم تلويث البيانات
      await client.query('BEGIN');
      try {
        const result = await client.query(`
          INSERT INTO interactions (id, user_id, article_id, type, created_at)
          VALUES (gen_random_uuid(), 'test-user', 'test-article', 'like', NOW())
          RETURNING id
        `);
        await client.query('ROLLBACK'); // تراجع عن التغيير
        return result.rows[0];
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    });
    return duration;
  },

  // 5. اختبار استعلام معقد (تحليلات)
  async complexAnalyticsQuery(client) {
    const { duration } = await measureTime(async () => {
      const result = await client.query(`
        SELECT 
          c.name as category,
          COUNT(DISTINCT a.id) as article_count,
          SUM(a.view_count) as total_views,
          AVG(a.view_count) as avg_views
        FROM categories c
        LEFT JOIN articles a ON a.category_id = c.id
        WHERE a.status = 'published'
        GROUP BY c.id, c.name
        ORDER BY total_views DESC
        LIMIT 10
      `);
      return result.rows;
    });
    return duration;
  },

  // 6. اختبار البحث النصي
  async textSearchQuery(client) {
    const { duration } = await measureTime(async () => {
      const result = await client.query(`
        SELECT id, title, slug 
        FROM articles 
        WHERE title ILIKE '%تقنية%' OR content ILIKE '%تقنية%'
        LIMIT 20
      `);
      return result.rows;
    });
    return duration;
  }
};

// تشغيل الاختبارات
async function runPerformanceTests() {
  console.log(`${colors.cyan}===========================================`);
  console.log(`مقارنة أداء قواعد البيانات`);
  console.log(`${new Date().toLocaleString('ar-SA')}`);
  console.log(`===========================================${colors.reset}\n`);

  const results = {};

  for (const [key, db] of Object.entries(DATABASES)) {
    console.log(`${colors.blue}▶ اختبار ${db.name}...${colors.reset}`);
    
    const client = new Client(db.config);
    results[key] = {};
    
    try {
      await client.connect();
      console.log(`${colors.green}✓ متصل بـ ${db.name}${colors.reset}`);
      
      // تشغيل كل اختبار 3 مرات وأخذ المتوسط
      for (const [testName, testFn] of Object.entries(performanceTests)) {
        const runs = [];
        console.log(`  - ${testName}...`);
        
        for (let i = 0; i < 3; i++) {
          try {
            const duration = await testFn(client);
            runs.push(duration);
          } catch (error) {
            console.log(`${colors.red}    خطأ: ${error.message}${colors.reset}`);
            runs.push(null);
          }
        }
        
        const validRuns = runs.filter(r => r !== null);
        const avgDuration = validRuns.length > 0 
          ? validRuns.reduce((a, b) => a + b, 0) / validRuns.length 
          : null;
        
        results[key][testName] = {
          runs,
          average: avgDuration,
          success: validRuns.length > 0
        };
      }
      
      await client.end();
      console.log(`${colors.green}✓ تم إنهاء الاتصال${colors.reset}\n`);
      
    } catch (error) {
      console.error(`${colors.red}✗ خطأ في الاتصال بـ ${db.name}: ${error.message}${colors.reset}\n`);
      results[key].error = error.message;
    }
  }

  // عرض النتائج
  displayResults(results);
}

// عرض النتائج بشكل جدول
function displayResults(results) {
  console.log(`${colors.cyan}===========================================`);
  console.log(`📊 نتائج المقارنة`);
  console.log(`===========================================${colors.reset}\n`);

  const tests = Object.keys(performanceTests);
  
  // جدول المقارنة
  console.log('┌─────────────────────────────┬──────────────────┬──────────────────┬─────────────┐');
  console.log('│ الاختبار                    │ Supabase (ms)    │ DigitalOcean (ms)│ الفرق       │');
  console.log('├─────────────────────────────┼──────────────────┼──────────────────┼─────────────┤');
  
  tests.forEach(testName => {
    const supabaseResult = results.supabase?.[testName];
    const doResult = results.digitalocean?.[testName];
    
    if (supabaseResult?.success && doResult?.success) {
      const supabaseAvg = supabaseResult.average;
      const doAvg = doResult.average;
      const improvement = ((supabaseAvg - doAvg) / supabaseAvg * 100).toFixed(1);
      const improvementColor = improvement > 0 ? colors.green : colors.red;
      
      console.log(
        `│ ${testName.padEnd(27)} │ ${supabaseAvg.toFixed(2).padStart(16)} │ ${doAvg.toFixed(2).padStart(16)} │ ${improvementColor}${improvement}%${colors.reset}`.padEnd(25) + '│'
      );
    } else {
      console.log(
        `│ ${testName.padEnd(27)} │ ${supabaseResult?.success ? supabaseResult.average.toFixed(2).padStart(16) : 'فشل'.padStart(16)} │ ${doResult?.success ? doResult.average.toFixed(2).padStart(16) : 'فشل'.padStart(16)} │ -           │`
      );
    }
  });
  
  console.log('└─────────────────────────────┴──────────────────┴──────────────────┴─────────────┘');
  
  // ملخص
  console.log(`\n${colors.yellow}📌 الملخص:${colors.reset}`);
  
  const successfulTests = tests.filter(t => 
    results.supabase?.[t]?.success && results.digitalocean?.[t]?.success
  );
  
  if (successfulTests.length > 0) {
    const avgImprovement = successfulTests.reduce((sum, testName) => {
      const supabaseAvg = results.supabase[testName].average;
      const doAvg = results.digitalocean[testName].average;
      return sum + ((supabaseAvg - doAvg) / supabaseAvg * 100);
    }, 0) / successfulTests.length;
    
    console.log(`• متوسط التحسن في الأداء: ${colors.green}${avgImprovement.toFixed(1)}%${colors.reset}`);
    
    // أسرع وأبطأ اختبار
    let maxImprovement = -Infinity;
    let minImprovement = Infinity;
    let fastestTest = '';
    let slowestTest = '';
    
    successfulTests.forEach(testName => {
      const supabaseAvg = results.supabase[testName].average;
      const doAvg = results.digitalocean[testName].average;
      const improvement = ((supabaseAvg - doAvg) / supabaseAvg * 100);
      
      if (improvement > maxImprovement) {
        maxImprovement = improvement;
        fastestTest = testName;
      }
      if (improvement < minImprovement) {
        minImprovement = improvement;
        slowestTest = testName;
      }
    });
    
    console.log(`• أكبر تحسن: ${fastestTest} (${colors.green}${maxImprovement.toFixed(1)}%${colors.reset})`);
    console.log(`• أقل تحسن: ${slowestTest} (${minImprovement > 0 ? colors.green : colors.red}${minImprovement.toFixed(1)}%${colors.reset})`);
  }
  
  console.log(`\n${colors.cyan}===========================================${colors.reset}`);
}

// تشغيل الاختبارات
if (require.main === module) {
  runPerformanceTests().catch(console.error);
} 