"use client";

import React, { useState } from 'react';
import { classifyArabicContent } from '@/lib/ai/ArabicContentClassifier';
import ArticleClassifierWidget from '@/components/ai/ArticleClassifierWidget';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Sparkles, Brain, Target } from 'lucide-react';

export default function TestClassifierPage() {
  const [testContent, setTestContent] = useState('');
  const [classificationResult, setClassificationResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // نصوص تجريبية
  const sampleTexts = [
    {
      title: "خبر سياسي",
      content: "اجتمع رئيس الوزراء اليوم مع وزراء الحكومة لمناقشة السياسات الاقتصادية الجديدة والإصلاحات المقترحة للنهوض بالاقتصاد الوطني"
    },
    {
      title: "خبر رياضي",
      content: "فاز الفريق الوطني لكرة القدم في مباراة قوية أمس بنتيجة 3-1 وتأهل إلى نهائيات كأس العالم بعد أداء متميز من اللاعبين"
    },
    {
      title: "خبر اقتصادي",
      content: "ارتفعت أسعار النفط اليوم بنسبة 5% في الأسواق العالمية بسبب التوترات الجيوسياسية وزيادة الطلب على الطاقة في فصل الشتاء"
    },
    {
      title: "خبر تقني",
      content: "أطلقت شركة التكنولوجيا الرائدة تطبيقاً جديداً للذكاء الاصطناعي يساعد في تحليل البيانات الضخمة وتقديم رؤى تحليلية متقدمة للشركات"
    }
  ];

  const handleClassify = async () => {
    if (!testContent.trim()) return;

    setIsLoading(true);
    try {
      const result = await classifyArabicContent({
        title: "نص تجريبي",
        content: testContent
      });
      setClassificationResult(result);
    } catch (error) {
      console.error('خطأ في التصنيف:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSampleText = (sample: any) => {
    setTestContent(sample.content);
    setClassificationResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="w-10 h-10 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">مختبر التصنيف الذكي</h1>
            <Sparkles className="w-10 h-10 text-purple-600" />
          </div>
          <p className="text-xl text-gray-600">اختبر تصنيف المحتوى العربي باستخدام الذكاء الاصطناعي</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  إدخال النص للتصنيف
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="اكتب أو الصق النص العربي هنا للتصنيف..."
                  value={testContent}
                  onChange={(e) => setTestContent(e.target.value)}
                  className="min-h-[200px] text-right"
                  dir="rtl"
                />
                
                <Button 
                  onClick={handleClassify}
                  disabled={!testContent.trim() || isLoading}
                  className="w-full"
                  size="lg"
                >
                  {isLoading ? 'جاري التصنيف...' : 'تصنيف المحتوى'}
                </Button>
              </CardContent>
            </Card>

            {/* Sample Texts */}
            <Card>
              <CardHeader>
                <CardTitle>نصوص تجريبية</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3">
                  {sampleTexts.map((sample, index) => (
                    <div key={index} className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">{sample.title}</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => loadSampleText(sample)}
                        >
                          تجربة
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600 text-right" dir="rtl">
                        {sample.content.substring(0, 100)}...
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {classificationResult && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    نتائج التصنيف
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ArticleClassifierWidget
                    article={{
                      title: "نص تجريبي",
                      content: testContent
                    }}
                    onClassificationComplete={(result) => setClassificationResult(result)}
                    showDetails={true}
                  />
                </CardContent>
              </Card>
            )}

            {/* تفاصيل التصنيف */}
            {classificationResult && (
              <Card>
                <CardHeader>
                  <CardTitle>تفاصيل التحليل</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">التصنيف الرئيسي:</span>
                      <Badge className="mr-2">{classificationResult.mainCategory}</Badge>
                    </div>
                    <div>
                      <span className="font-medium">التصنيف الفرعي:</span>
                      <Badge variant="outline" className="mr-2">{classificationResult.subCategory}</Badge>
                    </div>
                    <div>
                      <span className="font-medium">نقاط الجودة:</span>
                      <span className="mr-2 font-bold text-green-600">
                        {classificationResult.qualityScore}/100
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">الصلة الإقليمية:</span>
                      <span className="mr-2 font-bold text-blue-600">
                        {(classificationResult.regionRelevance * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <Separator />

                  {classificationResult.keywords && classificationResult.keywords.length > 0 && (
                    <div>
                      <span className="font-medium mb-2 block">الكلمات المفتاحية:</span>
                      <div className="flex flex-wrap gap-2">
                        {classificationResult.keywords.map((keyword: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {classificationResult.suggestions && classificationResult.suggestions.length > 0 && (
                    <div>
                      <span className="font-medium mb-2 block">اقتراحات التحسين:</span>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                        {classificationResult.suggestions.map((suggestion: string, index: number) => (
                          <li key={index} className="text-right" dir="rtl">{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {!classificationResult && (
              <Card className="border-dashed">
                <CardContent className="pt-6">
                  <div className="text-center text-gray-500">
                    <Brain className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>قم بإدخال نص وانقر على "تصنيف المحتوى" لرؤية النتائج</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
