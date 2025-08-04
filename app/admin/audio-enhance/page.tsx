'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle, Loader2, Volume2, Download, Play, Activity, Trash2, Archive, Home, RotateCcw, Users, Globe, Filter, Key, Settings } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import toast, { Toaster } from 'react-hot-toast';

// إعدادات الصفحة العربية
const pageMetadata = {
  title: "📢 إدارة النشرات الصوتية",
  description: "نظام متطور لتوليد وإدارة النشرات الصوتية بتقنية ElevenLabs",
  direction: "rtl" as const
};

// 16 صوت متنوع من ElevenLabs
const ENHANCED_VOICES = [
  // أصوات رجالية عربية ومتنوعة
  { id: 'pNInz6obpgDQGcFmaJgB', name: 'آدم - صوت رجالي شاب', gender: 'male', accent: 'عام', language: 'ar', preview: 'https://api.elevenlabs.io/v1/voices/pNInz6obpgDQGcFmaJgB/preview' },
  { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'جوش - صوت رجالي عميق', gender: 'male', accent: 'خليجي', language: 'ar', preview: 'https://api.elevenlabs.io/v1/voices/TxGEqnHWrfWFTfGW9XjX/preview' },
  { id: 'ErXwobaYiN019PkySvjV', name: 'أنطوني - صوت رجالي ودود', gender: 'male', accent: 'شامي', language: 'ar', preview: 'https://api.elevenlabs.io/v1/voices/ErXwobaYiN019PkySvjV/preview' },
  { id: 'VR6AewLTigWG4xSOukaG', name: 'أرنولد - صوت رجالي قوي', gender: 'male', accent: 'مصري', language: 'ar', preview: 'https://api.elevenlabs.io/v1/voices/VR6AewLTigWG4xSOukaG/preview' },
  { id: 'n8TWbmNgNErEQxqTvzVq', name: 'كلايد - صوت رجالي حماسي', gender: 'male', accent: 'مغاربي', language: 'ar', preview: 'https://api.elevenlabs.io/v1/voices/n8TWbmNgNErEQxqTvzVq/preview' },
  { id: 'yoZ06aMxZJJ28mfd3POQ', name: 'سام - صوت محايد رجالي', gender: 'male', accent: 'عام', language: 'ar', preview: 'https://api.elevenlabs.io/v1/voices/yoZ06aMxZJJ28mfd3POQ/preview' },
  { id: 'bVMeCyTHy58xNoL34h3p', name: 'أحمد - صوت رجالي كلاسيكي', gender: 'male', accent: 'فصحى', language: 'ar', preview: 'https://api.elevenlabs.io/v1/voices/bVMeCyTHy58xNoL34h3p/preview' },
  { id: '29vD33N1CtxCmqQRPOHJ', name: 'محمد - صوت رجالي إخباري', gender: 'male', accent: 'إخباري', language: 'ar', preview: 'https://api.elevenlabs.io/v1/voices/29vD33N1CtxCmqQRPOHJ/preview' },
  
  // أصوات نسائية عربية ومتنوعة
  { id: '21m00Tcm4TlvDq8ikWAM', name: 'راشيل - صوت نسائي واضح', gender: 'female', accent: 'عام', language: 'ar', preview: 'https://api.elevenlabs.io/v1/voices/21m00Tcm4TlvDq8ikWAM/preview' },
  { id: 'AZnzlk1XvdvUeBnXmlld', name: 'دومي - صوت نسائي نشيط', gender: 'female', accent: 'خليجي', language: 'ar', preview: 'https://api.elevenlabs.io/v1/voices/AZnzlk1XvdvUeBnXmlld/preview' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'بيلا - صوت نسائي ناعم', gender: 'female', accent: 'شامي', language: 'ar', preview: 'https://api.elevenlabs.io/v1/voices/EXAVITQu4vr4xnSDxMaL/preview' },
  { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'إيلي - صوت نسائي شاب', gender: 'female', accent: 'مصري', language: 'ar', preview: 'https://api.elevenlabs.io/v1/voices/MF3mGyEYCl7XYWbV9V6O/preview' },
  { id: 'piTKgcLEGmPE4e6mEKli', name: 'نيكول - صوت نسائي محترف', gender: 'female', accent: 'مغاربي', language: 'ar', preview: 'https://api.elevenlabs.io/v1/voices/piTKgcLEGmPE4e6mEKli/preview' },
  { id: 'ThT5KcBeYPX3keUQqHPh', name: 'فاطمة - صوت نسائي كلاسيكي', gender: 'female', accent: 'فصحى', language: 'ar', preview: 'https://api.elevenlabs.io/v1/voices/ThT5KcBeYPX3keUQqHPh/preview' },
  { id: 'XB0fDUnXU5powFXDhCwa', name: 'عائشة - صوت نسائي إخباري', gender: 'female', accent: 'إخباري', language: 'ar', preview: 'https://api.elevenlabs.io/v1/voices/XB0fDUnXU5powFXDhCwa/preview' },
  { id: 'pqHfZKP75CvOlQylNhV4', name: 'نور - صوت نسائي عصري', gender: 'female', accent: 'عصري', language: 'ar', preview: 'https://api.elevenlabs.io/v1/voices/pqHfZKP75CvOlQylNhV4/preview' }
];

// أنواع الحالات للنشرات
const BULLETIN_STATUSES = {
  DRAFT: 'مسودة',
  PUBLISHED: 'منشورة', 
  ARCHIVED: 'مؤرشفة',
  DELETED: 'محذوفة'
};

