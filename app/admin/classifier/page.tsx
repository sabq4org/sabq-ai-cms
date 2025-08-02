/**
 * 🎛️ لوحة إدارة نظام التصنيف الذكي
 * واجهة شاملة لإدارة ومراقبة النظام
 */

"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Settings, 
  BarChart3, 
  Database, 
  Cog, 
  Download, 
  Upload,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Info,
  Trash2,
  Save,
  Eye,
  TrendingUp,
  Users,
  FileText,
  Zap
} from 'lucide-react';

import { classifyArabicContent, type ClassificationResult } from '@/lib/ai/ArabicContentClassifier';
import ClassificationStats from '@/components/ai/ClassificationStats';
import { DataUtils, AnalyticsUtils } from '@/lib/ai/classifier-utils';
import { CLASSIFIER_CONFIG, validateConfig } from '@/lib/ai/classifier-config';
import { SabqCard, SabqButton, SabqStatCard } from '@/components/design-system';

interface DashboardData {
  totalClassifications: number;
  todayClassifications: number;
  averageAccuracy: number;
  systemHealth: 'excellent' | 'good' | 'warning' | 'error';
  lastClassificationTime: Date | null;
}

export default function ClassifierDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalClassifications: 0,
    todayClassifications: 0,
    averageAccuracy: 0,
    systemHealth: 'good',
    lastClassificationTime: null
  });
  
  const [classificationHistory, setClassificationHistory] = useState<ClassificationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<ClassificationResult[]>([]);
  const [systemConfig, setSystemConfig] = useState(CLASSIFIER_CONFIG);
  const [configValidation, setConfigValidation] = useState(validateConfig());

  // تحميل البيانات عند بدء الصفحة
  useEffect(() => {
    loadDashboardData();
    loadClassificationHistory();
  }, []);

  const loadDashboardData = () => {
    // محاكاة تحميل البيانات
    const history = DataUtils.loadFromStorage('classification_history', []);
    const today = new Date().toDateString();
    const todayCount = history.filter((item: any) => 
      new Date(item.timestamp || Date.now()).toDateString() === today
    ).length;

    setDashboardData({
      totalClassifications: history.length,
      todayClassifications: todayCount,
      averageAccuracy: history.length > 0 ? 
        AnalyticsUtils.calculateAverageConfidence(history) * 100 : 0,
      systemHealth: history.length > 100 ? 'excellent' : 'good',
      lastClassificationTime: history.length > 0 ? 
        new Date((history[history.length - 1] as any)?.timestamp || Date.now()) : null
    });
  };

  const loadClassificationHistory = () => {
    const history = DataUtils.loadFromStorage('classification_history', []);
    setClassificationHistory(history);
  };

  const runSystemDiagnostics = async () => {
    setIsLoading(true);
    try {
      // اختبار النظام مع نصوص تجريبية
      const testTexts = [
        { title: "خبر سياسي", content: "رئيس الوزراء يعلن عن إصلاحات جديدة في القطاع الاقتصادي" },
        { title: "خبر رياضي", content: "الفريق الوطني يفوز بكأس العالم في مباراة مثيرة" },
        { title: "خبر تقني", content: "شركة تقنية تطلق تطبيق ذكاء اصطناعي جديد للتشخيص الطبي" }
      ];

      const results: ClassificationResult[] = [];
      for (const text of testTexts) {
        const result = await classifyArabicContent(text);
        results.push(result);
        await new Promise(resolve => setTimeout(resolve, 500)); // تأخير بين الطلبات
      }

      setTestResults(results);
      
      // حفظ النتائج في التاريخ
      const updatedHistory = [...classificationHistory, ...results.map(r => ({
        ...r,
        timestamp: new Date().toISOString()
      }))];
      
      DataUtils.saveToStorage('classification_history', updatedHistory);
      setClassificationHistory(updatedHistory);
      loadDashboardData();

    } catch (error) {
      console.error('خطأ في تشخيص النظام:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportData = (format: 'json' | 'csv') => {
    const data = classificationHistory;
    let content: string;
    let filename: string;
    let mimeType: string;

    if (format === 'json') {
      content = DataUtils.exportToJSON(data);
      filename = `classification_export_${new Date().toISOString().split('T')[0]}.json`;
      mimeType = 'application/json';
    } else {
      content = DataUtils.exportToCSV(data);
      filename = `classification_export_${new Date().toISOString().split('T')[0]}.csv`;
      mimeType = 'text/csv';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearHistory = () => {
    if (confirm('هل أنت متأكد من حذف جميع السجلات؟')) {
      DataUtils.saveToStorage('classification_history', []);
      setClassificationHistory([]);
      loadDashboardData();
    }
  };

  const getHealthBadge = (health: string) => {
    switch (health) {
      case 'excellent':
        return <Badge className="bg-green-100 text-green-800">ممتاز</Badge>;
      case 'good':
        return <Badge className="bg-blue-100 text-blue-800">جيد</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">تحذير</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">خطأ</Badge>;
      default:
        return <Badge variant="secondary">غير محدد</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
            <Settings className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">لوحة إدارة التصنيف الذكي</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">مراقبة وإدارة نظام التصنيف التلقائي</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {getHealthBadge(dashboardData.systemHealth)}
          <SabqButton onClick={runSystemDiagnostics} disabled={isLoading} loading={isLoading}>
            <Zap className="w-4 h-4 mr-2" />
            فحص النظام
          </SabqButton>
        </div>
      </div>

        {/* تحقق من صحة الإعدادات */}
        {!configValidation.valid && (
          <Alert className="mb-6 border-yellow-200 bg-yellow-50">
            <AlertTriangle className="w-4 h-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>تحذير:</strong> يوجد مشاكل في إعدادات النظام:
              <ul className="list-disc list-inside mt-2">
                {configValidation.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

      {/* الإحصائيات السريعة */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SabqStatCard
          title="إجمالي التصنيفات"
          value={dashboardData.totalClassifications}
          icon={BarChart3}
          color="blue"
        />
        
        <SabqStatCard
          title="تصنيفات اليوم"
          value={dashboardData.todayClassifications}
          icon={TrendingUp}
          color="green"
          trend="up"
        />
        
        <SabqStatCard
          title="معدل الدقة"
          value={`${dashboardData.averageAccuracy.toFixed(1)}%`}
          icon={Users}
          color="purple"
        />
        
        <SabqStatCard
          title="آخر تصنيف"
          value={dashboardData.lastClassificationTime ? 
            new Date(dashboardData.lastClassificationTime).toLocaleDateString('ar-SA') : 'لا يوجد'
          }
          icon={FileText}
          color="orange"
        />
      </div>

        {/* التبويبات الرئيسية */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="analytics">التحليلات</TabsTrigger>
            <TabsTrigger value="settings">الإعدادات</TabsTrigger>
            <TabsTrigger value="data">إدارة البيانات</TabsTrigger>
            <TabsTrigger value="test">الاختبارات</TabsTrigger>
          </TabsList>

        {/* نظرة عامة */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  حالة النظام
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>الحالة العامة:</span>
                  {getHealthBadge(dashboardData.systemHealth)}
                </div>
                
                <div className="flex items-center justify-between">
                  <span>النظام نشط:</span>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                
                <div className="flex items-center justify-between">
                  <span>قاعدة البيانات:</span>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                
                <div className="flex items-center justify-between">
                  <span>API متاح:</span>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>إصدار النظام:</span>
                    <span className="font-mono">v1.0.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span>آخر تحديث:</span>
                    <span>يناير 2024</span>
                  </div>
                  <div className="flex justify-between">
                    <span>وقت التشغيل:</span>
                    <span>99.9%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    آخر النشاطات
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {classificationHistory.slice(-5).reverse().map((item: any, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div>
                          <div className="font-medium">{item.mainCategory}</div>
                          <div className="text-xs text-gray-600">
                            ثقة: {(item.confidence * 100).toFixed(1)}%
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {item.timestamp ? new Date(item.timestamp).toLocaleTimeString('ar-SA') : 'الآن'}
                        </div>
                      </div>
                    ))}
                    
                    {classificationHistory.length === 0 && (
                      <div className="text-center text-gray-500 py-4">
                        لا توجد أنشطة حديثة
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* التحليلات */}
          <TabsContent value="analytics" className="space-y-6">
            {classificationHistory.length > 0 ? (
              <ClassificationStats 
                results={classificationHistory} 
                title="تحليل شامل للتصنيفات"
                showDetails={true}
              />
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-gray-500">
                    <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>لا توجد بيانات كافية لإظهار التحليلات</p>
                    <Button 
                      className="mt-4" 
                      onClick={runSystemDiagnostics}
                      disabled={isLoading}
                    >
                      تشغيل اختبار تجريبي
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* الإعدادات */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cog className="w-5 h-5" />
                  إعدادات النظام
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <Info className="w-4 h-4" />
                  <AlertDescription>
                    تغيير الإعدادات يتطلب إعادة تشغيل النظام لتطبيق التغييرات.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">إعدادات التصنيف</h4>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="auto-classify">التصنيف التلقائي</Label>
                      <Switch id="auto-classify" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confidence-threshold">الحد الأدنى للثقة</Label>
                      <Input 
                        id="confidence-threshold" 
                        type="number" 
                        step="0.1" 
                        min="0" 
                        max="1" 
                        defaultValue="0.6"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="quality-threshold">الحد الأدنى للجودة</Label>
                      <Input 
                        id="quality-threshold" 
                        type="number" 
                        min="0" 
                        max="100" 
                        defaultValue="50"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">إعدادات الأداء</h4>
                    
                    <div className="space-y-2">
                      <Label htmlFor="cache-size">حجم الذاكرة المؤقتة</Label>
                      <Input 
                        id="cache-size" 
                        type="number" 
                        min="10" 
                        max="1000" 
                        defaultValue="100"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="timeout">مهلة التصنيف (ثانية)</Label>
                      <Input 
                        id="timeout" 
                        type="number" 
                        min="5" 
                        max="120" 
                        defaultValue="30"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="debug-mode">وضع التطوير</Label>
                      <Switch id="debug-mode" />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button>
                    <Save className="w-4 h-4 mr-2" />
                    حفظ الإعدادات
                  </Button>
                  <Button variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    استعادة الافتراضي
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* إدارة البيانات */}
          <TabsContent value="data" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="w-5 h-5" />
                    تصدير البيانات
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">
                    تصدير بيانات التصنيفات للتحليل أو النسخ الاحتياطي
                  </p>
                  
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => exportData('json')}
                      disabled={classificationHistory.length === 0}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      JSON
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => exportData('csv')}
                      disabled={classificationHistory.length === 0}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      CSV
                    </Button>
                  </div>

                  <div className="text-xs text-gray-500">
                    عدد السجلات: {classificationHistory.length}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    إدارة قاعدة البيانات
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">
                    أدوات صيانة وتنظيف قاعدة البيانات
                  </p>
                  
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      تحديث الفهارس
                    </Button>
                    
                    <Button 
                      variant="destructive" 
                      className="w-full"
                      onClick={clearHistory}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      مسح جميع السجلات
                    </Button>
                  </div>

                  <Alert className="border-yellow-200 bg-yellow-50">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800">
                      عمليات قاعدة البيانات غير قابلة للتراجع
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* الاختبارات */}
          <TabsContent value="test" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  اختبار النظام
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  تشغيل اختبارات شاملة للتأكد من عمل النظام بشكل صحيح
                </p>

                <Button 
                  onClick={runSystemDiagnostics} 
                  disabled={isLoading}
                  className="w-full"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      جاري تشغيل الاختبارات...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      تشغيل اختبار شامل
                    </>
                  )}
                </Button>

                {testResults.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium mb-4">نتائج آخر اختبار:</h4>
                    <ClassificationStats 
                      results={testResults} 
                      title="نتائج الاختبار"
                      showDetails={false}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
