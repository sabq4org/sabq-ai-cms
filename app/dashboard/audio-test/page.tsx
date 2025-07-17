'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle, Loader2, Volume2, Download, Play, Activity } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import toast, { Toaster } from 'react-hot-toast';

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
    const toastId = toast.loading('🔍 جاري فحص حالة الخدمة...');
    try {
      const response = await fetch('/api/audio/status');
      const data = await response.json();
      setApiStatus(data);
      
      if (data.success) {
        toast.success(
          <div className="text-right">
            <p className="font-bold">✅ الخدمة تعمل بنجاح!</p>
            <p className="text-sm mt-1">الأصوات المتاحة: {data.voices?.total_voices || 0}</p>
            <p className="text-sm">الحصة المتبقية: {data.usage?.characters?.remaining || 0} حرف</p>
          </div>,
          { id: toastId, duration: 5000 }
        );
      } else {
        toast.error(
          <div className="text-right">
            <p className="font-bold">❌ خطأ في الخدمة</p>
            <p className="text-sm mt-1">{data.error || data.message}</p>
          </div>,
          { id: toastId, duration: 5000 }
        );
      }
    } catch (err) {
      setApiStatus({ status: 'error', message: 'فشل في الاتصال بالـ API' });
      toast.error('فشل في الاتصال بالخدمة', { id: toastId });
    }
  };

  // توليد الصوت
  const generateAudio = async () => {
    if (!summary.trim()) {
      setError('يرجى إدخال نص الملخص');
      toast.error('يرجى إدخال نص الملخص أولاً');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);
    
    const toastId = toast.loading(
      <div className="text-right">
        <p className="font-bold">🎙️ جاري توليد النشرة الصوتية...</p>
        <p className="text-sm">الصوت: {voice === 'bradford' ? 'Bradford' : 'Rachel'}</p>
      </div>
    );

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
      
      // إشعار النجاح مع خيارات
      toast.custom((t) => (
        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} bg-white shadow-xl rounded-lg p-4 text-right max-w-md`}>
          <div className="flex items-start gap-3">
            <CheckCircle className="text-green-500 w-6 h-6 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-bold text-gray-900">✅ تم توليد النشرة بنجاح!</p>
              <p className="text-sm text-gray-600 mt-1">الحجم: {(data.size / 1024).toFixed(1)} KB</p>
              <p className="text-sm text-gray-600">المدة: {data.duration_estimate}</p>
              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => {
                    playAudio(data.url);
                    toast.dismiss(t.id);
                  }}
                  className="flex items-center gap-1"
                >
                  <Play className="w-4 h-4" />
                  تشغيل
                </Button>
                <a href={data.url} download={data.filename}>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex items-center gap-1"
                  >
                    <Download className="w-4 h-4" />
                    تحميل
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      ), { id: toastId, duration: 10000 });
      
    } catch (err: any) {
      setError(err.message || 'فشل في توليد الصوت');
      console.error('❌ خطأ:', err);
      
      // إشعار الخطأ
      toast.error(
        <div className="text-right">
          <p className="font-bold">❌ فشل توليد النشرة</p>
          <p className="text-sm mt-1">{err.message || 'حدث خطأ غير متوقع'}</p>
        </div>,
        { id: toastId, duration: 5000 }
      );
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
                    <p className="font-medium">{apiStatus.message || apiStatus.error}</p>
                    {apiStatus.success && (
                      <>
                        <div className="text-xs space-y-1">
                          <p>🔑 مفتاح API: ✅ صالح</p>
                          <p>🎵 الأصوات المتاحة: {apiStatus.voices?.total_voices || 0}</p>
                          <p>📊 Bradford: {apiStatus.voices?.bradford_available ? '✅ متاح' : '❌ غير متاح'}</p>
                          <p>📊 Rachel: {apiStatus.voices?.rachel_available ? '✅ متاح' : '❌ غير متاح'}</p>
                        </div>
                        <div className="bg-white/50 rounded p-2 mt-2">
                          <p className="text-xs font-medium">استخدام الحصة:</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all ${
                                  apiStatus.usage?.characters?.percentage < 80 ? 'bg-green-500' :
                                  apiStatus.usage?.characters?.percentage < 90 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${apiStatus.usage?.characters?.percentage || 0}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium">{apiStatus.usage?.characters?.percentage || 0}%</span>
                          </div>
                          <p className="text-xs mt-1 text-slate-600">
                            {apiStatus.usage?.characters?.used || 0} / {apiStatus.usage?.characters?.limit || 0} حرف
                          </p>
                        </div>
                      </>
                    )}
                    {apiStatus.troubleshooting && (
                      <div className="text-xs space-y-1 pt-2 border-t">
                        <p className="font-medium">اقتراحات لحل المشكلة:</p>
                        {apiStatus.troubleshooting.map((tip: string, i: number) => (
                          <p key={i}>• {tip}</p>
                        ))}
                      </div>
                    )}
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
            <div className="space-y-3">
              <Button 
                onClick={generateAudio} 
                disabled={isLoading || !summary.trim()}
                className="w-full bg-red-600 hover:bg-red-700"
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
              
              {/* زر فحص حالة الخدمة */}
              <Button 
                onClick={async () => {
                  try {
                    const res = await fetch('/api/audio/status');
                    const data = await res.json();
                    
                    if (data.success) {
                      alert(`✅ ${data.message}\n\n🎙️ الأصوات المتاحة: ${data.voices?.total_voices || 0}\n📊 الاستخدام: ${data.usage?.characters?.percentage || 0}%`);
                    } else {
                      alert(`❌ ${data.error}\n\nالتفاصيل: ${data.details || 'غير متوفرة'}`);
                    }
                  } catch (err) {
                    alert('❌ فشل في فحص حالة الخدمة');
                  }
                }}
                variant="outline"
                className="w-full"
                size="sm"
              >
                <Activity className="w-4 h-4 mr-2" />
                فحص حالة خدمة ElevenLabs
              </Button>
            </div>
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

        {/* نموذج تجريبي */}
        {!result && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-800 flex items-center gap-2">
                <Volume2 className="w-5 h-5" />
                نموذج صوتي تجريبي
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-blue-700">
                جرب الاستماع إلى نموذج من النشرات الصوتية المُنتجة بواسطة ElevenLabs:
              </p>
              <div className="flex gap-2">
                <Button 
                  onClick={() => playAudio('/audio/daily-news-2025-07-17T13-02-46-229Z.mp3')} 
                  variant="outline"
                  className="flex-1"
                >
                  <Play className="w-4 h-4 mr-2" />
                  تشغيل النموذج
                </Button>
                <a 
                  href="/audio/daily-news-2025-07-17T13-02-46-229Z.mp3" 
                  download="نموذج-نشرة-صوتية.mp3"
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-blue-300 rounded-md text-sm font-medium text-blue-700 bg-white hover:bg-blue-50"
                >
                  <Download className="w-4 h-4 mr-2" />
                  تحميل النموذج
                </a>
              </div>
            </CardContent>
          </Card>
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
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            background: '#333',
            color: '#fff',
          },
        }}
      />
    </div>
  );
} 