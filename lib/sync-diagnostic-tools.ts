/**
 * أدوات تشخيص ومراقبة التزامن
 * 
 * مجموعة شاملة من الأدوات لتشخيص ومراقبة مشاكل التزامن
 * بين النسخة المكتبية والمحمولة
 */

import { deviceDetector } from './unified-device-detector';
import { unifiedCache } from './unified-cache-manager';
import { cacheInvalidator } from './comprehensive-cache-invalidation';

/**
 * أنواع المشاكل المحتملة
 */
export enum SyncIssueType {
  DEVICE_MISMATCH = 'device_mismatch',
  CACHE_INCONSISTENCY = 'cache_inconsistency',
  DATA_DIFFERENCE = 'data_difference',
  TIMING_ISSUE = 'timing_issue',
  API_ERROR = 'api_error'
}

/**
 * مستوى الخطورة
 */
export enum SeverityLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

/**
 * نتيجة التشخيص
 */
export interface DiagnosticResult {
  timestamp: Date;
  deviceType: string;
  issues: SyncIssue[];
  recommendations: string[];
  overallHealth: number; // 0-100
  requiresAction: boolean;
}

/**
 * مشكلة تزامن
 */
export interface SyncIssue {
  type: SyncIssueType;
  severity: SeverityLevel;
  description: string;
  details: any;
  suggestedFix?: string;
}

/**
 * نتيجة المقارنة
 */
export interface ComparisonResult {
  identical: boolean;
  differences: Array<{
    field: string;
    desktop: any;
    mobile: any;
    impact: string;
  }>;
  summary: string;
}

/**
 * أداة تشخيص التزامن
 */
export class SyncDiagnosticTool {
  private static instance: SyncDiagnosticTool;
  private diagnosticHistory: DiagnosticResult[] = [];
  private monitoringInterval: NodeJS.Timeout | null = null;
  
  private constructor() {}
  
  public static getInstance(): SyncDiagnosticTool {
    if (!SyncDiagnosticTool.instance) {
      SyncDiagnosticTool.instance = new SyncDiagnosticTool();
    }
    return SyncDiagnosticTool.instance;
  }
  
  /**
   * تشغيل تشخيص شامل
   */
  public async runFullDiagnostic(): Promise<DiagnosticResult> {
    console.log('🔍 بدء التشخيص الشامل للتزامن...');
    
    const issues: SyncIssue[] = [];
    const recommendations: string[] = [];
    
    // 1. فحص آلية التعرف على الجهاز
    const deviceIssues = await this.checkDeviceDetection();
    issues.push(...deviceIssues);
    
    // 2. فحص اتساق الكاش
    const cacheIssues = await this.checkCacheConsistency();
    issues.push(...cacheIssues);
    
    // 3. فحص تزامن البيانات
    const dataIssues = await this.checkDataSynchronization();
    issues.push(...dataIssues);
    
    // 4. فحص أداء API
    const apiIssues = await this.checkAPIPerformance();
    issues.push(...apiIssues);
    
    // 5. فحص إعدادات الكاش
    const cacheConfigIssues = await this.checkCacheConfiguration();
    issues.push(...cacheConfigIssues);
    
    // توليد التوصيات
    recommendations.push(...this.generateRecommendations(issues));
    
    // حساب الصحة العامة
    const overallHealth = this.calculateOverallHealth(issues);
    
    const result: DiagnosticResult = {
      timestamp: new Date(),
      deviceType: deviceDetector.getDeviceType(),
      issues,
      recommendations,
      overallHealth,
      requiresAction: issues.some(i => i.severity === SeverityLevel.HIGH || i.severity === SeverityLevel.CRITICAL)
    };
    
    this.diagnosticHistory.push(result);
    
    console.log(`✅ اكتمل التشخيص - الصحة العامة: ${overallHealth}%`);
    
    return result;
  }
  
