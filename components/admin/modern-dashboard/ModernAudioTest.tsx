/**
 * صفحة اختبار الصوت الحديثة
 * Modern Audio Test Page
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardLayout from '@/components/admin/modern-dashboard/DashboardLayout';
import {
  Mic,
  MicOff,
  Play,
  Pause,
  Square,
  Download,
  Upload,
  Volume2,
  VolumeX,
  Activity, // استبدال Waveform بـ Activity
  Settings,
  Brain,
  Languages,
  Clock,
  FileAudio,
  Zap,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AudioRecording {
  id: string;
  name: string;
  duration: number;
  size: string;
  timestamp: Date;
  status: 'recording' | 'completed' | 'processing' | 'error';
  transcript?: string;
  confidence?: number;
  language?: string;
}

export default function ModernAudioTest() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [recordings, setRecordings] = useState<AudioRecording[]>([
    {
      id: '1',
      name: 'تسجيل تجريبي 1',
      duration: 45.5,
      size: '2.1 MB',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      status: 'completed',
      transcript: 'مرحباً، هذا اختبار لنظام التعرف على الكلام العربي في منصة سبق الذكية.',
      confidence: 0.94,
      language: 'ar'
    },
    {
      id: '2',
      name: 'تسجيل تجريبي 2',
      duration: 120.8,
      size: '5.6 MB',
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      status: 'processing',
      language: 'ar'
    }
  ]);
  const [selectedRecording, setSelectedRecording] = useState<AudioRecording | null>(recordings[0]);
  const [transcriptText, setTranscriptText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // محاكاة تسجيل صوتي
  const startRecording = () => {
    setIsRecording(true);
    // في التطبيق الحقيقي، ستبدأ هنا عملية التسجيل الفعلية
  };

  const stopRecording = () => {
    setIsRecording(false);
    // إضافة التسجيل الجديد
    const newRecording: AudioRecording = {
      id: Date.now().toString(),
      name: `تسجيل جديد ${recordings.length + 1}`,
      duration: Math.random() * 120 + 30,
      size: `${(Math.random() * 5 + 1).toFixed(1)} MB`,
      timestamp: new Date(),
      status: 'processing'
    };
    setRecordings(prev => [newRecording, ...prev]);
  };

  // تشغيل/إيقاف الصوت
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

  // معالجة النص بالذكاء الاصطناعي
  const processTranscript = async () => {
    setIsProcessing(true);
    // محاكاة معالجة النص
    setTimeout(() => {
      setTranscriptText('تم تحليل النص بنجاح باستخدام الذكاء الاصطناعي...');
      setIsProcessing(false);
    }, 2000);
  };

  // رسم الموجة الصوتية
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // رسم موجة صوتية متحركة
    const drawWaveform = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#2288D2';
      ctx.lineWidth = 2;
      ctx.beginPath();

      const amplitude = 20;
      const frequency = 0.02;
      const offset = Date.now() * 0.005;

      for (let x = 0; x < canvas.width; x++) {
        const y = canvas.height / 2 + Math.sin(x * frequency + offset) * amplitude * (isRecording ? 1 : 0.3);
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    };

    const interval = setInterval(drawWaveform, 50);
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: AudioRecording['status']) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'processing': return 'text-yellow-600 bg-yellow-100';
      case 'recording': return 'text-blue-600 bg-blue-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: AudioRecording['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'processing': return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'recording': return <Mic className="h-4 w-4" />;
      case 'error': return <AlertCircle className="h-4 w-4" />;
      default: return <FileAudio className="h-4 w-4" />;
    }
  };

  return (
    <DashboardLayout 
      pageTitle="اختبار الصوت المتقدم"
      pageDescription="تسجيل ومعالجة الملفات الصوتية بتقنيات الذكاء الاصطناعي"
    >
      <div className="space-y-6">
        {/* شريط الأدوات العلوي */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-2">
            <Button 
              className={cn(
                "bg-red-600 hover:bg-red-700",
                isRecording && "animate-pulse"
              )}
              onClick={isRecording ? stopRecording : startRecording}
            >
              {isRecording ? (
                <>
                  <Square className="h-4 w-4 mr-2" />
                  إيقاف التسجيل
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4 mr-2" />
                  بدء التسجيل
                </>
              )}
            </Button>
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              رفع ملف
            </Button>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              الإعدادات
            </Button>
          </div>
        </div>

        {/* الإحصائيات السريعة */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { title: 'إجمالي التسجيلات', value: recordings.length.toString(), icon: FileAudio, color: 'blue' },
            { title: 'قيد المعالجة', value: recordings.filter(r => r.status === 'processing').length.toString(), icon: Loader2, color: 'yellow' },
            { title: 'مكتملة', value: recordings.filter(r => r.status === 'completed').length.toString(), icon: CheckCircle, color: 'green' },
            { title: 'متوسط الدقة', value: '94%', icon: Brain, color: 'purple' }
          ].map((stat) => (
            <Card key={stat.title}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon className={cn(
                    "h-8 w-8",
                    stat.color === 'blue' && "text-blue-500",
                    stat.color === 'yellow' && "text-yellow-500",
                    stat.color === 'green' && "text-green-500",
                    stat.color === 'purple' && "text-purple-500"
                  )} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* منطقة التسجيل والتشغيل */}
          <div className="lg:col-span-2 space-y-6">
            {/* التسجيل */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                                        <Activity className="h-5 w-5" />
                  استوديو التسجيل
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* الموجة الصوتية */}
                <div className="relative">
                  <canvas
                    ref={canvasRef}
                    width={600}
                    height={100}
                    className="w-full h-20 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  />
                  {isRecording && (
                    <div className="absolute top-2 right-2 flex items-center gap-2 text-red-600">
                      <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">تسجيل...</span>
                    </div>
                  )}
                </div>

                {/* أدوات التحكم */}
                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={togglePlayback}
                    disabled={!selectedRecording || selectedRecording.status !== 'completed'}
                  >
                    {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                  </Button>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{formatDuration(currentTime)}</span>
                      <span>{formatDuration(duration)}</span>
                    </div>
                    <Progress value={(currentTime / duration) * 100 || 0} className="h-2" />
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      {volume > 0 ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                    </Button>
                    <Input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={(e) => setVolume(parseFloat(e.target.value))}
                      className="w-20"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* معالجة النص */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    معالجة النص بالذكاء الاصطناعي
                  </CardTitle>
                  <Button 
                    onClick={processTranscript}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        معالجة...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        معالجة
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="transcript">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="transcript">النص المكتوب</TabsTrigger>
                    <TabsTrigger value="analysis">التحليل</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="transcript" className="space-y-4">
                    <Textarea
                      placeholder="سيظهر النص المحول من الصوت هنا..."
                      value={selectedRecording?.transcript || transcriptText}
                      onChange={(e) => setTranscriptText(e.target.value)}
                      className="min-h-32"
                    />
                    {selectedRecording?.confidence && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">دقة التحويل:</span>
                        <Progress value={selectedRecording.confidence * 100} className="w-32 h-2" />
                        <span className="text-sm font-medium">{Math.round(selectedRecording.confidence * 100)}%</span>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="analysis" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>اللغة المكتشفة</Label>
                        <div className="flex items-center gap-2">
                          <Languages className="h-4 w-4" />
                          <span>{selectedRecording?.language === 'ar' ? 'العربية' : 'غير محدد'}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>مدة التسجيل</Label>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{selectedRecording ? formatDuration(selectedRecording.duration) : '00:00'}</span>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* قائمة التسجيلات */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>التسجيلات الصوتية</CardTitle>
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {recordings.map((recording) => (
                <div
                  key={recording.id}
                  className={cn(
                    "p-3 rounded-lg border cursor-pointer transition-all",
                    "hover:bg-gray-50 dark:hover:bg-gray-800",
                    selectedRecording?.id === recording.id && "bg-blue-50 dark:bg-blue-900/20 border-blue-200"
                  )}
                  onClick={() => setSelectedRecording(recording)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{recording.name}</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {recording.timestamp.toLocaleString('ar-SA')}
                      </p>
                    </div>
                    <Badge className={cn("text-xs", getStatusColor(recording.status))}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(recording.status)}
                        {recording.status === 'completed' && 'مكتمل'}
                        {recording.status === 'processing' && 'معالجة'}
                        {recording.status === 'recording' && 'تسجيل'}
                        {recording.status === 'error' && 'خطأ'}
                      </div>
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{formatDuration(recording.duration)}</span>
                    <span>{recording.size}</span>
                  </div>

                  {recording.transcript && (
                    <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                      {recording.transcript}
                    </p>
                  )}

                  <div className="flex gap-1 mt-2">
                    <Button variant="ghost" size="sm" className="h-6 text-xs">
                      <Play className="h-3 w-3 mr-1" />
                      تشغيل
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 text-xs">
                      <Download className="h-3 w-3 mr-1" />
                      تحميل
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* أدوات إضافية */}
        <Card>
          <CardHeader>
            <CardTitle>أدوات متقدمة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { title: 'تحسين الصوت', icon: Zap, description: 'تقليل الضوضاء وتحسين الجودة' },
                { title: 'تحليل المشاعر', icon: Brain, description: 'تحليل نبرة الصوت والمشاعر' },
                { title: 'ترجمة فورية', icon: Languages, description: 'ترجمة النص إلى لغات أخرى' },
                { title: 'تلخيص ذكي', icon: FileAudio, description: 'استخراج النقاط المهمة' }
              ].map((tool) => (
                <Button
                  key={tool.title}
                  variant="outline"
                  className="h-auto p-4 flex flex-col gap-2 text-center"
                >
                  <tool.icon className="h-8 w-8 text-blue-500" />
                  <div>
                    <div className="font-medium text-sm">{tool.title}</div>
                    <div className="text-xs text-gray-600 mt-1">{tool.description}</div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* العنصر الصوتي المخفي */}
      <audio
        ref={audioRef}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={() => setIsPlaying(false)}
        style={{ display: 'none' }}
      />
    </DashboardLayout>
  );
}