const LANGUAGES = [
  { id: 'arabic', name: 'العربية', flag: '🇸🇦' },
  { id: 'english', name: 'English', flag: '🇺🇸' },
  { id: 'french', name: 'Français', flag: '🇫🇷' },
  { id: 'spanish', name: 'Español', flag: '🇪🇸' }
];

interface AudioBulletin {
  id: string;
  title: string;
  content: string;
  voice_id: string;
  voice_name: string;
  audio_url: string;
  filename: string;
  duration: number;
  size: number;
  status: keyof typeof BULLETIN_STATUSES;
  is_featured: boolean;
  language: string;
  created_at: string;
  updated_at: string;
  // إضافة حقول جديدة
  voice_settings?: {
    stability: number;
    similarity_boost: number;
    style: number;
    use_speaker_boost: boolean;
  };
  tags?: string[];
  play_count?: number;
}

export default function AdvancedAudioEnhancePage() {
  const [summary, setSummary] = useState('');
  const [voice, setVoice] = useState('pNInz6obpgDQGcFmaJgB'); // آدم
  const [filename, setFilename] = useState('');
  const [language, setLanguage] = useState('arabic');
  const [title, setTitle] = useState('');
  const [addToHomepage, setAddToHomepage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<any>(null);
  const [bulletins, setBulletins] = useState<AudioBulletin[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('generate');
  
  // إضافة states جديدة
  const [playingPreview, setPlayingPreview] = useState<string | null>(null);
  const [voiceSettings, setVoiceSettings] = useState({
    stability: 0.6,
    similarity_boost: 0.75,
    style: 0.3,
    use_speaker_boost: true
  });
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [generationProgress, setGenerationProgress] = useState(0);

  // تحديد اسم الملف تلقائياً بناءً على العنوان والتاريخ
  useEffect(() => {
    if (title) {
      const date = new Date().toISOString().slice(0, 10);
      const cleanTitle = title.replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').toLowerCase();
      setFilename(`${date}-${cleanTitle}`);
    }
  }, [title]);

  // تحميل النشرات المحفوظة
  useEffect(() => {
    loadBulletins();
    syncBulletinsFromDatabase(); // إضافة مزامنة من قاعدة البيانات
  }, []);

  // مزامنة النشرات من قاعدة البيانات
  const syncBulletinsFromDatabase = async () => {
    try {
      const response = await fetch('/api/audio/newsletters');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.newsletters) {
          // تحويل النشرات من قاعدة البيانات إلى تنسيق localStorage
          const dbBulletins = data.newsletters.map((nl: any) => ({
            id: nl.id,
            title: nl.title,
            content: nl.content,
            voice_id: nl.voice_id,
            voice_name: nl.voice_name,
            audioUrl: nl.audioUrl,
            filename: nl.audioUrl.split('/').pop() || 'audio.mp3',
            duration: nl.duration,
            size: 0, // Default size
            created_at: nl.created_at,
            updated_at: nl.updated_at,
            status: nl.is_published ? 'PUBLISHED' : 'DRAFT',
            is_featured: nl.is_featured,
            is_main_page: nl.is_main_page,
            play_count: nl.play_count || 0,
            tags: [],
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
              style: 0,
              use_speaker_boost: true
            }
          }));
          
          // دمج النشرات من قاعدة البيانات مع النشرات المحلية
          const localBulletins = localStorage.getItem('audio_bulletins');
          const existingBulletins = localBulletins ? JSON.parse(localBulletins) : [];
          
          // دمج النشرات مع الأولوية لقاعدة البيانات
          const mergedBulletins = [...dbBulletins];
          existingBulletins.forEach((local: AudioBulletin) => {
            if (!mergedBulletins.find(db => db.id === local.id)) {
              mergedBulletins.push(local);
            }
          });
          
          saveBulletins(mergedBulletins);
        }
      }
    } catch (error) {
      console.error('خطأ في مزامنة النشرات من قاعدة البيانات:', error);
    }
  };

  // تحميل النشرات من التخزين المحلي (يمكن استبدالها بـ API)
  const loadBulletins = () => {
    try {
      const saved = localStorage.getItem('audio_bulletins');
      if (saved) {
        setBulletins(JSON.parse(saved));
      }
    } catch (error) {
      console.error('خطأ في تحميل النشرات:', error);
    }
  };

  // حفظ النشرات في التخزين المحلي
  const saveBulletins = (bulletins: AudioBulletin[]) => {
    try {
      localStorage.setItem('audio_bulletins', JSON.stringify(bulletins));
      setBulletins(bulletins);
    } catch (error) {
      console.error('خطأ في حفظ النشرات:', error);
    }
  };

  // اختبار حالة الـ API
  const checkApiStatus = async () => {
    const toastId = toast.loading('🔍 جاري فحص حالة الخدمة...');
    try {
      const response = await fetch('/api/audio/status');
      const data = await response.json();
      setApiStatus(data);
      
      if (data.success) {
        toast.success('✅ الخدمة تعمل بنجاح!', { id: toastId, duration: 3000 });
      } else {
        const errorMsg = data.error || data.message || 'حدث خطأ في الخدمة';
        toast.error(`❌ ${errorMsg}`, { id: toastId, duration: 5000 });
      }
    } catch (err) {
      setApiStatus({ 
        status: 'error', 
        success: false,
        message: 'فشل في الاتصال بالخدمة'
      });
      
      toast.error('❌ فشل الاتصال بالخدمة', { id: toastId });
    }
  };

  // معاينة الصوت
  const previewVoice = async (voiceId: string, voicePreviewUrl?: string) => {
    try {
      // إيقاف أي معاينة سابقة
      const existingAudio = document.querySelector('audio#voice-preview') as HTMLAudioElement;
      if (existingAudio) {
        existingAudio.pause();
        existingAudio.remove();
      }

      setPlayingPreview(voiceId);
      
      // استخدام عينة صوتية نموذجية
      const sampleText = language === 'arabic' 
        ? 'مرحباً، هذا مثال على صوتي. يمكنني قراءة النصوص بوضوح وطلاقة.'
        : 'Hello, this is a sample of my voice. I can read texts clearly and fluently.';
      
      try {
        // توليد معاينة صوتية عبر API
        const response = await fetch('/api/audio/preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: sampleText,
            voice_id: voiceId,
            settings: voiceSettings
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'فشل في توليد المعاينة');
        }
        
        const data = await response.json();
        
        if (!data.preview_url) {
          throw new Error('لم يتم إرجاع رابط المعاينة');
        }
        
        // إنشاء عنصر صوت للمعاينة
        const audio = document.createElement('audio');
        audio.id = 'voice-preview';
        audio.src = data.preview_url;
        audio.preload = 'auto';
        
        // إضافة معالجات الأحداث قبل إضافة العنصر للصفحة
        audio.onerror = (e) => {
          console.error('خطأ في تحميل الصوت:', e);
          setPlayingPreview(null);
          toast.error('فشل في تحميل ملف الصوت');
          audio.remove();
        };
        
        audio.onloadeddata = () => {
          console.log('تم تحميل بيانات الصوت بنجاح');
        };
        
        audio.onended = () => {
          setPlayingPreview(null);
          audio.remove();
          toast.success('انتهت معاينة الصوت');
        };
        
        // إضافة للصفحة
        document.body.appendChild(audio);
        
        // محاولة التشغيل
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              toast.success('🎵 تشغيل معاينة الصوت', { duration: 2000 });
            })
            .catch((error) => {
              console.error('خطأ في تشغيل الصوت:', error);
              setPlayingPreview(null);
              audio.remove();
              
              // في حالة فشل التشغيل، نعرض رسالة مفيدة
              if (error.name === 'NotAllowedError') {
                toast.error('يرجى السماح بتشغيل الصوت في المتصفح');
              } else if (error.name === 'NotSupportedError') {
                toast.error('تنسيق الصوت غير مدعوم في المتصفح');
              } else {
                toast.error('فشل في تشغيل معاينة الصوت');
              }
            });
        }
        
      } catch (apiError: any) {
        console.error('خطأ في API المعاينة:', apiError);
        setPlayingPreview(null);
        
        // في حالة فشل API، نعرض رسالة توضيحية
        if (apiError.message.includes('503')) {
          toast.error('خدمة المعاينة غير متاحة - تحقق من مفتاح API');
        } else {
          toast.error(apiError.message || 'فشل في توليد معاينة الصوت');
        }
      }
      
    } catch (error: any) {
      console.error('خطأ عام في معاينة الصوت:', error);
      toast.error('حدث خطأ في معاينة الصوت');
      setPlayingPreview(null);
    }
  };

  // إضافة علامة
  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  // حذف علامة
  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  // توليد الصوت مع تحسينات
  const generateAudio = async () => {
    if (!summary.trim()) {
      setError('يرجى إدخال نص الملخص');
      toast.error('يرجى إدخال نص الملخص أولاً');
      return;
    }

    if (!title.trim()) {
      setError('يرجى إدخال عنوان النشرة');
      toast.error('يرجى إدخال عنوان النشرة أولاً');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);
    setGenerationProgress(0);
    
    const selectedVoice = ENHANCED_VOICES.find(v => v.id === voice);
    const toastId = toast.loading(
      <div className="text-right">
        <p className="font-bold">🎙️ جاري توليد النشرة الصوتية...</p>
        <p className="text-sm">الصوت: {selectedVoice?.name}</p>
        <p className="text-sm">العنوان: {title}</p>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${generationProgress}%` }}
          />
        </div>
      </div>
    );

    try {
      // محاكاة تقدم التوليد
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      const response = await fetch('/api/audio/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          summary: summary.trim(),
          voice,
          filename,
          language,
          title: title.trim(),
          voice_name: selectedVoice?.name || 'غير محدد',
          voice_settings: voiceSettings,
          tags
        })
      });

      clearInterval(progressInterval);
      setGenerationProgress(100);

      const data = await response.json();

      if (!response.ok) {
        let errorMessage = 'خطأ في توليد الصوت';
        
        if (data.error) {
          errorMessage = data.error;
        } else if (data.details) {
          errorMessage = data.details;
        } else if (data.message) {
          errorMessage = data.message;
        } else if (data.statusCode === 401) {
          errorMessage = 'مفتاح API غير صالح أو يفتقد الصلاحيات المطلوبة';
        } else if (response.status === 429) {
          errorMessage = 'تم تجاوز حد الاستخدام المسموح - يرجى المحاولة لاحقاً';
        }
        
        // عرض الخطأ بدلاً من throw
        setError(errorMessage);
        toast.error(`❌ ${errorMessage}`, { id: toastId, duration: 5000 });
        return;
      }

      setResult(data);
      
      // إنشاء نشرة جديدة
      const newBulletin: AudioBulletin = {
        id: Date.now().toString(),
        title,
        content: summary,
        voice_id: voice,
        voice_name: selectedVoice?.name || 'غير محدد',
        audio_url: data.url,
        filename: data.filename,
        duration: data.duration_estimate || 0,
        size: data.size || 0,
        status: addToHomepage ? 'PUBLISHED' : 'DRAFT',
        is_featured: addToHomepage,
        language,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        voice_settings: voiceSettings,
        tags,
        play_count: 0
      };

      // حفظ النشرة في الأرشيف
      const updatedBulletins = [newBulletin, ...bulletins];
      saveBulletins(updatedBulletins);
      
      // إشعار النجاح مع خيارات محسنة
      toast.custom((t) => (
        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 shadow-xl rounded-lg p-4 text-right max-w-md`}>
          <div className="flex items-start gap-3">
            <CheckCircle className="text-green-600 w-8 h-8 flex-shrink-0 animate-pulse" />
            <div className="flex-1">
              <p className="font-bold text-gray-900 text-lg">✅ تم توليد النشرة بنجاح!</p>
              <div className="grid grid-cols-2 gap-2 mt-2 text-sm text-gray-600">
                <div>
                  <span className="font-medium">الحجم:</span> {(data.size / 1024).toFixed(1)} KB
                </div>
                <div>
                  <span className="font-medium">المدة:</span> {data.duration_estimate}
                </div>
                <div>
                  <span className="font-medium">الصوت:</span> {selectedVoice?.name}
                </div>
                <div>
                  <span className="font-medium">اللغة:</span> {LANGUAGES.find(l => l.id === language)?.name}
                </div>
              </div>
              {addToHomepage && (
                <div className="mt-2 p-2 bg-green-100 rounded text-green-700 text-sm font-medium">
                  🏠 تم نشرها في الصفحة الرئيسية
                </div>
              )}
              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => {
                    playAudio(data.url);
                    toast.dismiss(t.id);
                  }}
                  className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700"
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
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setSummary('');
                    setTitle('');
                    setTags([]);
                    toast.dismiss(t.id);
                  }}
                  className="flex items-center gap-1"
                >
                  <RotateCcw className="w-4 h-4" />
                  جديد
                </Button>
              </div>
            </div>
          </div>
        </div>
      ), { id: toastId, duration: 15000 });

      // إرسال إلى الصفحة الرئيسية إذا تم تفعيل الخيار
      if (addToHomepage) {
        await publishToHomepage(newBulletin);
      }
      
    } catch (err: any) {
      const errorMessage = err?.message || 'فشل في توليد الصوت';
      setError(errorMessage);
      console.error('❌ خطأ:', err);
      
      toast.error(`❌ ${errorMessage}`, { id: toastId, duration: 5000 });
    } finally {
      setIsLoading(false);
      setGenerationProgress(0);
    }
  };

  // نشر النشرة في الصفحة الرئيسية
  const publishToHomepage = async (bulletin: AudioBulletin) => {
    try {
      console.log('🏠 نشر النشرة في الصفحة الرئيسية:', bulletin.id);
      
      // استدعاء API لتحديث حالة الصفحة الرئيسية
      const response = await fetch(`/api/audio/newsletters/${bulletin.id}/toggle-main-page`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error('فشل في نشر النشرة في الصفحة الرئيسية');
      }
      
      const data = await response.json();
      console.log('✅ تم نشر النشرة في قاعدة البيانات:', data);
      
      // تحديث النشرات في localStorage
      const updatedBulletins = bulletins.map(b => 
        b.id === bulletin.id 
          ? { ...b, status: 'PUBLISHED' as keyof typeof BULLETIN_STATUSES, is_featured: true, is_main_page: true }
          : { ...b, is_featured: false, is_main_page: false } // إلغاء تفعيل النشرات الأخرى
      );
      saveBulletins(updatedBulletins);
      
      toast.success('✅ تم نشر النشرة في الصفحة الرئيسية بنجاح!');
      
    } catch (error) {
      console.error('❌ خطأ في نشر النشرة:', error);
      toast.error('فشل في نشر النشرة في الصفحة الرئيسية');
    }
  };

  // تشغيل الصوت
  const playAudio = (url: string) => {
    try {
      // إيقاف أي صوت يعمل حالياً
      const existingAudio = document.querySelector('audio') as HTMLAudioElement;
      if (existingAudio) {
        existingAudio.pause();
        existingAudio.remove();
      }

      // إنشاء عنصر صوت جديد
      const audio = document.createElement('audio');
      audio.src = url;
      audio.controls = false;
      audio.preload = 'auto';
      
      // إضافة للصفحة
      document.body.appendChild(audio);
      
      // تشغيل الصوت
      audio.play().then(() => {
        toast.success('🎵 بدء تشغيل النشرة الصوتية', {
          duration: 3000,
          icon: '🎧'
        });
      }).catch((error) => {
        console.error('خطأ في تشغيل الصوت:', error);
        toast.error('فشل في تشغيل الصوت');
      });

      // إزالة العنصر بعد انتهاء التشغيل
      audio.addEventListener('ended', () => {
        audio.remove();
        toast.success('✅ انتهى تشغيل النشرة الصوتية');
      });

    } catch (error) {
      console.error('خطأ في تشغيل الصوت:', error);
      toast.error('فشل في تشغيل الصوت');
    }
  };

  // إدارة النشرات
  const updateBulletinStatus = (id: string, status: keyof typeof BULLETIN_STATUSES) => {
    const updatedBulletins = bulletins.map(bulletin => 
      bulletin.id === id ? { ...bulletin, status, updated_at: new Date().toISOString() } : bulletin
    );
    saveBulletins(updatedBulletins);
    toast.success(`تم تحديث حالة النشرة إلى: ${BULLETIN_STATUSES[status]}`);
  };

  const deleteBulletin = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه النشرة نهائياً؟')) {
      const updatedBulletins = bulletins.filter(bulletin => bulletin.id !== id);
      saveBulletins(updatedBulletins);
      toast.success('تم حذف النشرة بنجاح');
    }
  };

  const toggleFeatured = async (id: string) => {
    try {
      // استدعاء API لتحديث حالة الصفحة الرئيسية
      const response = await fetch(`/api/audio/newsletters/${id}/toggle-main-page`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error('فشل في تحديث النشرة');
      }
      
      const data = await response.json();
      
      // تحديث النشرات في localStorage
      const updatedBulletins = bulletins.map(bulletin => 
        bulletin.id === id 
          ? { ...bulletin, is_featured: true, is_main_page: true, updated_at: new Date().toISOString() }
          : { ...bulletin, is_featured: false, is_main_page: false }
      );
      saveBulletins(updatedBulletins);
      
      toast.success('✅ تم نشر النشرة في الصفحة الرئيسية بنجاح!');
    } catch (error) {
      console.error('خطأ في تحديث النشرة:', error);
      toast.error('فشل في تحديث النشرة');
    }
  };

  // تصفية النشرات
  const filteredBulletins = bulletins.filter(bulletin => {
    const statusMatch = filterStatus === 'all' || bulletin.status === filterStatus;
    const searchMatch = searchTerm === '' || 
      bulletin.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bulletin.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const selectedVoice = ENHANCED_VOICES.find(v => v.id === bulletin.voice_id);
    const genderMatch = selectedGender === 'all' || selectedVoice?.gender === selectedGender;
    
    return statusMatch && searchMatch && genderMatch;
  });

  // إحصائيات النشرات
  const stats = {
    total: bulletins.length,
    published: bulletins.filter(b => b.status === 'PUBLISHED').length,
    draft: bulletins.filter(b => b.status === 'DRAFT').length,
    archived: bulletins.filter(b => b.status === 'ARCHIVED').length,
    featured: bulletins.filter(b => b.is_featured).length
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Toaster position="top-center" />
      
      {/* هيدر الصفحة - بدون padding إضافي */}
      <div className="bg-white shadow-sm border-b mb-6">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between" dir="rtl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Volume2 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{pageMetadata.title}</h1>
                <p className="text-sm text-gray-600">{pageMetadata.description}</p>
              </div>
            </div>
            
            {/* معلومات سريعة */}
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Key className="w-4 h-4" />
                <span>ElevenLabs API</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Activity className="w-4 h-4" />
                <span>16 صوت متاح</span>
              </div>
              <Button
                onClick={checkApiStatus}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                فحص الخدمة
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* محتوى الصفحة */}
      <div className="container mx-auto p-6 max-w-6xl" dir="rtl">
        
        {/* إحصائيات سريعة */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">إجمالي النشرات</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
            <div className="text-2xl font-bold text-green-600">{stats.published}</div>
            <div className="text-sm text-gray-600">منشورة</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.draft}</div>
            <div className="text-sm text-gray-600">مسودات</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.archived}</div>
            <div className="text-sm text-gray-600">مؤرشفة</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
            <div className="text-2xl font-bold text-red-600">{stats.featured}</div>
            <div className="text-sm text-gray-600">في الصفحة الرئيسية</div>
          </div>
        </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full" dir="rtl">
        <TabsList className="grid w-full grid-cols-4" dir="rtl">
          <TabsTrigger value="generate">🎙️ توليد نشرة جديدة</TabsTrigger>
          <TabsTrigger value="archive">📚 أرشيف النشرات ({stats.total})</TabsTrigger>
          <TabsTrigger value="settings">🔧 إعدادات API</TabsTrigger>
          <TabsTrigger value="status">⚙️ حالة الخدمة</TabsTrigger>
        </TabsList>

        {/* تبويب توليد نشرة جديدة */}
        <TabsContent value="generate" className="space-y-6" dir="rtl">
          <Card dir="rtl">
            <CardHeader>
              <CardTitle>🎯 توليد نشرة صوتية جديدة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6" dir="rtl">
              
              {/* العنوان */}
              <div dir="rtl">
                <Label htmlFor="title">عنوان النشرة *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="نشرة أخبار اليوم - 28 يوليو 2025"
                  className="mt-1 text-right"
                  dir="rtl"
                />
              </div>
              
              {/* نص المحتوى */}
              <div dir="rtl">
                <Label htmlFor="summary">محتوى النشرة *</Label>
                <Textarea
                  id="summary"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="اكتب محتوى النشرة الصوتية هنا..."
                  rows={8}
                  className="mt-1 text-right"
                  dir="rtl"
                />
                <p className="text-xs text-slate-500 mt-1 text-right">
                  الطول: {summary.length} حرف (الحد الأقصى: 2500)
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* اختيار الصوت */}
                <div>
                  <Label htmlFor="voice">الصوت المطلوب (16 صوت متاح)</Label>
                  <div className="mt-2 space-y-2 max-h-48 overflow-y-auto border rounded-lg p-2">
                    {ENHANCED_VOICES.map((voiceOption) => (
                      <div key={voiceOption.id} className="flex items-center space-x-2 space-x-reverse hover:bg-gray-50 p-2 rounded">
                        <input
                          type="radio"
                          id={voiceOption.id}
                          name="voice"
                          value={voiceOption.id}
                          checked={voice === voiceOption.id}
                          onChange={(e) => setVoice(e.target.value)}
                          className="ml-2"
                        />
                        <label htmlFor={voiceOption.id} className="flex-1 text-sm cursor-pointer">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{voiceOption.name}</span>
                            <div className="flex gap-1 items-center">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.preventDefault();
                                  previewVoice(voiceOption.id, voiceOption.preview);
                                }}
                                disabled={playingPreview === voiceOption.id}
                                className="h-7 px-2"
                              >
                                {playingPreview === voiceOption.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Volume2 className="w-3 h-3" />
                                )}
                              </Button>
                              <Badge variant={voiceOption.gender === 'male' ? 'default' : 'secondary'} className="text-xs">
                                {voiceOption.gender === 'male' ? '👨 ذكر' : '👩 أنثى'}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {voiceOption.accent}
                              </Badge>
                            </div>
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* الإعدادات الإضافية */}
                <div className="space-y-4">
                  {/* اللغة */}
                  <div>
                    <Label htmlFor="language">اللغة</Label>
                    <select 
                      value={language} 
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
                    >
                      {LANGUAGES.map((lang) => (
                        <option key={lang.id} value={lang.id}>
                          {lang.flag} {lang.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* اسم الملف */}
                  <div>
                    <Label htmlFor="filename">اسم الملف</Label>
                    <Input
                      id="filename"
                      value={filename}
                      onChange={(e) => setFilename(e.target.value)}
                      placeholder="سيتم إنشاؤه تلقائياً"
                      className="mt-1"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      يتم إنشاء اسم الملف تلقائياً من العنوان والتاريخ
                    </p>
                  </div>

                  {/* خيار النشر في الصفحة الرئيسية */}
                  <div className="flex items-center space-x-2 space-x-reverse bg-blue-50 p-3 rounded-lg">
                    <Checkbox
                      id="addToHomepage"
                      checked={addToHomepage}
                      onCheckedChange={(checked) => setAddToHomepage(checked === true)}
                    />
                    <label htmlFor="addToHomepage" className="text-sm font-medium cursor-pointer">
                      🏠 نشر في الصفحة الرئيسية مباشرة
                    </label>
                  </div>
                </div>
              </div>

              {/* إعدادات الصوت المتقدمة */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4 space-y-4">
                <h3 className="font-semibold text-purple-900 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  إعدادات الصوت المتقدمة
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-purple-800">الثبات (Stability)</Label>
                    <div className="flex items-center gap-3 mt-2">
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={voiceSettings.stability}
                        onChange={(e) => setVoiceSettings({...voiceSettings, stability: parseFloat(e.target.value)})}
                        className="flex-1"
                      />
                      <span className="text-sm font-medium text-purple-700 w-12">{voiceSettings.stability}</span>
                    </div>
                    <p className="text-xs text-purple-600 mt-1">كلما زاد الرقم، زاد ثبات الصوت</p>
                  </div>
                  
                  <div>
                    <Label className="text-purple-800">التشابه (Similarity)</Label>
                    <div className="flex items-center gap-3 mt-2">
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={voiceSettings.similarity_boost}
                        onChange={(e) => setVoiceSettings({...voiceSettings, similarity_boost: parseFloat(e.target.value)})}
                        className="flex-1"
                      />
                      <span className="text-sm font-medium text-purple-700 w-12">{voiceSettings.similarity_boost}</span>
                    </div>
                    <p className="text-xs text-purple-600 mt-1">كلما زاد الرقم، زاد التشابه مع الصوت الأصلي</p>
                  </div>
                  
                  <div>
                    <Label className="text-purple-800">الأسلوب (Style)</Label>
                    <div className="flex items-center gap-3 mt-2">
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={voiceSettings.style}
                        onChange={(e) => setVoiceSettings({...voiceSettings, style: parseFloat(e.target.value)})}
                        className="flex-1"
                      />
                      <span className="text-sm font-medium text-purple-700 w-12">{voiceSettings.style}</span>
                    </div>
                    <p className="text-xs text-purple-600 mt-1">للتحكم في مستوى التعبير والعاطفة</p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="speakerBoost"
                      checked={voiceSettings.use_speaker_boost}
                      onCheckedChange={(checked) => setVoiceSettings({...voiceSettings, use_speaker_boost: checked === true})}
                    />
                    <Label htmlFor="speakerBoost" className="text-purple-800 cursor-pointer">
                      تعزيز وضوح المتحدث
                    </Label>
                  </div>
                </div>
              </div>

              {/* العلامات */}
              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-4 space-y-4">
                <h3 className="font-semibold text-orange-900 flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  العلامات (Tags)
                </h3>
                
                <div className="flex gap-2">
                  <Input
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    placeholder="أضف علامة..."
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={addTag}
                    variant="secondary"
                    size="sm"
                  >
                    إضافة
                  </Button>
                </div>
                
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="pr-2 bg-orange-100 text-orange-800 hover:bg-orange-200"
                      >
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="mr-1 text-orange-600 hover:text-orange-800"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* أزرار العمليات */}
              <div className="flex gap-4">
                <Button 
                  onClick={generateAudio} 
                  disabled={isLoading || !summary.trim() || !title.trim()}
                  className="flex-1"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      جاري التوليد...
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-5 h-5 mr-2" />
                      توليد النشرة الصوتية
                    </>
                  )}
                </Button>
                
                <Button 
                  onClick={checkApiStatus} 
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Activity className="w-4 h-4" />
                  فحص الخدمة
                </Button>
              </div>

              {/* عرض الأخطاء */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* عرض النتائج */}
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
                        <p className="text-green-700">{(result.size / 1024).toFixed(1)} KB</p>
                      </div>
                      <div>
                        <p className="font-medium text-green-800">المدة المتوقعة:</p>
                        <p className="text-green-700">{result.duration_estimate}</p>
                      </div>
                      <div>
                        <p className="font-medium text-green-800">الحالة:</p>
                        <p className="text-green-700">جاهز للاستخدام</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <Button
                        onClick={() => playAudio(result.url)}
                        className="flex items-center gap-2"
                      >
                        <Play className="w-4 h-4" />
                        تشغيل النشرة
                      </Button>
                      
                      <a href={result.url} download={result.filename}>
                        <Button variant="outline" className="flex items-center gap-2">
                          <Download className="w-4 h-4" />
                          تحميل الملف
                        </Button>
                      </a>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* تبويب أرشيف النشرات */}
        <TabsContent value="archive" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Archive className="w-5 h-5" />
                أرشيف النشرات الصوتية ({stats.total})
              </CardTitle>
            </CardHeader>
            <CardContent>
              
              {/* أدوات التصفية والبحث */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <Label>البحث</Label>
                  <Input
                    placeholder="ابحث في العناوين والمحتوى..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label>تصفية الحالة</Label>
                  <select 
                    value={filterStatus} 
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">جميع الحالات</option>
                    <option value="PUBLISHED">منشورة</option>
                    <option value="DRAFT">مسودة</option>
                    <option value="ARCHIVED">مؤرشفة</option>
                  </select>
                </div>
                
                <div>
                  <Label>نوع الصوت</Label>
                  <select 
                    value={selectedGender} 
                    onChange={(e) => setSelectedGender(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">جميع الأصوات</option>
                    <option value="male">أصوات رجالية</option>
                    <option value="female">أصوات نسائية</option>
                  </select>
                </div>
                
                <div className="flex items-end">
                  <Button 
                    onClick={() => {
                      setSearchTerm('');
                      setFilterStatus('all');
                      setSelectedGender('all');
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    إعادة تعيين
                  </Button>
                </div>
              </div>

              {/* قائمة النشرات */}
              {filteredBulletins.length === 0 ? (
                <div className="text-center py-12">
                  <Archive className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-medium text-gray-600 mb-2">لا توجد نشرات</h3>
                  <p className="text-gray-500">
                    {bulletins.length === 0 
                      ? 'لم يتم إنشاء أي نشرة بعد. ابدأ بإنشاء نشرة جديدة!' 
                      : 'لا توجد نشرات تطابق معايير البحث المحددة.'
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredBulletins.map((bulletin) => {
                    const selectedVoice = ENHANCED_VOICES.find(v => v.id === bulletin.voice_id);
                    return (
                      <Card key={bulletin.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-bold text-lg">{bulletin.title}</h3>
                              {bulletin.is_featured && (
                                <Badge variant="default" className="bg-red-500">
                                  <Home className="w-3 h-3 mr-1" />
                                  في الصفحة الرئيسية
                                </Badge>
                              )}
                              <Badge 
                                variant={
                                  bulletin.status === 'PUBLISHED' ? 'default' :
                                  bulletin.status === 'DRAFT' ? 'secondary' :
                                  bulletin.status === 'ARCHIVED' ? 'outline' : 'destructive'
                                }
                              >
                                {BULLETIN_STATUSES[bulletin.status]}
                              </Badge>
                            </div>
                            
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                              {bulletin.content.substring(0, 150)}...
                            </p>
                            
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>🎙️ {selectedVoice?.name}</span>
                              <span>📅 {new Date(bulletin.created_at).toLocaleDateString('ar-SA')}</span>
                              <span>📊 {(bulletin.size / 1024).toFixed(1)} KB</span>
                              <span>🌐 {LANGUAGES.find(l => l.id === bulletin.language)?.name}</span>
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-2 mr-4">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => playAudio(bulletin.audio_url)}
                                className="flex items-center gap-1"
                              >
                                <Play className="w-3 h-3" />
                                تشغيل
                              </Button>
                              
                              <a href={bulletin.audio_url} download={bulletin.filename}>
                                <Button size="sm" variant="outline" className="flex items-center gap-1">
                                  <Download className="w-3 h-3" />
                                  تحميل
                                </Button>
                              </a>
                            </div>
                            
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => toggleFeatured(bulletin.id)}
                                className="flex items-center gap-1"
                              >
                                <Home className="w-3 h-3" />
                                {bulletin.is_featured ? 'إلغاء النشر' : 'نشر'}
                              </Button>
                              
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateBulletinStatus(
                                  bulletin.id, 
                                  bulletin.status === 'ARCHIVED' ? 'DRAFT' : 'ARCHIVED'
                                )}
                                className="flex items-center gap-1"
                              >
                                <Archive className="w-3 h-3" />
                                {bulletin.status === 'ARCHIVED' ? 'استرجاع' : 'أرشفة'}
                              </Button>
                              
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => deleteBulletin(bulletin.id)}
                                className="flex items-center gap-1"
                              >
                                <Trash2 className="w-3 h-3" />
                                حذف
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* تبويب إعدادات API */}
        <TabsContent value="settings" className="space-y-6" dir="rtl">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6" dir="rtl">
            <div className="flex items-center gap-3 mb-4" dir="rtl">
              <Key className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">إعداد مفتاح ElevenLabs API</h3>
            </div>
            
            <div className="space-y-4" dir="rtl">
              <div className="bg-white border border-blue-200 rounded-lg p-4" dir="rtl">
                <h4 className="font-medium text-gray-900 mb-2 text-right">أين يتم وضع المفتاح وحفظه لكي تعمل الخدمة؟</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 text-right" dir="rtl">
                  <li>انتقل إلى الملف <code className="bg-gray-100 px-2 py-1 rounded">.env.local</code> في جذر المشروع</li>
                  <li>أضف السطر التالي:
                    <code className="block bg-gray-100 p-2 mt-1 rounded text-left" dir="ltr">
                      ELEVENLABS_API_KEY=sk_your_api_key_here
                    </code>
                  </li>
                  <li>احفظ الملف وأعد تشغيل الخادم للتطبيق</li>
                  <li>تأكد أن المفتاح صحيح من خلال تبويب "حالة الخدمة"</li>
                </ol>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4" dir="rtl">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium text-red-800">مشكلة في الصلاحيات الحالية</span>
                </div>
                <p className="text-sm text-red-700 mt-1 text-right">
                  المفتاح الحالي يفتقد الصلاحيات المطلوبة. يرجى تفعيل كل الصلاحيات في لوحة التحكم.
                </p>
                <ul className="text-xs text-red-600 mt-2 space-y-1 text-right">
                  <li>• افتح https://elevenlabs.io</li>
                  <li>• اذهب إلى Profile → API Keys</li>
                  <li>• اضغط على Edit بجانب مفتاحك</li>
                  <li>• فعّل كل الصلاحيات المتاحة</li>
                  <li>• أو أنشئ مفتاح جديد بصلاحيات كاملة</li>
                </ul>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4" dir="rtl">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">للحصول على مفتاح API جديد</span>
                </div>
                <p className="text-sm text-yellow-700 mt-1 text-right">
                  سجل في موقع ElevenLabs واذهب لقسم API Keys للحصول على مفتاحك مع كامل الصلاحيات
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* تبويب حالة الخدمة */}
        <TabsContent value="status" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                حالة خدمة ElevenLabs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button 
                  onClick={checkApiStatus} 
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Activity className="w-4 h-4" />
                  فحص حالة الخدمة
                </Button>

                {apiStatus && (
                  <Alert variant={apiStatus.success ? "default" : "destructive"}>
                    {apiStatus.success ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    <AlertDescription>
                      <div className="space-y-2" dir="rtl">
                        <p className="font-medium text-right">
                          {typeof apiStatus.message === 'string' ? apiStatus.message : 
                           typeof apiStatus.error === 'string' ? apiStatus.error : 
                           'حالة الخدمة غير واضحة'}
                        </p>
                        {apiStatus.success && (
                          <>
                            <div className="text-xs space-y-1">
                              <p>🔑 مفتاح API: ✅ صالح</p>
                              <p>🎵 الأصوات المتاحة: 16 صوت محسن</p>
                              <p>🌐 اللغات المدعومة: العربية، الإنجليزية، الفرنسية، الإسبانية</p>
                            </div>
                            <div className="bg-white/50 rounded p-2 mt-2">
                              <p className="text-xs font-medium">استخدام الحصة:</p>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full transition-all ${
                                      (apiStatus.usage?.characters?.percentage || 0) < 80 ? 'bg-green-500' :
                                      (apiStatus.usage?.characters?.percentage || 0) < 90 ? 'bg-yellow-500' : 'bg-red-500'
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
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {/* معلومات إضافية عن الخدمة */}
                <Card className="bg-blue-50">
                  <CardHeader>
                    <CardTitle className="text-blue-800">🔧 معلومات الخدمة</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div>
                      <h4 className="font-medium text-blue-800">الأصوات المتاحة:</h4>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div>
                          <p className="font-medium">أصوات رجالية (8):</p>
                          <ul className="text-xs space-y-1 text-blue-700">
                            <li>• آدم - صوت شاب</li>
                            <li>• جوش - صوت عميق</li>
                            <li>• أنطوني - صوت ودود</li>
                            <li>• أرنولد - صوت قوي</li>
                            <li>• كلايد - صوت حماسي</li>
                            <li>• سام - صوت محايد</li>
                            <li>• أحمد - صوت كلاسيكي</li>
                            <li>• محمد - صوت إخباري</li>
                          </ul>
                        </div>
                        <div>
                          <p className="font-medium">أصوات نسائية (8):</p>
                          <ul className="text-xs space-y-1 text-blue-700">
                            <li>• راشيل - صوت واضح</li>
                            <li>• دومي - صوت نشيط</li>
                            <li>• بيلا - صوت ناعم</li>
                            <li>• إيلي - صوت شاب</li>
                            <li>• نيكول - صوت محترف</li>
                            <li>• فاطمة - صوت كلاسيكي</li>
                            <li>• عائشة - صوت إخباري</li>
                            <li>• نور - صوت عصري</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-blue-800">اللهجات المدعومة:</h4>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {['عام', 'خليجي', 'شامي', 'مصري', 'مغاربي', 'فصحى', 'إخباري', 'عصري'].map(accent => (
                          <Badge key={accent} variant="outline" className="text-xs">
                            {accent}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-blue-800">المميزات:</h4>
                      <ul className="text-xs space-y-1 text-blue-700 mt-2">
                        <li>✅ 16 صوت عالي الجودة</li>
                        <li>✅ دعم متعدد اللغات</li>
                        <li>✅ تحكم في السرعة والنبرة</li>
                        <li>✅ حفظ تلقائي في الأرشيف</li>
                        <li>✅ نشر مباشر في الصفحة الرئيسية</li>
                        <li>✅ تصدير بصيغة MP3 عالية الجودة</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      </div>
    </div>
  );
}