  /**
   * فحص آلية التعرف على الجهاز
   */
  private async checkDeviceDetection(): Promise<SyncIssue[]> {
    const issues: SyncIssue[] = [];
    
    try {
      // فحص ثبات التعرف على الجهاز
      const deviceInfo = deviceDetector.getDeviceInfo();
      
      if (!deviceInfo) {
        issues.push({
          type: SyncIssueType.DEVICE_MISMATCH,
          severity: SeverityLevel.HIGH,
          description: 'لم يتم التعرف على معلومات الجهاز',
          details: { deviceInfo },
          suggestedFix: 'تحقق من تهيئة نظام التعرف على الجهاز'
        });
      }
      
      // فحص الكوكيز والتخزين المحلي
      const cookieType = this.getCookie('device-type');
      const storageType = localStorage.getItem('device-info');
      
      if (cookieType && deviceInfo && cookieType !== deviceInfo.type) {
        issues.push({
          type: SyncIssueType.DEVICE_MISMATCH,
          severity: SeverityLevel.MEDIUM,
          description: 'عدم تطابق نوع الجهاز بين الكوكي والذاكرة',
          details: { 
            cookie: cookieType, 
            detected: deviceInfo.type 
          },
          suggestedFix: 'مسح الكوكيز وإعادة التعرف على الجهاز'
        });
      }
      
      // فحص CSS classes
      const bodyClasses = document.body.className;
      const hasDeviceClass = /device-(mobile|tablet|desktop)/.test(bodyClasses);
      
      if (!hasDeviceClass) {
        issues.push({
          type: SyncIssueType.DEVICE_MISMATCH,
          severity: SeverityLevel.LOW,
          description: 'لا توجد كلاس CSS للجهاز',
          details: { bodyClasses },
          suggestedFix: 'تطبيق كلاس الجهاز على body'
        });
      }
      
    } catch (error) {
      issues.push({
        type: SyncIssueType.DEVICE_MISMATCH,
        severity: SeverityLevel.HIGH,
        description: 'خطأ في فحص آلية التعرف على الجهاز',
        details: { error: String(error) }
      });
    }
    
    return issues;
  }
  
  /**
   * فحص اتساق الكاش
   */
  private async checkCacheConsistency(): Promise<SyncIssue[]> {
    const issues: SyncIssue[] = [];
    
    try {
      const cacheStats = unifiedCache.getStats();
      const invalidationStats = cacheInvalidator.getStats();
      
      // فحص حجم الكاش
      if (cacheStats.memoryCacheSize > 80) {
        issues.push({
          type: SyncIssueType.CACHE_INCONSISTENCY,
          severity: SeverityLevel.MEDIUM,
          description: 'كاش الذاكرة ممتلئ',
          details: { size: cacheStats.memoryCacheSize },
          suggestedFix: 'تنظيف الكاش أو زيادة الحد الأقصى'
        });
      }
      
      // فحص آخر إبطال
      if (cacheStats.lastInvalidation) {
        const timeSinceInvalidation = Date.now() - new Date(cacheStats.lastInvalidation).getTime();
        const hoursSince = timeSinceInvalidation / (1000 * 60 * 60);
        
        if (hoursSince > 24) {
          issues.push({
            type: SyncIssueType.CACHE_INCONSISTENCY,
            severity: SeverityLevel.LOW,
            description: 'لم يتم إبطال الكاش منذ أكثر من 24 ساعة',
            details: { 
              lastInvalidation: cacheStats.lastInvalidation,
              hoursSince: Math.round(hoursSince)
            },
            suggestedFix: 'قد تحتاج لإبطال الكاش للحصول على أحدث البيانات'
          });
        }
      }
      
      // فحص نسبة الفشل في الإبطال
      if (invalidationStats.totalInvalidations > 0) {
        const failureRate = (invalidationStats.failedInvalidations / invalidationStats.totalInvalidations) * 100;
        
        if (failureRate > 10) {
          issues.push({
            type: SyncIssueType.CACHE_INCONSISTENCY,
            severity: SeverityLevel.HIGH,
            description: 'نسبة فشل عالية في إبطال الكاش',
            details: { 
              failureRate: `${failureRate.toFixed(2)}%`,
              failed: invalidationStats.failedInvalidations,
              total: invalidationStats.totalInvalidations
            },
            suggestedFix: 'فحص إعدادات Redis والشبكة'
          });
        }
      }
      
    } catch (error) {
      issues.push({
        type: SyncIssueType.CACHE_INCONSISTENCY,
        severity: SeverityLevel.MEDIUM,
        description: 'خطأ في فحص اتساق الكاش',
        details: { error: String(error) }
      });
    }
    
    return issues;
  }
  
