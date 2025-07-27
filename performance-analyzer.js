const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

class PerformanceAnalyzer {
  constructor() {
    this.prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
    });
    this.metrics = {
      queries: [],
      connections: [],
      errors: [],
      performance: {
        dailyStats: {},
        weeklyTrends: {},
        bottlenecks: []
      }
    };
  }

  async runComprehensiveAnalysis() {
    console.log('🔬 بدء التحليل الشامل للأداء...');
    console.log('=' .repeat(70));

    await this.analyzeConnectionPerformance();
    await this.analyzeQueryPatterns();
    await this.analyzeResourceUsage();
    await this.identifyBottlenecks();
    await this.generateRecommendations();
    
    console.log('\n' + '=' .repeat(70));
    console.log('✅ انتهاء التحليل الشامل');
  }

  async analyzeConnectionPerformance() {
    console.log('\n🔗 1. تحليل أداء الاتصالات:');
    
    try {
      // اختبار سرعة الاتصال
      const connectionTests = [];
      for (let i = 0; i < 5; i++) {
        const start = Date.now();
        await this.prisma.$connect();
        const time = Date.now() - start;
        connectionTests.push(time);
        console.log(`  اختبار ${i + 1}: ${time}ms`);
        await this.prisma.$disconnect();
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      const avgConnection = connectionTests.reduce((a, b) => a + b) / connectionTests.length;
      console.log(`📊 متوسط وقت الاتصال: ${Math.round(avgConnection)}ms`);

      // تحليل Pool الحالي
      await this.prisma.$connect();
      const poolStats = await this.prisma.$queryRaw`
        SELECT 
          count(*) as total_connections,
          count(*) FILTER (WHERE state = 'active') as active_connections,
          count(*) FILTER (WHERE state = 'idle') as idle_connections,
          count(*) FILTER (WHERE state = 'idle in transaction') as idle_in_transaction,
          max(state_change) as last_state_change
        FROM pg_stat_activity 
        WHERE datname = current_database()
      `;
      
      console.log('📈 إحصائيات Pool الحالية:');
      console.log(`  - إجمالي الاتصالات: ${poolStats[0].total_connections}`);
      console.log(`  - الاتصالات النشطة: ${poolStats[0].active_connections}`);
      console.log(`  - الاتصالات الخاملة: ${poolStats[0].idle_connections}`);
      console.log(`  - في المعاملات: ${poolStats[0].idle_in_transaction}`);

      // تحليل أداء الشبكة
      const networkTest = await this.testNetworkLatency();
      console.log(`🌐 زمن استجابة الشبكة: ${networkTest}ms`);

    } catch (error) {
      console.log('❌ خطأ في تحليل الاتصالات:', error.message);
    }
  }

  async analyzeQueryPatterns() {
    console.log('\n📊 2. تحليل أنماط الاستعلامات:');
    
    try {
      // اختبار أنواع مختلفة من الاستعلامات
      const queryTests = [
        {
          name: 'Count البسيط',
          query: () => this.prisma.articles.count()
        },
        {
          name: 'Select محدود',
          query: () => this.prisma.articles.findMany({ take: 10 })
        },
        {
          name: 'Join معقد',
          query: () => this.prisma.articles.findMany({
            take: 5,
            include: {
              category: true,
              author: true
            }
          })
        },
        {
          name: 'Aggregation',
          query: () => this.prisma.articles.aggregate({
            _count: { id: true },
            _avg: { views: true }
          })
        }
      ];

      for (const test of queryTests) {
        const times = [];
        console.log(`\n  🔍 اختبار: ${test.name}`);
        
        for (let i = 0; i < 3; i++) {
          const start = Date.now();
          try {
            await test.query();
            const time = Date.now() - start;
            times.push(time);
            console.log(`    ${i + 1}. ${time}ms`);
          } catch (error) {
            console.log(`    ${i + 1}. خطأ: ${error.message}`);
            times.push(0);
          }
        }
        
        const validTimes = times.filter(t => t > 0);
        if (validTimes.length > 0) {
          const avg = validTimes.reduce((a, b) => a + b) / validTimes.length;
          console.log(`    📊 المتوسط: ${Math.round(avg)}ms`);
        }
      }

    } catch (error) {
      console.log('❌ خطأ في تحليل الاستعلامات:', error.message);
    }
  }

  async analyzeResourceUsage() {
    console.log('\n💾 3. تحليل استخدام الموارد:');
    
    // ذاكرة العملية
    const memBefore = process.memoryUsage();
    console.log('📊 استخدام الذاكرة (قبل):');
    console.log(`  - RSS: ${Math.round(memBefore.rss / 1024 / 1024)} MB`);
    console.log(`  - Heap Used: ${Math.round(memBefore.heapUsed / 1024 / 1024)} MB`);
    console.log(`  - Heap Total: ${Math.round(memBefore.heapTotal / 1024 / 1024)} MB`);

    // تشغيل حمولة لاختبار الذاكرة
    console.log('\n⚡ تشغيل اختبار الحمولة...');
    const loadResults = [];
    
    for (let i = 0; i < 20; i++) {
      const start = Date.now();
      try {
        await this.prisma.articles.findMany({ take: 10 });
        const time = Date.now() - start;
        loadResults.push(time);
      } catch (error) {
        loadResults.push(-1);
      }
    }

    const memAfter = process.memoryUsage();
    console.log('\n📊 استخدام الذاكرة (بعد):');
    console.log(`  - RSS: ${Math.round(memAfter.rss / 1024 / 1024)} MB`);
    console.log(`  - Heap Used: ${Math.round(memAfter.heapUsed / 1024 / 1024)} MB`);
    console.log(`  - الفرق: ${Math.round((memAfter.heapUsed - memBefore.heapUsed) / 1024 / 1024)} MB`);

    // تحليل نتائج الحمولة
    const validResults = loadResults.filter(r => r > 0);
    if (validResults.length > 0) {
      const avgLoad = validResults.reduce((a, b) => a + b) / validResults.length;
      const maxLoad = Math.max(...validResults);
      const minLoad = Math.min(...validResults);
      
      console.log('\n📈 نتائج اختبار الحمولة:');
      console.log(`  - المتوسط: ${Math.round(avgLoad)}ms`);
      console.log(`  - الأقصى: ${maxLoad}ms`);
      console.log(`  - الأدنى: ${minLoad}ms`);
      console.log(`  - الاستعلامات الناجحة: ${validResults.length}/${loadResults.length}`);
    }
  }

  async identifyBottlenecks() {
    console.log('\n🔍 4. تحديد نقاط الاختناق:');
    
    try {
      // فحص الاستعلامات البطيئة في قاعدة البيانات
      const slowQueries = await this.prisma.$queryRaw`
        SELECT 
          query,
          calls,
          total_time,
          mean_time,
          max_time,
          rows
        FROM pg_stat_statements 
        WHERE mean_time > 100 
        ORDER BY mean_time DESC 
        LIMIT 5
      `;

      if (slowQueries.length > 0) {
        console.log('🐌 أبطأ الاستعلامات:');
        slowQueries.forEach((q, i) => {
          console.log(`  ${i + 1}. متوسط الوقت: ${Math.round(q.mean_time)}ms`);
          console.log(`     الاستدعاءات: ${q.calls}`);
          console.log(`     الاستعلام: ${q.query.substring(0, 60)}...`);
        });
      } else {
        console.log('✅ لا توجد استعلامات بطيئة مكتشفة');
      }

      // فحص الفهارس المفقودة
      const missingIndexes = await this.checkMissingIndexes();
      if (missingIndexes.length > 0) {
        console.log('\n⚠️ فهارس مقترحة:');
        missingIndexes.forEach((idx, i) => {
          console.log(`  ${i + 1}. ${idx}`);
        });
      }

    } catch (error) {
      console.log('❌ خطأ في تحليل نقاط الاختناق:', error.message);
      console.log('💡 تلميح: قد تحتاج لتفعيل pg_stat_statements extension');
    }
  }

  async generateRecommendations() {
    console.log('\n💡 5. التوصيات:');
    
    const recommendations = [];
    
    // تحليل بيانات الأداء
    const memUsage = process.memoryUsage();
    const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    
    if (heapUsedMB > 100) {
      recommendations.push('🔹 استخدام الذاكرة مرتفع - راجع Connection Pool size');
    }
    
    // فحص عدد الاتصالات
    try {
      const connStats = await this.prisma.$queryRaw`
        SELECT count(*) as total FROM pg_stat_activity 
        WHERE datname = current_database()
      `;
      
      if (connStats[0].total > 10) {
        recommendations.push('🔹 عدد الاتصالات مرتفع - فكر في Connection Pooling');
      }
    } catch (error) {
      // تجاهل الخطأ
    }
    
    recommendations.push('🔹 فعّل pg_stat_statements لمراقبة أفضل للاستعلامات');
    recommendations.push('🔹 راجع إعدادات Prisma Connection Pool');
    recommendations.push('🔹 فكر في استخدام Redis للكاش');
    recommendations.push('🔹 راقب الاستعلامات التي تستغرق أكثر من 1000ms');
    
    recommendations.forEach(rec => console.log(rec));
    
    // حفظ التقرير
    await this.saveReport();
  }

  async testNetworkLatency() {
    const start = Date.now();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return Date.now() - start;
    } catch (error) {
      return -1;
    }
  }

  async checkMissingIndexes() {
    // فحص بسيط للفهارس المقترحة
    const suggestions = [];
    
    try {
      // فحص foreign keys بدون فهارس
      const unindexedFks = await this.prisma.$queryRaw`
        SELECT 
          schemaname,
          tablename,
          attname,
          n_distinct,
          correlation
        FROM pg_stats
        WHERE schemaname = 'public' 
          AND n_distinct > 100
          AND correlation < 0.1
        LIMIT 3
      `;
      
      unindexedFks.forEach(fk => {
        suggestions.push(`CREATE INDEX idx_${fk.tablename}_${fk.attname} ON ${fk.tablename} (${fk.attname});`);
      });
      
    } catch (error) {
      // إضافة اقتراحات عامة
      suggestions.push('CREATE INDEX idx_articles_created_at ON articles (created_at);');
      suggestions.push('CREATE INDEX idx_articles_status ON articles (status);');
    }
    
    return suggestions;
  }

  async saveReport() {
    const report = {
      timestamp: new Date().toISOString(),
      analysis: {
        memory_usage: process.memoryUsage(),
        performance_metrics: this.metrics,
        recommendations: [
          'مراقبة الاستعلامات البطيئة',
          'تحسين Connection Pool',
          'إضافة فهارس مناسبة',
          'استخدام كاش للبيانات المتكررة'
        ]
      }
    };
    
    const filename = `performance-analysis-${new Date().toISOString().split('T')[0]}.json`;
    fs.writeFileSync(filename, JSON.stringify(report, null, 2));
    console.log(`\n💾 تم حفظ التقرير في: ${filename}`);
  }

  async cleanup() {
    await this.prisma.$disconnect();
  }
}

// تشغيل التحليل
async function main() {
  const analyzer = new PerformanceAnalyzer();
  
  try {
    await analyzer.runComprehensiveAnalysis();
  } catch (error) {
    console.error('❌ خطأ في التحليل:', error);
  } finally {
    await analyzer.cleanup();
  }
}

main().catch(console.error);
