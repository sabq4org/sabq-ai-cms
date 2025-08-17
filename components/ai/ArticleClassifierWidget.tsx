/**
 * 🧠 ArticleClassifierWidget
 * واجهة التصنيف الذكي للمقالات
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  CheckCircle, 
  AlertTriangle, 
  Loader2, 
  Lightbulb,
  BarChart3,
  Globe,
  ArrowRight
} from 'lucide-react';
import { 
  classifyArabicContent, 
  ClassificationResult, 
  ArticleContent 
} from '@/lib/ai/ArabicContentClassifier';

interface ArticleClassifierWidgetProps {
  article: ArticleContent;
  onClassificationComplete?: (result: ClassificationResult) => void;
  autoClassify?: boolean;
  showDetails?: boolean;
}

export default function ArticleClassifierWidget({
  article,
  onClassificationComplete,
  autoClassify = false,
  showDetails = true
}: ArticleClassifierWidgetProps) {
  const [classificationResult, setClassificationResult] = useState<ClassificationResult | null>(null);
  const [isClassifying, setIsClassifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // التصنيف التلقائي عند تحميل المكون
  useEffect(() => {
    if (autoClassify && article.title && article.content) {
      handleClassify();
    }
  }, [autoClassify, article.title, article.content]);

  const handleClassify = async () => {
    if (!article.title || !article.content) {
      setError('يجب وجود عنوان ومحتوى للمقال للتصنيف');
      return;
    }

    setIsClassifying(true);
    setError(null);

    try {
      const result = await classifyArabicContent(article, false); // استخدام التصنيف البسيط للتجربة
      setClassificationResult(result);
      onClassificationComplete?.(result);
    } catch (err) {
      setError('حدث خطأ أثناء تصنيف المقال');
      console.error('Classification error:', err);
    } finally {
      setIsClassifying(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600 bg-green-50';
    if (confidence >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getQualityColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-blue-600" />
          التصنيف الذكي للمحتوى العربي
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* زر التصنيف */}
        <div className="flex gap-2">
          <Button 
            onClick={handleClassify}
            disabled={isClassifying || !article.title || !article.content}
            className="flex items-center gap-2"
          >
            {isClassifying ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Brain className="w-4 h-4" />
            )}
            {isClassifying ? 'جاري التصنيف...' : 'تصنيف ذكي'}
          </Button>
        </div>

        {/* رسالة الخطأ */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* نتائج التصنيف */}
        {classificationResult && (
          <div className="space-y-4">
            {/* التصنيف الأساسي */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">التصنيف الأساسي:</span>
              <Badge variant="default" className="text-sm">
                {classificationResult.mainCategory}
              </Badge>
              {classificationResult.subCategory && (
                <>
                  <ArrowRight className="w-3 h-3 text-gray-400" />
                  <Badge variant="outline" className="text-sm">
                    {classificationResult.subCategory}
                  </Badge>
                </>
              )}
            </div>

            {/* مؤشرات الجودة */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className={`text-2xl font-bold ${getConfidenceColor(classificationResult.confidence)}`}>
                  {classificationResult.confidence}%
                </div>
                <div className="text-xs text-gray-500">الثقة في التصنيف</div>
              </div>
              
              <div className="text-center">
                <div className={`text-2xl font-bold ${getQualityColor(classificationResult.qualityScore)}`}>
                  {classificationResult.qualityScore}%
                </div>
                <div className="text-xs text-gray-500">جودة المحتوى</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {classificationResult.regionRelevance}%
                </div>
                <div className="text-xs text-gray-500">الارتباط المحلي</div>
              </div>
            </div>

            {/* التفاصيل الإضافية */}
            {showDetails && (
              <div className="space-y-3">
                {/* مؤشرات بصرية */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>الثقة في التصنيف</span>
                    <span className={getConfidenceColor(classificationResult.confidence).split(' ')[0]}>
                      {classificationResult.confidence}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${classificationResult.confidence}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>جودة المحتوى</span>
                    <span className={getQualityColor(classificationResult.qualityScore)}>
                      {classificationResult.qualityScore}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${classificationResult.qualityScore}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>الارتباط المحلي</span>
                    <span className="text-blue-600">{classificationResult.regionRelevance}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${classificationResult.regionRelevance}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* الاقتراحات */}
            {classificationResult.suggestions.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium">اقتراحات التحسين:</span>
                </div>
                <ul className="space-y-1">
                  {classificationResult.suggestions.map((suggestion, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-yellow-600 mt-1">•</span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* معلومات إضافية */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 text-blue-800 text-sm">
                <CheckCircle className="w-4 h-4" />
                تم التصنيف بنجاح! يمكنك الآن استخدام هذه المعلومات لتحسين المقال.
              </div>
            </div>
          </div>
        )}

        {/* معلومات الاستخدام */}
        {!classificationResult && !isClassifying && (
          <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
            <p className="mb-2">📝 <strong>كيفية الاستخدام:</strong></p>
            <ul className="space-y-1 text-xs">
              <li>• يقوم النظام بتحليل عنوان ومحتوى المقال</li>
              <li>• يحدد التصنيف الأنسب (سياسي، اقتصادي، رياضي...)</li>
              <li>• يقيم جودة المحتوى والارتباط الجغرافي</li>
              <li>• يقدم اقتراحات لتحسين المقال</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