  /**
   * فحص تزامن البيانات
   */
  private async checkDataSynchronization(): Promise<SyncIssue[]> {
    const issues: SyncIssue[] = [];
    
    try {
      // مقارنة البيانات بين النسختين
      const comparison = await this.compareDesktopAndMobileData();
      
      if (!comparison.identical) {
        const severity = comparison.differences.length > 5 
          ? SeverityLevel.HIGH 
          : SeverityLevel.MEDIUM;
        
        issues.push({
          type: SyncIssueType.DATA_DIFFERENCE,
          severity,
          description: 'اختلاف في البيانات بين النسختين',
          details: comparison,
          suggestedFix: 'إبطال الكاش وإعادة جلب البيانات'
        });
      }
      
      // فحص التوقيت
      const timingCheck = await this.checkDataTiming();
      
      if (timingCheck.desyncDetected) {
        issues.push({
          type: SyncIssueType.TIMING_ISSUE,
          severity: SeverityLevel.MEDIUM,
          description: 'فرق في توقيت البيانات',
          details: timingCheck,
          suggestedFix: 'تحقق من إعدادات TTL وإبطال الكاش'
        });
      }
      
    } catch (error) {
      issues.push({
        type: SyncIssueType.DATA_DIFFERENCE,
        severity: SeverityLevel.HIGH,
        description: 'خطأ في فحص تزامن البيانات',
        details: { error: String(error) }
      });
    }
    
    return issues;
  }
  
  /**
   * فحص أداء API
   */
  private async checkAPIPerformance(): Promise<SyncIssue[]> {
    const issues: SyncIssue[] = [];
    
    try {
      const endpoints = [
        '/api/articles',
        '/api/news/latest',
        '/api/news/featured'
      ];
      
      for (const endpoint of endpoints) {
        const startTime = Date.now();
        
        try {
          const response = await fetch(endpoint);
          const responseTime = Date.now() - startTime;
          
          if (!response.ok) {
            issues.push({
              type: SyncIssueType.API_ERROR,
              severity: SeverityLevel.HIGH,
              description: `خطأ في API: ${endpoint}`,
              details: { 
                status: response.status,
                statusText: response.statusText
              },
              suggestedFix: 'فحص الخادم وقاعدة البيانات'
            });
          } else if (responseTime > 3000) {
            issues.push({
              type: SyncIssueType.TIMING_ISSUE,
              severity: SeverityLevel.MEDIUM,
              description: `بطء في الاستجابة: ${endpoint}`,
              details: { 
                responseTime: `${responseTime}ms`,
                threshold: '3000ms'
              },
              suggestedFix: 'تحسين استعلامات قاعدة البيانات أو زيادة موارد الخادم'
            });
          }
          
        } catch (error) {
          issues.push({
            type: SyncIssueType.API_ERROR,
            severity: SeverityLevel.CRITICAL,
            description: `فشل الاتصال بـ ${endpoint}`,
            details: { error: String(error) },
            suggestedFix: 'تحقق من الخادم والشبكة'
          });
        }
      }
      
    } catch (error) {
      issues.push({
        type: SyncIssueType.API_ERROR,
        severity: SeverityLevel.HIGH,
        description: 'خطأ في فحص أداء API',
        details: { error: String(error) }
      });
    }
    
    return issues;
  }
  
