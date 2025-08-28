/**
 * مكون اختبار شامل للتصنيف الذكي
 */

"use client";

import React, { useState } from 'react';
import { classifyArabicContent, type ClassificationResult } from '@/lib/ai/ArabicContentClassifier';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  Sparkles, 
  CheckCircle, 
  AlertTriangle, 
  BarChart3,
  Globe,
  Lightbulb,
  Target,
  Zap,
  Loader
} from 'lucide-react';

interface TestCase {
  id: string;
  title: string;
  content: string;
  expectedCategory?: string;
  description: string;
}

const TEST_CASES: TestCase[] = [
  {
    id: '1',
    title: 'خبر سياسي - قرار حكومي',
    content: 'أعلن رئيس مجلس الوزراء اليوم عن حزمة إصلاحات اقتصادية جديدة تهدف إلى تعزيز النمو الاقتصادي وخلق فرص عمل جديدة للشباب. وتشمل الإصلاحات تبسيط الإجراءات الحكومية وتقليل البيروقراطية.',
    expectedCategory: 'سياسي',
    description: 'خبر يتعلق بقرار حكومي مع تأثير اقتصادي'
  },
  {
    id: '2',
    title: 'خبر رياضي - كرة القدم',
    content: 'حقق الفريق الوطني لكرة القدم فوزاً مستحقاً بنتيجة 2-1 في المباراة التي جمعته مع منتخب الأرجنتين على ملعب الرياض أمس. وسجل هدفي المنتخب اللاعبان سالم الدوسري ومحمد كنو.',
    expectedCategory: 'رياضي',
    description: 'نتيجة مباراة كرة قدم دولية'
  },
  {
    id: '3',
    title: 'خبر تقني - ذكاء اصطناعي',
    content: 'أطلقت شركة تقنية سعودية ناشئة تطبيقاً جديداً يعتمد على الذكاء الاصطناعي لتحليل البيانات الطبية ومساعدة الأطباء في التشخيص المبكر للأمراض. التطبيق يستخدم خوارزميات متقدمة لفحص الصور الطبية.',
    expectedCategory: 'تقني',
    description: 'إطلاق تطبيق ذكاء اصطناعي في المجال الطبي'
  },
  {
    id: '4',
    title: 'خبر اقتصادي - أسواق مالية',
    content: 'شهدت الأسواق المالية السعودية ارتفاعاً ملحوظاً اليوم بنسبة 2.5% مدفوعة بصعود أسهم البنوك وشركات البتروكيماويات. وأغلق المؤشر العام للسوق المالية "تاسي" عند مستوى 11,450 نقطة.',
    expectedCategory: 'اقتصادي',
    description: 'تحديث حول أداء السوق المالية'
  },
  {
    id: '5',
    title: 'خبر ثقافي - مهرجان',
    content: 'انطلقت فعاليات مهرجان الجنادرية للتراث والثقافة في نسخته الجديدة بحضور آلاف الزوار من مختلف أنحاء المملكة والعالم. ويتضمن المهرجان عروضاً فولكلورية ومعارض للحرف التراثية والأطباق الشعبية.',
    expectedCategory: 'ثقافي',
    description: 'حدث ثقافي وتراثي كبير'
  }
];

