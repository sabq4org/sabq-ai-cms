/**
 * 📊 مكون عرض إحصائيات التصنيف المتقدمة
 */

"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Target, 
  Award,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { ClassificationResult } from '@/lib/ai/ArabicContentClassifier';
import { AnalyticsUtils, UIUtils } from '@/lib/ai/classifier-utils';

interface ClassificationStatsProps {
  results: ClassificationResult[];
  showDetails?: boolean;
  title?: string;
}

export default function ClassificationStats({ 
  results, 
  showDetails = true,
  title = "إحصائيات التصنيف" 
}: ClassificationStatsProps) {
  if (results.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">
            <PieChart className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>لا توجد نتائج للعرض</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const report = AnalyticsUtils.generateReport(results);
  const distribution = Array.from(report.categoryDistribution.entries())
    .sort((a, b) => b[1] - a[1]);

  const getPerformanceColor = (grade: string) => {
    switch (grade) {
      case 'ممتاز': return 'text-green-600 bg-green-100';
      case 'جيد جداً': return 'text-blue-600 bg-blue-100';
      case 'جيد': return 'text-yellow-600 bg-yellow-100';
      case 'مقبول': return 'text-orange-600 bg-orange-100';
      default: return 'text-red-600 bg-red-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* العنوان */}
      <div className="flex items-center gap-3">
        <BarChart3 className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold">{title}</h2>
      </div>

      {/* الإحصائيات العامة */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{report.totalArticles}</div>
              <div className="text-sm text-gray-600">إجمالي المقالات</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {(report.averageConfidence * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">متوسط الثقة</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {report.averageQuality.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">متوسط الجودة</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Badge className={`text-lg px-3 py-1 ${getPerformanceColor(report.performanceGrade)}`}>
                <Award className="w-4 h-4 mr-1" />
                {report.performanceGrade}
              </Badge>
              <div className="text-sm text-gray-600 mt-1">التقييم العام</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* توزيع التصنيفات */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            توزيع التصنيفات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {distribution.map(([category, count], index) => {
              const percentage = (count / report.totalArticles) * 100;
              const color = UIUtils.getCategoryColor(category);
              
              return (
                <div key={category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: color }}
                      />
                      <span className="font-medium">{category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">
                        {count} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {showDetails && (
        <>
          {/* مؤشرات الأداء */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                مؤشرات الأداء
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>مستوى الثقة العام</span>
                    <span className="font-medium">
                      {UIUtils.getConfidenceLabel(report.averageConfidence)}
                    </span>
                  </div>
                  <Progress value={report.averageConfidence * 100} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>مستوى الجودة العام</span>
                    <span className="font-medium">
                      {UIUtils.getQualityLabel(report.averageQuality)}
                    </span>
                  </div>
                  <Progress value={report.averageQuality} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* الاقتراحات الشائعة */}
          {report.topSuggestions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  أكثر اقتراحات التحسين شيوعاً
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {report.topSuggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">
                        {index + 1}
                      </div>
                      <p className="text-sm text-gray-700 text-right flex-1" dir="rtl">
                        {suggestion}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* تفاصيل النتائج */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                تفاصيل النتائج
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* النتائج عالية الجودة */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {results.filter(r => r.confidence >= 0.8).length}
                    </div>
                    <div className="text-sm text-gray-600">ثقة عالية (&gt;80%)</div>
                  </div>
                  
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {results.filter(r => r.qualityScore >= 80).length}
                    </div>
                    <div className="text-sm text-gray-600">جودة عالية (&gt;80)</div>
                  </div>
                  
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {results.filter(r => r.regionRelevance >= 0.7).length}
                    </div>
                    <div className="text-sm text-gray-600">صلة إقليمية قوية (&gt;70%)</div>
                  </div>
                </div>

                <Separator />

                {/* النتائج التي تحتاج تحسين */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    النتائج التي تحتاج تحسين
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">
                        {results.filter(r => r.confidence < 0.6).length}
                      </div>
                      <div className="text-sm text-gray-600">ثقة منخفضة (&lt;60%)</div>
                    </div>
                    
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        {results.filter(r => r.qualityScore < 60).length}
                      </div>
                      <div className="text-sm text-gray-600">جودة ضعيفة (&lt;60)</div>
                    </div>
                    
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-600">
                        {results.filter(r => r.suggestions.length > 3).length}
                      </div>
                      <div className="text-sm text-gray-600">اقتراحات كثيرة (&gt;3)</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* تفاصيل زمنية */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                تفاصيل التحليل
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">ملخص سريع</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>التصنيف الأكثر شيوعاً:</span>
                      <Badge variant="outline">{distribution[0]?.[0] || 'غير محدد'}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>معدل نجاح التصنيف:</span>
                      <span className="font-medium">
                        {((results.filter(r => r.confidence >= 0.6).length / results.length) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>متوسط عدد الاقتراحات:</span>
                      <span className="font-medium">
                        {(results.reduce((sum, r) => sum + r.suggestions.length, 0) / results.length).toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">التوصيات</h4>
                  <div className="space-y-2 text-sm">
                    {report.averageConfidence < 0.7 && (
                      <div className="p-2 bg-yellow-50 rounded text-yellow-800">
                        • تحسين دقة التصنيف مطلوب
                      </div>
                    )}
                    {report.averageQuality < 70 && (
                      <div className="p-2 bg-red-50 rounded text-red-800">
                        • العمل على تحسين جودة المحتوى
                      </div>
                    )}
                    {results.filter(r => r.suggestions.length > 2).length > results.length * 0.5 && (
                      <div className="p-2 bg-blue-50 rounded text-blue-800">
                        • تطبيق الاقتراحات المقترحة
                      </div>
                    )}
                    {distribution.length > 5 && (
                      <div className="p-2 bg-green-50 rounded text-green-800">
                        • تنوع جيد في التصنيفات
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