  /**
   * فحص إعدادات الكاش
   */
  private async checkCacheConfiguration(): Promise<SyncIssue[]> {
    const issues: SyncIssue[] = [];
    
    try {
      // فحص ترويسات الكاش
      const response = await fetch('/api/articles', { method: 'HEAD' });
      const cacheControl = response.headers.get('cache-control');
      const vary = response.headers.get('vary');
      
      if (vary && vary.includes('User-Agent')) {
        issues.push({
          type: SyncIssueType.CACHE_INCONSISTENCY,
          severity: SeverityLevel.HIGH,
          description: 'استخدام Vary: User-Agent يسبب كاش منفصل لكل جهاز',
          details: { vary },
          suggestedFix: 'إزالة User-Agent من ترويسة Vary أو استخدام قيمة أخرى'
        });
      }
      
      if (!cacheControl || cacheControl.includes('no-cache')) {
        issues.push({
          type: SyncIssueType.CACHE_INCONSISTENCY,
          severity: SeverityLevel.MEDIUM,
          description: 'لا يوجد تكوين كاش مناسب',
          details: { cacheControl },
          suggestedFix: 'إضافة ترويسات كاش مناسبة'
        });
      }
      
    } catch (error) {
      issues.push({
        type: SyncIssueType.CACHE_INCONSISTENCY,
        severity: SeverityLevel.LOW,
        description: 'خطأ في فحص إعدادات الكاش',
        details: { error: String(error) }
      });
    }
    
    return issues;
  }
  
  /**
   * مقارنة البيانات بين النسختين
   */
  private async compareDesktopAndMobileData(): Promise<ComparisonResult> {
    try {
      // جلب البيانات كـ desktop
      const desktopResponse = await fetch('/api/articles?limit=5', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0'
        }
      });
      const desktopData = await desktopResponse.json();
      