export default function ClassifierTestSuite() {
  const [customText, setCustomText] = useState('');
  const [testResults, setTestResults] = useState<Map<string, ClassificationResult>>(new Map());
  const [customResult, setCustomResult] = useState<ClassificationResult | null>(null);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [isClassifyingCustom, setIsClassifyingCustom] = useState(false);
  const [currentTestIndex, setCurrentTestIndex] = useState(0);

  const runSingleTest = async (testCase: TestCase) => {
    try {
      const result = await classifyArabicContent({
        title: testCase.title,
        content: testCase.content
      });
      
      setTestResults(prev => new Map(prev.set(testCase.id, result)));
      return result;
    } catch (error) {
      console.error(`خطأ في اختبار ${testCase.id}:`, error);
      return null;
    }
  };

  const runAllTests = async () => {
    setIsRunningTests(true);
    setTestResults(new Map());
    setCurrentTestIndex(0);

    for (let i = 0; i < TEST_CASES.length; i++) {
      setCurrentTestIndex(i);
      await runSingleTest(TEST_CASES[i]);
      // تأخير قصير بين الاختبارات
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsRunningTests(false);
    setCurrentTestIndex(0);
  };

  const classifyCustomText = async () => {
    if (!customText.trim()) return;

    setIsClassifyingCustom(true);
    try {
      const result = await classifyArabicContent({
        title: "نص مخصص",
        content: customText
      });
      setCustomResult(result);
    } catch (error) {
      console.error('خطأ في التصنيف المخصص:', error);
    } finally {
      setIsClassifyingCustom(false);
    }
  };

  const getResultBadgeColor = (expected?: string, actual?: string) => {
    if (!expected || !actual) return 'secondary';
    return expected === actual ? 'default' : 'destructive';
  };

  const getQualityColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const completedTests = testResults.size;
  const successfulTests = Array.from(testResults.values()).filter(result => result).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="w-12 h-12 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">مختبر اختبار التصنيف الذكي</h1>
            <Zap className="w-12 h-12 text-purple-600" />
          </div>
          <p className="text-xl text-gray-600">اختبار شامل لنظام تصنيف المحتوى العربي</p>
        </div>

        {/* Control Panel */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              لوحة التحكم
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{TEST_CASES.length}</div>
                <div className="text-sm text-gray-600">حالات الاختبار</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{completedTests}</div>
                <div className="text-sm text-gray-600">اختبارات مكتملة</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {completedTests > 0 ? Math.round((successfulTests / completedTests) * 100) : 0}%
                </div>
                <div className="text-sm text-gray-600">معدل النجاح</div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button 
                onClick={runAllTests}
                disabled={isRunningTests}
                className="flex-1"
                size="lg"
              >
                {isRunningTests ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    تشغيل الاختبارات... ({currentTestIndex + 1}/{TEST_CASES.length})
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    تشغيل جميع الاختبارات
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => {
                  setTestResults(new Map());
                  setCustomResult(null);
                }}
              >
                مسح النتائج
              </Button>
            </div>

            {isRunningTests && (
              <Progress 
                value={(currentTestIndex / TEST_CASES.length) * 100} 
                className="mt-4"
              />
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Test Cases */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              حالات الاختبار
            </h2>

            {TEST_CASES.map((testCase, index) => {
              const result = testResults.get(testCase.id);
              const isCorrect = result && result.mainCategory === testCase.expectedCategory;

              return (
                <Card key={testCase.id} className={`transition-all ${
                  isRunningTests && currentTestIndex === index ? 'ring-2 ring-blue-500' : ''
                }`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{testCase.title}</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">{testCase.description}</p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        {testCase.expectedCategory && (
                          <Badge variant="outline">
                            متوقع: {testCase.expectedCategory}
                          </Badge>
                        )}
                        {result && (
                          <Badge variant={getResultBadgeColor(testCase.expectedCategory, result.mainCategory)}>
                            {result.mainCategory}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700 mb-4 text-right" dir="rtl">
                      {testCase.content}
                    </p>

                    {result && (
                      <div className="space-y-3 border-t pt-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">الثقة:</span>
                            <span className="mr-2">{(result.confidence * 100).toFixed(1)}%</span>
                          </div>
                          <div>
                            <span className="font-medium">الجودة:</span>
                            <span className={`mr-2 font-bold ${getQualityColor(result.qualityScore)}`}>
                              {result.qualityScore}/100
                            </span>
                          </div>
                        </div>

                        {result.subCategory && (
                          <div className="text-sm">
                            <span className="font-medium">التصنيف الفرعي:</span>
                            <Badge variant="secondary" className="mr-2">{result.subCategory}</Badge>
                          </div>
                        )}

                        {isCorrect !== undefined && (
                          <Alert className={isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                            <AlertTriangle className={`w-4 h-4 ${isCorrect ? 'text-green-600' : 'text-red-600'}`} />
                            <AlertDescription className={isCorrect ? 'text-green-800' : 'text-red-800'}>
                              {isCorrect ? 'النتيجة صحيحة ✅' : 'النتيجة غير متطابقة ❌'}
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    )}

                    <div className="flex justify-end mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => runSingleTest(testCase)}
                        disabled={isRunningTests}
                      >
                        اختبار منفرد
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Custom Text Testing */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Lightbulb className="w-6 h-6 text-yellow-600" />
              اختبار نص مخصص
            </h2>

            <Card>
              <CardHeader>
                <CardTitle>إدخال نص للتصنيف</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="اكتب النص العربي هنا..."
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  className="min-h-[150px] text-right"
                  dir="rtl"
                />
                
                <Button 
                  onClick={classifyCustomText}
                  disabled={!customText.trim() || isClassifyingCustom}
                  className="w-full"
                >
                  {isClassifyingCustom ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      جاري التصنيف...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      تصنيف النص
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {customResult && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    نتائج التصنيف
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="font-bold text-blue-600">{customResult.mainCategory}</div>
                      <div className="text-xs text-gray-600">التصنيف الرئيسي</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="font-bold text-purple-600">{customResult.subCategory || 'غير محدد'}</div>
                      <div className="text-xs text-gray-600">التصنيف الفرعي</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>مستوى الثقة</span>
                        <span>{(customResult.confidence * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={customResult.confidence * 100} />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>نقاط الجودة</span>
                        <span className={getQualityColor(customResult.qualityScore)}>
                          {customResult.qualityScore}/100
                        </span>
                      </div>
                      <Progress value={customResult.qualityScore} />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>الصلة الإقليمية</span>
                        <span>{(customResult.regionRelevance * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={customResult.regionRelevance * 100} />
                    </div>
                  </div>

                  {customResult.suggestions && customResult.suggestions.length > 0 && (
                    <div>
                      <span className="font-medium text-sm mb-2 block">اقتراحات التحسين:</span>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                        {customResult.suggestions.map((suggestion, index) => (
                          <li key={index} className="text-right" dir="rtl">{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Test Summary */}
            {completedTests > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    ملخص النتائج
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span>إجمالي الاختبارات:</span>
                      <span className="font-bold">{TEST_CASES.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>اختبارات مكتملة:</span>
                      <span className="font-bold text-blue-600">{completedTests}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>معدل النجاح:</span>
                      <span className="font-bold text-green-600">
                        {completedTests > 0 ? Math.round((successfulTests / completedTests) * 100) : 0}%
                      </span>
                    </div>
                    
                    {completedTests === TEST_CASES.length && (
                      <Alert className="mt-4 border-green-200 bg-green-50">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                          تم إكمال جميع الاختبارات بنجاح! 🎉
                        </AlertDescription>
                      </Alert>
                    )}
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
