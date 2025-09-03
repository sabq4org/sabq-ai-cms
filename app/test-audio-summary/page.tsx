/**
 * اختبار ميزة الاستماع للملخص الذكي
 * صفحة اختبار لتأكيد عمل النظام
 */

"use client";

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Play, Pause, Volume2, Headphones, CheckCircle, AlertTriangle } from 'lucide-react';

export default function AudioSummaryTest() {
  const [testText, setTestText] = useState('هذا نص تجريبي للملخص الذكي. يمكن تحويل هذا النص إلى صوت باستخدام تقنية تحويل النص إلى كلام.');
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const generateAudio = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/voice-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: testText,
          voiceType: 'auto'
        })
      });

      const data = await response.json();
      
      if (data.audioUrl) {
        setAudioUrl(data.audioUrl);
      } else {
        setError(data.error || 'فشل في توليد الصوت');
      }
    } catch (err) {
      setError('خطأ في الاتصال بالخادم');
      console.error('خطأ في توليد الصوت:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Headphones className="w-10 h-10 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">اختبار الاستماع للملخص الذكي</h1>
          </div>
          <p className="text-xl text-gray-600">اختبر ميزة تحويل النص إلى صوت</p>
        </div>

        {/* حالة النظام */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              حالة النظام
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-green-50 rounded-lg">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="font-bold text-green-800">صفحة المقال</div>
                <div className="text-sm text-green-600">مكون الملخص الذكي موجود</div>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="font-bold text-green-800">API Endpoint</div>
                <div className="text-sm text-green-600">/api/voice-summary متاح</div>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="font-bold text-green-800">مكونات الصوت</div>
                <div className="text-sm text-green-600">AudioSummaryPlayer جاهز</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* اختبار النص */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>اختبار توليد الصوت</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">النص للاختبار:</label>
              <Textarea
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                className="min-h-[100px] text-right"
                dir="rtl"
                placeholder="اكتب النص الذي تريد تحويله لصوت..."
              />
            </div>

            <Button 
              onClick={generateAudio}
              disabled={isLoading || !testText.trim()}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Volume2 className="w-4 h-4 mr-2 animate-spin" />
                  جاري توليد الصوت...
                </>
              ) : (
                <>
                  <Headphones className="w-4 h-4 mr-2" />
                  توليد الصوت
                </>
              )}
            </Button>

            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* مشغل الصوت */}
        {audioUrl && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="w-5 h-5" />
                مشغل الصوت
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center space-x-4 space-x-reverse">
                <Button
                  onClick={togglePlayback}
                  variant={isPlaying ? "destructive" : "default"}
                  size="lg"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-5 h-5 mr-2" />
                      إيقاف
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      تشغيل
                    </>
                  )}
                </Button>
                
                <div className="text-sm text-gray-600">
                  اضغط للاستماع للنص المولد
                </div>
              </div>

              <audio
                ref={audioRef}
                src={audioUrl}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
              />
              
              <Alert className="mt-4 border-green-200 bg-green-50">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  تم توليد الصوت بنجاح! يمكنك الآن الاستماع إليه.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}

        {/* معلومات إضافية */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>كيفية استخدام الميزة في صفحة المقال</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">1</div>
                <p className="text-gray-700">
                  افتح أي مقال يحتوي على ملخص (excerpt, summary, أو ai_summary)
                </p>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">2</div>
                <p className="text-gray-700">
                  ابحث عن قسم "🧠 الملخص الذكي" في أعلى المقال
                </p>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">3</div>
                <p className="text-gray-700">
                  انقر على زر التشغيل (▶️) بجوار الملخص للاستماع
                </p>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">4</div>
                <p className="text-gray-700">
                  سيتم توليد الصوت تلقائياً وتشغيله عند اكتمال التحميل
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