      // جلب البيانات كـ mobile
      const mobileResponse = await fetch('/api/articles?limit=5', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0) Safari/604.1'
        }
      });
      const mobileData = await mobileResponse.json();
      
      // مقارنة البيانات
      const differences: any[] = [];
      
      // مقارنة عدد المقالات
      if (desktopData.articles?.length !== mobileData.articles?.length) {
        differences.push({
          field: 'articles.length',
          desktop: desktopData.articles?.length,
          mobile: mobileData.articles?.length,
          impact: 'عدد مختلف من المقالات'
        });
      }
      
      // مقارنة IDs المقالات
      const desktopIds = desktopData.articles?.map((a: any) => a.id) || [];
      const mobileIds = mobileData.articles?.map((a: any) => a.id) || [];
      
      const idDifference = desktopIds.filter((id: string) => !mobileIds.includes(id));
      
      if (idDifference.length > 0) {
        differences.push({
          field: 'article_ids',
          desktop: desktopIds,
          mobile: mobileIds,
          impact: 'مقالات مختلفة في كل نسخة'
        });
      }
      
      // مقارنة التوقيت
      if (desktopData.timestamp && mobileData.timestamp) {
        const timeDiff = Math.abs(new Date(desktopData.timestamp).getTime() - new Date(mobileData.timestamp).getTime());
        
        if (timeDiff > 60000) { // أكثر من دقيقة
          differences.push({
            field: 'timestamp',
            desktop: desktopData.timestamp,
            mobile: mobileData.timestamp,
            impact: 'فرق في وقت جلب البيانات'
          });
        }
      }
      
      return {
        identical: differences.length === 0,
        differences,
        summary: differences.length === 0 
          ? 'البيانات متطابقة' 
          : `وجد ${differences.length} اختلافات`
      };
      
    } catch (error) {
      return {
        identical: false,
        differences: [{
          field: 'error',
          desktop: null,
          mobile: null,
          impact: String(error)
        }],
        summary: 'فشل في المقارنة'
      };
    }
  }
  
  /**
   * فحص توقيت البيانات
   */
  private async checkDataTiming(): Promise<{ desyncDetected: boolean; details: any }> {
    try {
      const requests = [];
      
      // إرسال 3 طلبات متتالية
      for (let i = 0; i < 3; i++) {
        requests.push(
          fetch('/api/articles?limit=1').then(r => r.json())
        );
      }
      
      const results = await Promise.all(requests);
      
      // فحص إذا كانت النتائج مختلفة
      const firstId = results[0]?.articles?.[0]?.id;
      const allSame = results.every(r => r?.articles?.[0]?.id === firstId);
      
      return {
        desyncDetected: !allSame,
        details: {
          results: results.map(r => r?.articles?.[0]?.id),
          consistent: allSame
        }
      };
      
    } catch (error) {
      return {
        desyncDetected: true,
        details: { error: String(error) }
      };
    }
  }
  
  /**
   * توليد التوصيات
   */
  private generateRecommendations(issues: SyncIssue[]): string[] {
    const recommendations: string[] = [];
    const issueTypes = new Set(issues.map(i => i.type));
    
    if (issueTypes.has(SyncIssueType.DEVICE_MISMATCH)) {
      recommendations.push('استخدم نظام التعرف الموحد على الجهاز UnifiedDeviceDetector');
      recommendations.push('تأكد من حفظ نوع الجهاز في الكوكيز والتخزين المحلي');
    }
    
    if (issueTypes.has(SyncIssueType.CACHE_INCONSISTENCY)) {
      recommendations.push('استخدم مدير الكاش الموحد UnifiedCacheManager');
      recommendations.push('قم بإبطال الكاش بشكل شامل عند نشر المقالات');
      recommendations.push('تجنب استخدام Vary: User-Agent في ترويسات الكاش');
    }
    
    if (issueTypes.has(SyncIssueType.DATA_DIFFERENCE)) {
      recommendations.push('وحّد استعلامات API بين النسختين');
      recommendations.push('استخدم نفس المعاملات والفلاتر للنسختين');
      recommendations.push('تأكد من استخدام نفس مصدر البيانات');
    }
    
    if (issueTypes.has(SyncIssueType.TIMING_ISSUE)) {
      recommendations.push('حسّن أداء قاعدة البيانات');
      recommendations.push('استخدم فهارس مناسبة للاستعلامات');
      recommendations.push('فعّل التخزين المؤقت على مستوى قاعدة البيانات');
    }
    
    if (issueTypes.has(SyncIssueType.API_ERROR)) {
      recommendations.push('تحقق من صحة الخادم وقاعدة البيانات');
      recommendations.push('راجع سجلات الأخطاء');
      recommendations.push('تأكد من توفر الموارد الكافية');
    }
    
    // توصيات عامة
    if (issues.some(i => i.severity === SeverityLevel.CRITICAL)) {
      recommendations.unshift('⚠️ يوجد مشاكل حرجة تتطلب اهتمام فوري');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('✅ النظام يعمل بشكل جيد، استمر في المراقبة');
    }
    
    return recommendations;
  }
  
  /**
   * حساب الصحة العامة
   */
  private calculateOverallHealth(issues: SyncIssue[]): number {
    if (issues.length === 0) return 100;
    
    let score = 100;
    
    for (const issue of issues) {
      switch (issue.severity) {
        case SeverityLevel.CRITICAL:
          score -= 25;
          break;
        case SeverityLevel.HIGH:
          score -= 15;
          break;
        case SeverityLevel.MEDIUM:
          score -= 10;
          break;
        case SeverityLevel.LOW:
          score -= 5;
          break;
      }
    }
    
    return Math.max(0, score);
  }
  
  /**
   * بدء المراقبة المستمرة
   */
  public startMonitoring(intervalMinutes: number = 5): void {
    if (this.monitoringInterval) {
      console.log('المراقبة مُفعلة بالفعل');
      return;
    }
    
    console.log(`🔄 بدء المراقبة المستمرة كل ${intervalMinutes} دقائق`);
    
    this.monitoringInterval = setInterval(async () => {
      const result = await this.runFullDiagnostic();
      
      if (result.requiresAction) {
        console.error('⚠️ تم اكتشاف مشاكل تتطلب اتخاذ إجراء:');
        result.issues
          .filter(i => i.severity === SeverityLevel.HIGH || i.severity === SeverityLevel.CRITICAL)
          .forEach(issue => {
            console.error(`- ${issue.description}`);
            if (issue.suggestedFix) {
              console.error(`  الحل: ${issue.suggestedFix}`);
            }
          });
      }
    }, intervalMinutes * 60 * 1000);
  }
  
  /**
   * إيقاف المراقبة
   */
  public stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log('🛑 تم إيقاف المراقبة المستمرة');
    }
  }
  
  /**
   * الحصول على آخر نتيجة تشخيص
   */
  public getLastDiagnostic(): DiagnosticResult | null {
    return this.diagnosticHistory[this.diagnosticHistory.length - 1] || null;
  }
  
  /**
   * الحصول على سجل التشخيص
   */
  public getDiagnosticHistory(): DiagnosticResult[] {
    return this.diagnosticHistory;
  }
  
  /**
   * مسح سجل التشخيص
   */
  public clearHistory(): void {
    this.diagnosticHistory = [];
    console.log('تم مسح سجل التشخيص');
  }
  
  /**
   * دالة مساعدة للحصول على الكوكي
   */
  private getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    
    return null;
  }
  
  /**
   * تصدير تقرير التشخيص
   */
  public exportReport(result?: DiagnosticResult): string {
    const data = result || this.getLastDiagnostic();
    
    if (!data) {
      return 'لا توجد نتائج تشخيص';
    }
    
    let report = `تقرير تشخيص التزامن
========================
التاريخ: ${data.timestamp}
نوع الجهاز: ${data.deviceType}
الصحة العامة: ${data.overallHealth}%
يتطلب إجراء: ${data.requiresAction ? 'نعم' : 'لا'}

المشاكل المكتشفة (${data.issues.length}):
`;
    
    for (const issue of data.issues) {
      report += `
- ${issue.description}
  الخطورة: ${issue.severity}
  النوع: ${issue.type}`;
      
      if (issue.suggestedFix) {
        report += `
  الحل المقترح: ${issue.suggestedFix}`;
      }
    }
    
    report += `

التوصيات:
`;
    
    for (const rec of data.recommendations) {
      report += `• ${rec}
`;
    }
    
    return report;
  }
}

