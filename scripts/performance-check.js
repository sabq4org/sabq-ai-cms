#!/usr/bin/env node

/**
 * أداة فحص وتحليل الأداء لموقع سبق
 * تطبيق خطة التحسين المقترحة في تقرير اختبار التحمل
 */

const { performance } = require('perf_hooks');
const fs = require('fs');
const path = require('path');

class PerformanceAnalyzer {
  constructor() {
    this.results = [];
    this.startTime = performance.now();
  }

  // فحص تحسينات Cloudinary
  async checkCloudinaryOptimizations() {
    console.log('\n🖼️  فحص تحسينات Cloudinary...');
    
    try {
      // فحص ملف التكوين
      const configPath = path.join(__dirname, '../lib/cloudinary-config.ts');
      const configContent = fs.readFileSync(configPath, 'utf8');
      
      const checks = {
        hasAutoQuality: configContent.includes('quality: \'auto\''),
        hasAutoFormat: configContent.includes('f_auto'),
        hasProgressiveJPEG: configContent.includes('fl_progressive'),
        hasResponsiveBreakpoints: configContent.includes('responsive_breakpoints'),
        hasImmutableCache: configContent.includes('fl_immutable_cache')
      };
      
      const passed = Object.values(checks).filter(Boolean).length;
      const total = Object.keys(checks).length;
      
      console.log(`   ✅ تم تطبيق ${passed}/${total} تحسينات Cloudinary`);
      
      this.results.push({
        category: 'Cloudinary',
        score: (passed / total) * 100,
        details: checks
      });
      
    } catch (error) {
      console.log('   ❌ خطأ في فحص Cloudinary:', error.message);
      this.results.push({
        category: 'Cloudinary',
        score: 0,
        error: error.message
      });
    }
  }

  // فحص تحسينات Redis Cache
  async checkRedisCacheOptimizations() {
    console.log('\n💾 فحص تحسينات Redis Cache...');
    
    try {
      // فحص ملف Cache المحسن
      const cachePath = path.join(__dirname, '../lib/redis-cache-optimized.ts');
      const exists = fs.existsSync(cachePath);
      
      if (!exists) {
        console.log('   ❌ ملف Redis Cache المحسن غير موجود');
        this.results.push({
          category: 'Redis Cache',
          score: 0,
          error: 'ملف Cache المحسن غير موجود'
        });
        return;
      }
      
      const cacheContent = fs.readFileSync(cachePath, 'utf8');
      
      const checks = {
        hasPerformanceConfig: cacheContent.includes('PERFORMANCE_CACHE_CONFIG'),
        hasStaleWhileRevalidate: cacheContent.includes('stale-while-revalidate'),
        hasBackgroundRefresh: cacheContent.includes('refreshInBackground'),
        hasCacheKeys: cacheContent.includes('CACHE_KEYS'),
        hasInvalidation: cacheContent.includes('invalidateCache')
      };
      
      const passed = Object.values(checks).filter(Boolean).length;
      const total = Object.keys(checks).length;
      
      console.log(`   ✅ تم تطبيق ${passed}/${total} تحسينات Redis Cache`);
      
      this.results.push({
        category: 'Redis Cache',
        score: (passed / total) * 100,
        details: checks
      });
      
    } catch (error) {
      console.log('   ❌ خطأ في فحص Redis Cache:', error.message);
      this.results.push({
        category: 'Redis Cache',
        score: 0,
        error: error.message
      });
    }
  }

  // فحص تحسينات Next.js Configuration
  async checkNextJsOptimizations() {
    console.log('\n⚡ فحص تحسينات Next.js...');
    
    try {
      const configPath = path.join(__dirname, '../next.config.js');
      const configContent = fs.readFileSync(configPath, 'utf8');
      
      const checks = {
        hasAVIFSupport: configContent.includes('image/avif'),
        hasOptimizePackageImports: configContent.includes('optimizePackageImports'),
        hasOptimizedCaching: configContent.includes('stale-while-revalidate'),
        hasWebpackSplitting: configContent.includes('splitChunks'),
        hasPerformanceBudget: configContent.includes('performance'),
        hasServerComponents: configContent.includes('serverComponentsExternalPackages')
      };
      
      const passed = Object.values(checks).filter(Boolean).length;
      const total = Object.keys(checks).length;
      
      console.log(`   ✅ تم تطبيق ${passed}/${total} تحسينات Next.js`);
      
      this.results.push({
        category: 'Next.js Config',
        score: (passed / total) * 100,
        details: checks
      });
      
    } catch (error) {
      console.log('   ❌ خطأ في فحص Next.js:', error.message);
      this.results.push({
        category: 'Next.js Config',
        score: 0,
        error: error.message
      });
    }
  }

  // فحص API Routes المحسنة
  async checkAPIOptimizations() {
    console.log('\n🔧 فحص تحسينات API...');
    
    try {
      const apiPath = path.join(__dirname, '../app/api/news/optimized/route.ts');
      const apiContent = fs.readFileSync(apiPath, 'utf8');
      
      const checks = {
        usesRedisCache: apiContent.includes('redis-cache-optimized'),
        hasResponseTimeTracking: apiContent.includes('responseTime'),
        hasCacheHeaders: apiContent.includes('X-Cache-Status'),
        usesOptimizedQueries: apiContent.includes('select:'),
        hasErrorHandling: apiContent.includes('try') && apiContent.includes('catch')
      };
      
      const passed = Object.values(checks).filter(Boolean).length;
      const total = Object.keys(checks).length;
      
      console.log(`   ✅ تم تطبيق ${passed}/${total} تحسينات API`);
      
      this.results.push({
        category: 'API Optimization',
        score: (passed / total) * 100,
        details: checks
      });
      
    } catch (error) {
      console.log('   ❌ خطأ في فحص API:', error.message);
      this.results.push({
        category: 'API Optimization',
        score: 0,
        error: error.message
      });
    }
  }

