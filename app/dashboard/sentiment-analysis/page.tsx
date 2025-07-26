'use client';

/**
 * صفحة لوحة التحكم - نظام التحليل العاطفي للنصوص العربية
 * Sentiment Analysis Dashboard Page
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Heart, 
  Frown, 
  Smile, 
  Meh, 
  AlertTriangle, 
  TrendingUp,
  BarChart3,
  Brain,
  MessageSquare,
  FileText,
  Users,
  Activity,
  Target,
  Zap
} from 'lucide-react';

interface SentimentResult {
  id: string;
  text: string;
  sentiment: {
    label: string;
    score: number;
    confidence: number;
    polarity: 'positive' | 'negative' | 'neutral';
  };
  emotions: {
    primary_emotion: string;
    emotions: { [key: string]: number };
  };
  keywords: Array<{
    word: string;
    sentiment_impact: number;
    importance: number;
  }>;
  processing_time: number;
}

interface SentimentStatistics {
  total_analyses: number;
  sentiment_distribution: { [key: string]: number };
  emotion_distribution: { [key: string]: number };
  average_confidence: number;
  processing_performance: {
    average_processing_time: number;
    throughput: number;
  };
}

export default function SentimentAnalysisPage() {
  const [analysisText, setAnalysisText] = useState('');
  const [analysisResult, setAnalysisResult] = useState<SentimentResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [statistics, setStatistics] = useState<SentimentStatistics | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // جلب الإحصائيات عند تحميل الصفحة
  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    setIsLoadingStats(true);
    try {
      const response = await fetch('/api/admin/sentiment-analysis?action=statistics');
      const data = await response.json();
      
      if (data.success) {
        setStatistics(data.data);
      }
    } catch (error) {
      console.error('خطأ في جلب الإحصائيات:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleAnalyze = async () => {
    if (!analysisText.trim()) return;

    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/admin/sentiment-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: analysisText,
          options: {
            include_emotions: true,
            include_keywords: true,
            detailed_analysis: true
          }
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setAnalysisResult(data.data);
        // إعادة تحميل الإحصائيات
        loadStatistics();
      } else {
        alert('خطأ في التحليل: ' + data.error);
      }
    } catch (error) {
      console.error('خطأ في التحليل:', error);
      alert('حدث خطأ في التحليل');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSentimentIcon = (polarity: string) => {
    switch (polarity) {
      case 'positive': return <Smile className="h-5 w-5 text-green-500" />;
      case 'negative': return <Frown className="h-5 w-5 text-red-500" />;
      default: return <Meh className="h-5 w-5 text-gray-500" />;
    }
  };

  const getSentimentColor = (polarity: string) => {
    switch (polarity) {
      case 'positive': return 'bg-green-500';
      case 'negative': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getEmotionIcon = (emotion: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      joy: <Smile className="h-4 w-4 text-yellow-500" />,
      sadness: <Frown className="h-4 w-4 text-blue-500" />,
      anger: <AlertTriangle className="h-4 w-4 text-red-500" />,
      fear: <AlertTriangle className="h-4 w-4 text-purple-500" />,
      trust: <Heart className="h-4 w-4 text-green-500" />,
      love: <Heart className="h-4 w-4 text-pink-500" />,
    };
    return icons[emotion] || <Brain className="h-4 w-4 text-gray-500" />;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* الهيدر */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            نظام التحليل العاطفي للنصوص العربية
          </h1>
          <p className="text-gray-600 mt-2">
            تحليل ذكي للمشاعر والعواطف في النصوص العربية باستخدام الذكاء الاصطناعي
          </p>
        </div>
        <div className="flex items-center space-x-2 space-x-reverse">
          <Brain className="h-8 w-8 text-blue-600" />
          <Badge variant="secondary">نشط</Badge>
        </div>
      </div>

      <Tabs defaultValue="analyze" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="analyze" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            تحليل النص
          </TabsTrigger>
          <TabsTrigger value="statistics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            الإحصائيات
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            تحليل المحتوى
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            الإعدادات
          </TabsTrigger>
        </TabsList>

        {/* تبويب تحليل النص */}
        <TabsContent value="analyze" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* منطقة الإدخال */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  إدخال النص للتحليل
                </CardTitle>
                <CardDescription>
                  أدخل النص العربي الذي تريد تحليل مشاعره
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="أدخل النص العربي هنا..."
                  value={analysisText}
                  onChange={(e) => setAnalysisText(e.target.value)}
                  className="min-h-32"
                  dir="rtl"
                />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {analysisText.length} / 5000 حرف
                  </span>
                  <Button 
                    onClick={handleAnalyze}
                    disabled={!analysisText.trim() || isAnalyzing}
                    className="flex items-center gap-2"
                  >
                    <Brain className="h-4 w-4" />
                    {isAnalyzing ? 'جاري التحليل...' : 'تحليل المشاعر'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* نتائج التحليل */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  نتائج التحليل
                </CardTitle>
                <CardDescription>
                  النتائج التفصيلية لتحليل المشاعر
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!analysisResult ? (
                  <div className="text-center py-8">
                    <Brain className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">أدخل نصاً لبدء التحليل</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* المشاعر الأساسية */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {getSentimentIcon(analysisResult.sentiment.polarity)}
                        <div>
                          <p className="font-medium">
                            {analysisResult.sentiment.label}
                          </p>
                          <p className="text-sm text-gray-600">
                            نقاط: {analysisResult.sentiment.score.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">الثقة</p>
                        <p className="font-medium">
                          {(analysisResult.sentiment.confidence * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    {/* شريط المشاعر */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium">مقياس المشاعر</p>
                      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${getSentimentColor(analysisResult.sentiment.polarity)} transition-all duration-500`}
                          style={{ 
                            width: `${Math.abs(analysisResult.sentiment.score) * 100}%`,
                            marginLeft: analysisResult.sentiment.score < 0 ? 
                              `${50 + (analysisResult.sentiment.score * 50)}%` : '50%'
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>سلبي جداً</span>
                        <span>محايد</span>
                        <span>إيجابي جداً</span>
                      </div>
                    </div>

                    {/* المشاعر التفصيلية */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium">المشاعر التفصيلية</p>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(analysisResult.emotions.emotions)
                          .filter(([, value]) => value > 0.1)
                          .slice(0, 6)
                          .map(([emotion, value]) => (
                            <div 
                              key={emotion}
                              className="flex items-center gap-2 p-2 bg-gray-50 rounded"
                            >
                              {getEmotionIcon(emotion)}
                              <div className="flex-1">
                                <p className="text-xs font-medium capitalize">
                                  {emotion}
                                </p>
                                <div className="h-1 bg-gray-200 rounded">
                                  <div 
                                    className="h-1 bg-blue-500 rounded"
                                    style={{ width: `${value * 100}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          ))
                        }
                      </div>
                    </div>

                    {/* الكلمات المفتاحية */}
                    {analysisResult.keywords.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">الكلمات المؤثرة</p>
                        <div className="flex flex-wrap gap-2">
                          {analysisResult.keywords.slice(0, 8).map((keyword, index) => (
                            <Badge 
                              key={index}
                              variant={keyword.sentiment_impact > 0 ? "default" : "destructive"}
                              className="text-xs"
                            >
                              {keyword.word}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* معلومات التحليل */}
                    <div className="pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">وقت المعالجة</p>
                          <p className="font-medium">
                            {analysisResult.processing_time}ms
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">معرف التحليل</p>
                          <p className="font-medium text-xs">
                            {analysisResult.id.slice(-8)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* تبويب الإحصائيات */}
        <TabsContent value="statistics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* بطاقات الإحصائيات السريعة */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">إجمالي التحليلات</p>
                    <p className="text-2xl font-bold">
                      {statistics?.total_analyses || 0}
                    </p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">متوسط الثقة</p>
                    <p className="text-2xl font-bold">
                      {statistics ? (statistics.average_confidence * 100).toFixed(1) : 0}%
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">معدل المعالجة</p>
                    <p className="text-2xl font-bold">
                      {statistics?.processing_performance.throughput.toFixed(1) || 0}
                    </p>
                    <p className="text-xs text-gray-500">تحليل/ثانية</p>
                  </div>
                  <Zap className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">متوسط وقت المعالجة</p>
                    <p className="text-2xl font-bold">
                      {statistics?.processing_performance.average_processing_time.toFixed(0) || 0}
                    </p>
                    <p className="text-xs text-gray-500">ميلي ثانية</p>
                  </div>
                  <Activity className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* توزيع المشاعر */}
          {statistics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>توزيع المشاعر</CardTitle>
                  <CardDescription>
                    نسبة توزيع المشاعر في التحليلات
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(statistics.sentiment_distribution).map(([sentiment, count]) => (
                      <div key={sentiment} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getSentimentIcon(sentiment.includes('positive') ? 'positive' : 
                                          sentiment.includes('negative') ? 'negative' : 'neutral')}
                          <span className="capitalize">{sentiment}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-gray-200 rounded">
                            <div 
                              className="h-2 bg-blue-500 rounded"
                              style={{ 
                                width: `${(count / statistics.total_analyses) * 100}%` 
                              }}
                            />
                          </div>
                          <span className="text-sm text-gray-600">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>أهم المشاعر المكتشفة</CardTitle>
                  <CardDescription>
                    المشاعر الأكثر تكراراً في التحليلات
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(statistics.emotion_distribution)
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 6)
                      .map(([emotion, value]) => (
                        <div key={emotion} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getEmotionIcon(emotion)}
                            <span className="capitalize">{emotion}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-gray-200 rounded">
                              <div 
                                className="h-2 bg-green-500 rounded"
                                style={{ 
                                  width: `${Math.min(100, (value * 100))}%` 
                                }}
                              />
                            </div>
                            <span className="text-sm text-gray-600">
                              {(value * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* زر تحديث الإحصائيات */}
          <div className="flex justify-center">
            <Button 
              onClick={loadStatistics}
              disabled={isLoadingStats}
              variant="outline"
              className="flex items-center gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              {isLoadingStats ? 'جاري التحديث...' : 'تحديث الإحصائيات'}
            </Button>
          </div>
        </TabsContent>

        {/* تبويب تحليل المحتوى */}
        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                تحليل مشاعر المحتوى
              </CardTitle>
              <CardDescription>
                تحليل المشاعر للمقالات والتعليقات والمحتوى المختلف
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">
                  سيتم إضافة ميزة تحليل المحتوى قريباً
                </p>
                <Button variant="outline" disabled>
                  قريباً
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* تبويب الإعدادات */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                إعدادات نظام التحليل العاطفي
              </CardTitle>
              <CardDescription>
                تكوين وضبط إعدادات نظام التحليل العاطفي
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">
                  سيتم إضافة إعدادات النظام قريباً
                </p>
                <Button variant="outline" disabled>
                  قريباً
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