// تصدير instance للاستخدام المباشر
export const syncDiagnostic = SyncDiagnosticTool.getInstance();

/**
 * Hook لاستخدام أداة التشخيص في React
 */
export function useSyncDiagnostic() {
  const [diagnostic, setDiagnostic] = useState<DiagnosticResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);
  
  const runDiagnostic = useCallback(async () => {
    setIsRunning(true);
    try {
      const result = await syncDiagnostic.runFullDiagnostic();
      setDiagnostic(result);
      return result;
    } finally {
      setIsRunning(false);
    }
  }, []);
  
  const startMonitoring = useCallback((interval?: number) => {
    syncDiagnostic.startMonitoring(interval);
    setIsMonitoring(true);
  }, []);
  
  const stopMonitoring = useCallback(() => {
    syncDiagnostic.stopMonitoring();
    setIsMonitoring(false);
  }, []);
  
  const exportReport = useCallback(() => {
    return syncDiagnostic.exportReport(diagnostic || undefined);
  }, [diagnostic]);
  
  useEffect(() => {
    return () => {
      // تنظيف عند إلغاء التحميل
      if (isMonitoring) {
        syncDiagnostic.stopMonitoring();
      }
    };
  }, [isMonitoring]);
  
  return {
    diagnostic,
    isRunning,
    isMonitoring,
    runDiagnostic,
    startMonitoring,
    stopMonitoring,
    exportReport,
    history: syncDiagnostic.getDiagnosticHistory()
  };
}
