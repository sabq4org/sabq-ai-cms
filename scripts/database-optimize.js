#!/usr/bin/env node

/**
 * أداة تطبيق تحسينات قاعدة البيانات
 * تنفيذ الفهارس المطلوبة لتحسين أداء الاستعلامات
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

class DatabaseOptimizer {
  constructor() {
    this.prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error']
    });
    this.results = [];
    this.startTime = Date.now();
  }

  // تطبيق الفهارس الأساسية
  async applyIndexes() {
    console.log('📊 تطبيق فهارس قاعدة البيانات...\n');

    const indexes = [
      {
        name: 'idx_articles_published_date',
        sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_articles_published_date 
              ON articles (published_at DESC) 
              WHERE published_at IS NOT NULL;`,
        description: 'فهرس المقالات المنشورة بترتيب التاريخ'
      },
      {
        name: 'idx_articles_category_published',
        sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_articles_category_published 
              ON articles (category_id, published_at DESC) 
              WHERE published_at IS NOT NULL;`,
        description: 'فهرس المقالات حسب التصنيف والتاريخ'
      },
      {
        name: 'idx_articles_author_published',
        sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_articles_author_published 
              ON articles (author_id, published_at DESC) 
              WHERE published_at IS NOT NULL;`,
        description: 'فهرس المقالات حسب الكاتب والتاريخ'
      },
      {
        name: 'idx_articles_slug',
        sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_articles_slug 
              ON articles (slug) 
              WHERE slug IS NOT NULL;`,
        description: 'فهرس روابط المقالات'
      },
      {
        name: 'idx_articles_featured',
        sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_articles_featured 
              ON articles (featured, published_at DESC) 
              WHERE featured = true AND published_at IS NOT NULL;`,
        description: 'فهرس المقالات المميزة'
      },
      {
        name: 'idx_articles_status',
        sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_articles_status 
              ON articles (status, published_at DESC) 
              WHERE status IN ('published', 'draft');`,
        description: 'فهرس حالة المقالات'
      },
      {
        name: 'idx_categories_slug',
        sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_categories_slug 
              ON categories (slug) 
              WHERE slug IS NOT NULL;`,
        description: 'فهرس روابط التصنيفات'
      },
      {
        name: 'idx_categories_active',
        sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_categories_active 
              ON categories (is_active) 
              WHERE is_active = true;`,
        description: 'فهرس التصنيفات النشطة'
      },
      {
        name: 'idx_users_email',
        sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email_unique 
              ON users (email) 
              WHERE email IS NOT NULL;`,
        description: 'فهرس بريد المستخدمين'
      },
      {
        name: 'idx_interactions_article_type',
        sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_interactions_article_type_v2 
              ON interactions (article_id, type, created_at DESC);`,
        description: 'فهرس التفاعلات حسب المقال والنوع والتاريخ'
      },
      {
        name: 'idx_interactions_user_article',
        sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_interactions_user_article 
              ON interactions (user_id, article_id, type) 
              WHERE user_id IS NOT NULL;`,
        description: 'فهرس تفاعلات المستخدم مع المقالات'
      }
    ];

    for (const index of indexes) {
      try {
        console.log(`🔧 إنشاء فهرس: ${index.description}...`);
        
        const startTime = Date.now();
        await this.prisma.$executeRawUnsafe(index.sql);
        const duration = Date.now() - startTime;
        
        console.log(`   ✅ تم إنشاء ${index.name} (${duration}ms)`);
        
        this.results.push({
          name: index.name,
          status: 'success',
          duration,
          description: index.description
        });
        
      } catch (error) {
        console.log(`   ❌ خطأ في إنشاء ${index.name}:`, error.message);
        
        this.results.push({
          name: index.name,
          status: 'error',
          error: error.message,
          description: index.description
        });
      }
    }
  }

  // تحليل أداء الفهارس الحالية
  async analyzeIndexUsage() {
    console.log('\n📈 تحليل استخدام الفهارس...\n');

    try {
      // الحصول على إحصائيات الفهارس
      const indexStats = await this.prisma.$queryRaw`
        SELECT 
          schemaname,
          tablename,
          indexname,
          idx_tup_read,
          idx_tup_fetch,
          CASE 
            WHEN idx_tup_read > 0 
            THEN round((idx_tup_fetch::decimal / idx_tup_read) * 100, 2)
            ELSE 0
          END as hit_rate
        FROM pg_stat_user_indexes
        WHERE schemaname = 'public'
        ORDER BY idx_tup_read DESC
        LIMIT 10;
      `;

      console.log('🔍 أكثر الفهارس استخداماً:');
      indexStats.forEach(stat => {
        console.log(`   ${stat.indexname}: ${stat.idx_tup_read} قراءة، معدل النجاح: ${stat.hit_rate}%`);
      });

      // تحليل أحجام الجداول
      const tableSizes = await this.prisma.$queryRaw`
        SELECT 
          schemaname,
          tablename,
          pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
          pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
          pg_size_pretty(pg_indexes_size(schemaname||'.'||tablename)) as indexes_size
        FROM pg_tables
        WHERE schemaname = 'public'
        ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
      `;

      console.log('\n📊 أحجام الجداول والفهارس:');
      tableSizes.forEach(size => {
        console.log(`   ${size.tablename}: الإجمالي ${size.total_size} (جدول: ${size.table_size}, فهارس: ${size.indexes_size})`);
      });

      return { indexStats, tableSizes };

    } catch (error) {
      console.log('❌ خطأ في تحليل الفهارس:', error.message);
      return null;
    }
  }

  // تحسين إعدادات قاعدة البيانات
  async optimizeSettings() {
    console.log('\n⚙️  تحسين إعدادات قاعدة البيانات...\n');

    const optimizations = [
      {
        name: 'تحديث إحصائيات الجداول',
        sql: `ANALYZE;`,
        description: 'تحديث إحصائيات المحسن للاستعلامات'
      },
      {
        name: 'تحسين Articles',
        sql: `VACUUM ANALYZE articles;`,
        description: 'تنظيف وتحسين جدول المقالات'
      },
      {
        name: 'تحسين Categories',
        sql: `VACUUM ANALYZE categories;`,
        description: 'تنظيف وتحسين جدول التصنيفات'
      }
    ];

    for (const optimization of optimizations) {
      try {
        console.log(`🔧 ${optimization.description}...`);
        
        const startTime = Date.now();
        await this.prisma.$executeRawUnsafe(optimization.sql);
        const duration = Date.now() - startTime;
        
        console.log(`   ✅ تم ${optimization.name} (${duration}ms)`);
        
      } catch (error) {
        console.log(`   ❌ خطأ في ${optimization.name}:`, error.message);
      }
    }
  }

  // اختبار أداء الاستعلامات الشائعة
  async benchmarkQueries() {
    console.log('\n⚡ اختبار أداء الاستعلامات...\n');

    const queries = [
      {
        name: 'المقالات المنشورة الحديثة',
        test: async () => {
          return await this.prisma.articles.findMany({
            where: {
              published_at: {
                not: null
              }
            },
            orderBy: {
              published_at: 'desc'
            },
            take: 10,
            select: {
              id: true,
              title: true,
              slug: true,
              published_at: true
            }
          });
        }
      },
      {
        name: 'مقالات حسب التصنيف',
        test: async () => {
          // الحصول على أول تصنيف متاح
          const category = await this.prisma.categories.findFirst();
          if (!category) return [];
          
          return await this.prisma.articles.findMany({
            where: {
              category_id: category.id,
              published_at: {
                not: null
              }
            },
            orderBy: {
              published_at: 'desc'
            },
            take: 5
          });
        }
      },
      {
        name: 'المقالات المميزة',
        test: async () => {
          return await this.prisma.articles.findMany({
            where: {
              featured: true,
              published_at: {
                not: null
              }
            },
            orderBy: {
              published_at: 'desc'
            },
            take: 5
          });
        }
      }
    ];

    const benchmarkResults = [];

    for (const query of queries) {
      try {
        console.log(`🧪 اختبار: ${query.name}...`);
        
        // تشغيل الاستعلام 3 مرات وحساب المتوسط
        const times = [];
        
        for (let i = 0; i < 3; i++) {
          const startTime = Date.now();
          const result = await query.test();
          const duration = Date.now() - startTime;
          times.push(duration);
        }
        
        const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
        const minTime = Math.min(...times);
        const maxTime = Math.max(...times);
        
        console.log(`   ⏱️  المتوسط: ${avgTime.toFixed(2)}ms، أسرع: ${minTime}ms، أبطأ: ${maxTime}ms`);
        
        benchmarkResults.push({
          name: query.name,
          avgTime,
          minTime,
          maxTime,
          status: avgTime < 100 ? 'excellent' : avgTime < 500 ? 'good' : 'needs_improvement'
        });
        
      } catch (error) {
        console.log(`   ❌ خطأ في ${query.name}:`, error.message);
        
        benchmarkResults.push({
          name: query.name,
          status: 'error',
          error: error.message
        });
      }
    }

    return benchmarkResults;
  }

  // إنشاء تقرير شامل
  async generateReport() {
    console.log('\n📊 إنشاء تقرير التحسين...\n');

    const analysisResult = await this.analyzeIndexUsage();
    const benchmarkResults = await this.benchmarkQueries();
    
    const totalTime = Date.now() - this.startTime;
    const successfulIndexes = this.results.filter(r => r.status === 'success').length;
    const totalIndexes = this.results.length;

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTime: `${totalTime}ms`,
        indexesCreated: `${successfulIndexes}/${totalIndexes}`,
        overallStatus: successfulIndexes === totalIndexes ? 'success' : 'partial'
      },
      indexes: this.results,
      analysis: analysisResult,
      benchmarks: benchmarkResults,
      recommendations: this.generateRecommendations(benchmarkResults)
    };

    // حفظ التقرير
    try {
      const reportDir = path.join(__dirname, '../reports');
      if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
      }
      
      const reportPath = path.join(reportDir, `database-optimization-${Date.now()}.json`);
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
      
      console.log(`💾 تم حفظ التقرير في: ${reportPath}`);
      
    } catch (error) {
      console.log('❌ خطأ في حفظ التقرير:', error.message);
    }

    return report;
  }

  // إنشاء التوصيات
  generateRecommendations(benchmarkResults) {
    const recommendations = [];

    benchmarkResults.forEach(result => {
      if (result.status === 'needs_improvement') {
        recommendations.push({
          query: result.name,
          issue: `الاستعلام بطيء: ${result.avgTime.toFixed(2)}ms`,
          solution: 'فحص خطة التنفيذ وإضافة فهارس محددة'
        });
      }
    });

    if (recommendations.length === 0) {
      recommendations.push({
        overall: 'ممتاز! جميع الاستعلامات تعمل بأداء جيد',
        suggestion: 'مراقبة الأداء بانتظام والتحسين التدريجي'
      });
    }

    return recommendations;
  }

  // تنظيف الموارد
  async cleanup() {
    await this.prisma.$disconnect();
  }

  // تشغيل جميع التحسينات
  async runOptimization() {
    try {
      console.log('🚀 بدء تحسين قاعدة البيانات...\n');

      // تطبيق الفهارس
      await this.applyIndexes();
      
      // تحسين الإعدادات
      await this.optimizeSettings();
      
      // إنشاء التقرير
      const report = await this.generateReport();
      
      // عرض النتائج النهائية
      console.log('\n🎉 تم الانتهاء من تحسين قاعدة البيانات!');
      console.log(`⏱️  الوقت الإجمالي: ${report.summary.totalTime}`);
      console.log(`📊 الفهارس المنشأة: ${report.summary.indexesCreated}`);
      
      const status = report.summary.overallStatus === 'success' ? 
        '🟢 ممتاز - جميع التحسينات تمت بنجاح' : 
        '🟡 جيد - معظم التحسينات تمت بنجاح';
        
      console.log(`📈 الحالة: ${status}`);

    } catch (error) {
      console.error('❌ خطأ عام في تحسين قاعدة البيانات:', error);
    } finally {
      await this.cleanup();
    }
  }
}

// تشغيل التحسين
async function main() {
  const optimizer = new DatabaseOptimizer();
  await optimizer.runOptimization();
}

// تشغيل إذا تم استدعاء الملف مباشرة
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { DatabaseOptimizer };