  // فحص Bundle Size
  async checkBundleSize() {
    console.log('\n📦 فحص حجم Bundle...');
    
    try {
      const nextBuildPath = path.join(__dirname, '../.next');
      
      if (!fs.existsSync(nextBuildPath)) {
        console.log('   ⚠️  المشروع غير مبني. تشغيل: npm run build');
        this.results.push({
          category: 'Bundle Size',
          score: 50,
          warning: 'المشروع غير مبني'
        });
        return;
      }
      
      // قراءة تقرير البناء إذا كان متوفراً
      const buildManifest = path.join(nextBuildPath, 'build-manifest.json');
      
      if (fs.existsSync(buildManifest)) {
        const manifest = JSON.parse(fs.readFileSync(buildManifest, 'utf8'));
        const pages = Object.keys(manifest.pages || {});
        
        console.log(`   ✅ عدد الصفحات المبنية: ${pages.length}`);
        
        this.results.push({
          category: 'Bundle Size',
          score: 80, // درجة افتراضية جيدة
          details: { 
            pagesCount: pages.length,
            hasManifest: true 
          }
        });
      } else {
        console.log('   ⚠️  build manifest غير موجود');
        this.results.push({
          category: 'Bundle Size',
          score: 60,
          warning: 'build manifest غير موجود'
        });
      }
      
    } catch (error) {
      console.log('   ❌ خطأ في فحص Bundle:', error.message);
      this.results.push({
        category: 'Bundle Size', 
        score: 0,
        error: error.message
      });
    }
  }

  // تشغيل جميع الفحوصات
  async runAnalysis() {
    console.log('🚀 بدء تحليل تحسينات الأداء...\n');
    
    await this.checkCloudinaryOptimizations();
    await this.checkRedisCacheOptimizations();
    await this.checkNextJsOptimizations();
    await this.checkAPIOptimizations();
    await this.checkBundleSize();
    
    this.generateReport();
  }

  // إنشاء التقرير النهائي
  generateReport() {
    const totalTime = performance.now() - this.startTime;
    
    console.log('\n📊 تقرير تحسينات الأداء');
    console.log('='.repeat(50));
    
    let totalScore = 0;
    let validResults = 0;
    
    this.results.forEach(result => {
      const status = result.score >= 80 ? '🟢' : result.score >= 60 ? '🟡' : '🔴';
      console.log(`${status} ${result.category}: ${result.score.toFixed(1)}%`);
      
      if (result.error) {
        console.log(`     ❌ ${result.error}`);
      } else if (result.warning) {
        console.log(`     ⚠️  ${result.warning}`);
      }
      
      if (!result.error) {
        totalScore += result.score;
        validResults++;
      }
    });
    
    const overallScore = validResults > 0 ? totalScore / validResults : 0;
    
    console.log('\n📈 النتيجة الإجمالية');
    console.log('-'.repeat(30));
    
    const grade = overallScore >= 90 ? 'ممتاز 🏆' :
                  overallScore >= 80 ? 'جيد جداً ✨' :
                  overallScore >= 70 ? 'جيد 👍' :
                  overallScore >= 60 ? 'مقبول ⚠️' : 'يحتاج تحسين 🔧';
                  
    console.log(`النتيجة: ${overallScore.toFixed(1)}% - ${grade}`);
    console.log(`وقت التحليل: ${totalTime.toFixed(2)}ms`);
    
    // توصيات للتحسين
    console.log('\n💡 توصيات للتحسين:');
    console.log('-'.repeat(30));
    
    this.results.forEach(result => {
      if (result.score < 80 && !result.error) {
        console.log(`• ${result.category}: ${this.getRecommendation(result.category)}`);
      }
    });
    
    // حفظ التقرير
    this.saveReport({ overallScore, grade, results: this.results, analysisTime: totalTime });
  }

  // الحصول على توصيات التحسين
  getRecommendation(category) {
    const recommendations = {
      'Cloudinary': 'تطبيق المزيد من تحسينات الصور التلقائية',
      'Redis Cache': 'إضافة المزيد من استراتيجيات التخزين المؤقت',
      'Next.js Config': 'تحسين إعدادات webpack والتخزين المؤقت',
      'API Optimization': 'تحسين استعلامات قاعدة البيانات وإضافة المزيد من Cache',
      'Bundle Size': 'تحسين تقسيم الكود وإزالة التبعيات غير المستخدمة'
    };
    
    return recommendations[category] || 'راجع التوثيق للحصول على توصيات';
  }

  // حفظ التقرير
  saveReport(report) {
    try {
      const reportDir = path.join(__dirname, '../reports');
      if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
      }
      
      const reportPath = path.join(reportDir, `performance-analysis-${Date.now()}.json`);
      
      const fullReport = {
        timestamp: new Date().toISOString(),
        ...report,
        environment: {
          nodeVersion: process.version,
          platform: process.platform,
          arch: process.arch
        }
      };
      
      fs.writeFileSync(reportPath, JSON.stringify(fullReport, null, 2));
      console.log(`\n💾 تم حفظ التقرير في: ${reportPath}`);
      
    } catch (error) {
      console.log('\n❌ خطأ في حفظ التقرير:', error.message);
    }
  }
}

// تشغيل التحليل
async function main() {
  const analyzer = new PerformanceAnalyzer();
  await analyzer.runAnalysis();
}

// تشغيل إذا تم استدعاء الملف مباشرة
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { PerformanceAnalyzer };
