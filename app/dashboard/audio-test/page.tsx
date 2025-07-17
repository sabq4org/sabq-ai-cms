'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle, Loader2, Volume2, Download, Play } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AudioTestPage() {
  const [summary, setSummary] = useState('');
  const [voice, setVoice] = useState('bradford');
  const [filename, setFilename] = useState('daily-news');
  const [language, setLanguage] = useState('arabic');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<any>(null);

  // اختبار حالة الـ API
  const checkApiStatus = async () => {
    try {
      const response = await fetch('/api/audio/generate');
      const data = await response.json();
      setApiStatus(data);
    } catch (err) {
      setApiStatus({ status: 'error', message: 'فشل في الاتصال بالـ API' });
    }
  };

  // توليد الصوت
  const generateAudio = async () => {
    if (!summary.trim()) {
      setError('يرجى إدخال نص الملخص');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/audio/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          summary: summary.trim(),
          voice,
          filename,
          language
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || 'خطأ في توليد الصوت');
      }

      setResult(data);
      console.log('✅ نشرة صوتية جاهزة:', data.url);
    } catch (err: any) {
      setError(err.message || 'فشل في توليد الصوت');
      console.error('❌ خطأ:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // تشغيل الصوت
  const playAudio = (url: string) => {
    const audio = new Audio(url);
    audio.play().catch(err => {
      console.error('خطأ في تشغيل الصوت:', err);
      setError('فشل في تشغيل الملف الصوتي');
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* العنوان */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
            🎙️ اختبار توليد النشرات الصوتية
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            اختبار API الجديد لتوليد الصوت باستخدام ElevenLabs
          </p>
        </div>

        {/* فحص حالة الـ API */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="w-5 h-5" />
              حالة الخدمة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                اختبار اتصال API وحالة المفاتيح
              </p>
              <Button onClick={checkApiStatus} variant="outline">
                فحص الحالة
              </Button>
            </div>
            
            {apiStatus && (
              <Alert className={`mt-4 ${apiStatus.status === 'operational' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                {apiStatus.status === 'operational' ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-medium">{apiStatus.message}</p>
                    <div className="text-xs space-y-1">
                      <p>🔑 مفتاح API: {apiStatus.api_key_configured ? '✅ مُعرَّف' : '❌ غير مُعرَّف'}</p>
                      <p>🎵 الأصوات المتاحة: {apiStatus.available_voices?.join(', ')}</p>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* نموذج التوليد */}
        <Card>
          <CardHeader>
            <CardTitle>توليد نشرة صوتية جديدة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {/* نص الملخص */}
            <div>
              <Label htmlFor="summary">نص الملخص *</Label>
              <Textarea
                id="summary"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="اكتب نص الملخص الذي تريد تحويله إلى صوت..."
                rows={6}
                className="mt-1"
              />
              <p className="text-xs text-slate-500 mt-1">
                الطول: {summary.length} حرف (الحد الأقصى: 2500)
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* اختيار الصوت */}
              <div>
                <Label htmlFor="voice">الصوت</Label>
                <select 
                  value={voice} 
                  onChange={(e) => setVoice(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="bradford">Bradford (رجالي عميق)</option>
                  <option value="rachel">Rachel (نسائي واضح)</option>
                  <option value="arabic_male">عربي رجالي</option>
                  <option value="arabic_female">عربي نسائي</option>
                </select>
              </div>

              {/* اسم الملف */}
              <div>
                <Label htmlFor="filename">اسم الملف</Label>
                <Input
                  id="filename"
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  placeholder="daily-news"
                />
              </div>

              {/* اللغة */}
              <div>
                <Label htmlFor="language">اللغة</Label>
                <select 
                  value={language} 
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="arabic">العربية</option>
                  <option value="english">الإنجليزية</option>
                </select>
              </div>
            </div>

            {/* زر التوليد */}
            <Button 
              onClick={generateAudio} 
              disabled={isLoading || !summary.trim()}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  جاري التوليد...
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 mr-2" />
                  توليد النشرة الصوتية
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* رسائل الخطأ */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* نتائج التوليد */}
        {result && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                تم توليد النشرة بنجاح!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="font-medium text-green-800">اسم الملف:</p>
                  <p className="text-green-700">{result.filename}</p>
                </div>
                <div>
                  <p className="font-medium text-green-800">الحجم:</p>
                  <p className="text-green-700">{Math.round(result.size / 1024)} KB</p>
                </div>
                <div>
                  <p className="font-medium text-green-800">المدة المتوقعة:</p>
                  <p className="text-green-700">{result.duration_estimate}</p>
                </div>
                <div>
                  <p className="font-medium text-green-800">الصوت المستخدم:</p>
                  <p className="text-green-700">{result.voice_used}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => playAudio(result.url)} className="flex-1">
                  <Play className="w-4 h-4 mr-2" />
                  تشغيل
                </Button>
                <a 
                  href={result.url} 
                  download
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <Download className="w-4 h-4 mr-2" />
                  تحميل
                </a>
              </div>

              <div className="text-xs text-green-700 bg-green-100 p-3 rounded">
                <p className="font-medium">رابط الملف:</p>
                <p className="break-all font-mono">{window.location.origin + result.url}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* معلومات الاستخدام */}
        <Card>
          <CardHeader>
            <CardTitle>📋 معلومات الاستخدام</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <p><strong>API Endpoint:</strong> <code>/api/audio/generate</code></p>
            <p><strong>Method:</strong> POST</p>
            <p><strong>Content-Type:</strong> application/json</p>
            <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded mt-2">
              <p className="font-medium mb-2">مثال على الطلب:</p>
              <pre className="text-xs">
{`{
  "summary": "نص الملخص هنا...",
  "voice": "bradford",
  "filename": "daily-news",
  "language": "arabic"
}`}
              </pre>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
} 