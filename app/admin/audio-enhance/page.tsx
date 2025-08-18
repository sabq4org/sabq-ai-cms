'use client';

import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, 
  CheckCircle, 
  Loader2, 
  Volume2, 
  Download, 
  Play, 
  Activity, 
  Trash2, 
  Archive, 
  Home, 
  RotateCcw, 
  Users, 
  Globe, 
  Filter, 
  Key, 
  Settings,
  ArrowUpRight,
  Mic,
  Clock,
  Zap,
  Sparkles,
  HeadphonesIcon,
  Pause,
  Plus
} from 'lucide-react';
import toast from 'react-hot-toast';

// إعدادات الصفحة العربية
const pageMetadata = {
  title: "استوديو الإنتاج الصوتي الذكي",
  description: "نظام متطور لتوليد وإدارة النشرات الصوتية بتقنية الذكاء الاصطناعي",
  direction: "rtl" as const
};

// 16 صوت متنوع من ElevenLabs
const ENHANCED_VOICES = [
  // أصوات رجالية عربية ومتنوعة
  { id: 'pNInz6obpgDQGcFmaJgB', name: 'آدم - صوت رجالي شاب', gender: 'male', accent: 'عام', language: 'ar' },
  { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'جوش - صوت رجالي عميق', gender: 'male', accent: 'خليجي', language: 'ar' },
  { id: 'ErXwobaYiN019PkySvjV', name: 'أنطوني - صوت رجالي ودود', gender: 'male', accent: 'شامي', language: 'ar' },
  { id: 'VR6AewLTigWG4xSOukaG', name: 'أرنولد - صوت رجالي قوي', gender: 'male', accent: 'مصري', language: 'ar' },
  { id: 'n8TWbmNgNErEQxqTvzVq', name: 'كلايد - صوت رجالي حماسي', gender: 'male', accent: 'مغاربي', language: 'ar' },
  { id: 'yoZ06aMxZJJ28mfd3POQ', name: 'سام - صوت محايد رجالي', gender: 'male', accent: 'عام', language: 'ar' },
  { id: 'bVMeCyTHy58xNoL34h3p', name: 'أحمد - صوت رجالي كلاسيكي', gender: 'male', accent: 'فصحى', language: 'ar' },
  { id: '29vD33N1CtxCmqQRPOHJ', name: 'محمد - صوت رجالي إخباري', gender: 'male', accent: 'إخباري', language: 'ar' },
  
  // أصوات نسائية عربية ومتنوعة
  { id: '21m00Tcm4TlvDq8ikWAM', name: 'راشيل - صوت نسائي واضح', gender: 'female', accent: 'عام', language: 'ar' },
  { id: 'AZnzlk1XvdvUeBnXmlld', name: 'دومي - صوت نسائي نشيط', gender: 'female', accent: 'خليجي', language: 'ar' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'بيلا - صوت نسائي ناعم', gender: 'female', accent: 'شامي', language: 'ar' },
  { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'إيلي - صوت نسائي شاب', gender: 'female', accent: 'مصري', language: 'ar' },
  { id: 'piTKgcLEGmPE4e6mEKli', name: 'نيكول - صوت نسائي محترف', gender: 'female', accent: 'مغاربي', language: 'ar' },
  { id: 'ThT5KcBeYPX3keUQqHPh', name: 'فاطمة - صوت نسائي كلاسيكي', gender: 'female', accent: 'فصحى', language: 'ar' },
  { id: 'XB0fDUnXU5powFXDhCwa', name: 'عائشة - صوت نسائي إخباري', gender: 'female', accent: 'إخباري', language: 'ar' },
  { id: 'pqHfZKP75CvOlQylNhV4', name: 'نور - صوت نسائي عصري', gender: 'female', accent: 'عصري', language: 'ar' }
];

const LANGUAGES = [
  { id: 'arabic', name: 'العربية', flag: '🇸🇦' },
  { id: 'english', name: 'English', flag: '🇺🇸' },
  { id: 'french', name: 'Français', flag: '🇫🇷' },
  { id: 'spanish', name: 'Español', flag: '🇪🇸' }
];

// مكون بطاقة إحصائية
const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
}: {
  title: string;
  value: string | number;
  icon: any;
  trend?: { value: number; label: string };
}) => {
  return (
    <div className="card" style={{ cursor: 'pointer' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          width: '48px',
          height: '48px',
          background: 'hsl(var(--accent) / 0.1)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'hsl(var(--accent))'
        }}>
          <Icon style={{ width: '24px', height: '24px' }} />
        </div>
        
        <div style={{ flex: 1 }}>
          <div className="text-xs text-muted" style={{ marginBottom: '4px' }}>{title}</div>
          <div className="heading-3" style={{ margin: '4px 0', color: 'hsl(var(--accent))' }}>
            {value}
          </div>
          {trend && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ArrowUpRight style={{ 
                width: '14px', 
                height: '14px',
                color: '#10b981'
              }} />
              <span className="text-xs" style={{ color: '#10b981' }}>
                {trend.value}%
              </span>
              <span className="text-xs text-muted">{trend.label}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

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
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  is_featured: boolean;
  language: string;
  created_at: string;
  updated_at: string;
  tags?: string[];
  play_count?: number;
}

export default function AdvancedAudioEnhancePage() {
  const [summary, setSummary] = useState('');
  const [voice, setVoice] = useState('pNInz6obpgDQGcFmaJgB'); 
  const [filename, setFilename] = useState('');
  const [language, setLanguage] = useState('arabic');
  const [title, setTitle] = useState('');
  const [addToHomepage, setAddToHomepage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [bulletins, setBulletins] = useState<AudioBulletin[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'generate' | 'archive' | 'settings'>('generate');
  const [playingPreview, setPlayingPreview] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');

  // تحديد اسم الملف تلقائياً
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
  }, []);

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

  const saveBulletins = (bulletins: AudioBulletin[]) => {
    try {
      localStorage.setItem('audio_bulletins', JSON.stringify(bulletins));
      setBulletins(bulletins);
    } catch (error) {
      console.error('خطأ في حفظ النشرات:', error);
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

  // توليد الصوت
  const generateAudio = async () => {
    if (!summary.trim() || !title.trim()) {
      toast.error('يرجى إدخال العنوان والمحتوى');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);
    
    const selectedVoice = ENHANCED_VOICES.find(v => v.id === voice);
    const toastId = toast.loading('جاري توليد النشرة الصوتية...');

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
          language,
          title: title.trim(),
          voice_name: selectedVoice?.name || 'غير محدد',
          tags
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'خطأ في توليد الصوت');
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
        tags,
        play_count: 0
      };

      // حفظ النشرة
      const updatedBulletins = [newBulletin, ...bulletins];
      saveBulletins(updatedBulletins);
      
      toast.success('تم توليد النشرة بنجاح!', { id: toastId });
      
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  // تشغيل الصوت
  const playAudio = (url: string) => {
    const audio = new Audio(url);
    audio.play();
    toast.success('جاري تشغيل النشرة الصوتية');
  };

  // معاينة الصوت
  const previewVoice = async (voiceId: string) => {
    setPlayingPreview(voiceId);
    // محاكاة تشغيل معاينة
    setTimeout(() => {
      setPlayingPreview(null);
      toast.success('انتهت معاينة الصوت');
    }, 3000);
  };

  // إحصائيات النشرات
  const stats = {
    total: bulletins.length,
    published: bulletins.filter(b => b.status === 'PUBLISHED').length,
    draft: bulletins.filter(b => b.status === 'DRAFT').length,
    archived: bulletins.filter(b => b.status === 'ARCHIVED').length,
    featured: bulletins.filter(b => b.is_featured).length
  };

  // تصفية النشرات
  const filteredBulletins = bulletins.filter(bulletin => {
    const statusMatch = filterStatus === 'all' || bulletin.status.toLowerCase() === filterStatus;
    const searchMatch = searchTerm === '' || 
      bulletin.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bulletin.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    return statusMatch && searchMatch;
  });

  return (
    <div style={{ minHeight: '100vh', background: 'hsl(var(--bg))', padding: '40px 20px' }} dir="rtl">
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* رسالة الترحيب */}
        <div className="card card-accent" style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                background: 'linear-gradient(135deg, hsl(var(--accent)), hsl(var(--accent-hover)))',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Mic style={{ width: '28px', height: '28px', color: 'white' }} />
              </div>
              <div>
                <h1 className="heading-2" style={{ marginBottom: '4px' }}>
                  {pageMetadata.title}
                </h1>
                <p className="text-muted" style={{ fontSize: '14px' }}>
                  {pageMetadata.description}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-outline">
                <Settings style={{ width: '16px', height: '16px' }} />
                إعدادات API
              </button>
              <button 
                className="btn"
                style={{ background: 'hsl(var(--accent))', color: 'white' }}
                onClick={() => setActiveTab('generate')}
              >
                <Plus style={{ width: '16px', height: '16px' }} />
                نشرة جديدة
              </button>
            </div>
          </div>
        </div>

        {/* بطاقات الإحصائيات */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '16px',
          marginBottom: '32px'
        }}>
          <StatCard
            title="إجمالي النشرات"
            value={stats.total}
            icon={HeadphonesIcon}
            trend={{ value: 12, label: "هذا الشهر" }}
          />
          <StatCard
            title="منشورة"
            value={stats.published}
            icon={CheckCircle}
          />
          <StatCard
            title="مسودات"
            value={stats.draft}
            icon={Clock}
          />
          <StatCard
            title="في الصفحة الرئيسية"
            value={stats.featured}
            icon={Home}
          />
        </div>

        {/* التبويبات */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid hsl(var(--line))' }}>
            <button
              onClick={() => setActiveTab('generate')}
              className={`btn btn-ghost ${activeTab === 'generate' ? 'active' : ''}`}
              style={{
                borderRadius: '0',
                borderBottom: activeTab === 'generate' ? '2px solid hsl(var(--accent))' : 'none',
                color: activeTab === 'generate' ? 'hsl(var(--accent))' : 'inherit'
              }}
            >
              <Sparkles style={{ width: '16px', height: '16px' }} />
              توليد نشرة جديدة
            </button>
            <button
              onClick={() => setActiveTab('archive')}
              className={`btn btn-ghost ${activeTab === 'archive' ? 'active' : ''}`}
              style={{
                borderRadius: '0',
                borderBottom: activeTab === 'archive' ? '2px solid hsl(var(--accent))' : 'none',
                color: activeTab === 'archive' ? 'hsl(var(--accent))' : 'inherit'
              }}
            >
              <Archive style={{ width: '16px', height: '16px' }} />
              أرشيف النشرات ({stats.total})
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`btn btn-ghost ${activeTab === 'settings' ? 'active' : ''}`}
              style={{
                borderRadius: '0',
                borderBottom: activeTab === 'settings' ? '2px solid hsl(var(--accent))' : 'none',
                color: activeTab === 'settings' ? 'hsl(var(--accent))' : 'inherit'
              }}
            >
              <Settings style={{ width: '16px', height: '16px' }} />
              إعدادات الخدمة
            </button>
          </div>
        </div>

        {/* محتوى التبويبات */}
        {activeTab === 'generate' && (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">
                  <Zap style={{ width: '20px', height: '20px' }} />
                  توليد نشرة صوتية جديدة
                </h3>
              </div>
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* العنوان */}
                <div>
                  <label className="label" style={{ marginBottom: '8px', display: 'block' }}>
                    عنوان النشرة *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="نشرة أخبار اليوم"
                    className="input"
                    style={{ width: '100%' }}
                  />
                </div>

                {/* المحتوى */}
                <div>
                  <label className="label" style={{ marginBottom: '8px', display: 'block' }}>
                    محتوى النشرة *
                  </label>
                  <textarea
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="اكتب محتوى النشرة الصوتية هنا..."
                    rows={8}
                    className="input"
                    style={{ width: '100%', minHeight: '200px', resize: 'vertical' }}
                  />
                  <p className="text-xs text-muted" style={{ marginTop: '4px' }}>
                    الطول: {summary.length} حرف (الحد الأقصى: 2500)
                  </p>
                </div>

                {/* اللغة */}
                <div>
                  <label className="label" style={{ marginBottom: '8px', display: 'block' }}>اللغة</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.id}
                        onClick={() => setLanguage(lang.id)}
                        className={`btn ${language === lang.id ? '' : 'btn-outline'}`}
                        style={language === lang.id ? { background: 'hsl(var(--accent))', color: 'white' } : {}}
                      >
                        {lang.flag} {lang.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* العلامات */}
                <div>
                  <label className="label" style={{ marginBottom: '8px', display: 'block' }}>العلامات</label>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <input
                      type="text"
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                      placeholder="أضف علامة..."
                      className="input"
                      style={{ flex: 1 }}
                    />
                    <button
                      onClick={addTag}
                      className="btn btn-outline"
                    >
                      إضافة
                    </button>
                  </div>
                  {tags.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {tags.map((tag, index) => (
                        <span
                          key={index}
                          className="chip chip-info"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          {tag}
                          <button
                            onClick={() => removeTag(tag)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* خيار النشر */}
                <div style={{ 
                  background: 'hsl(var(--accent) / 0.05)', 
                  padding: '16px', 
                  borderRadius: '12px',
                  border: '1px solid hsl(var(--accent) / 0.2)'
                }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={addToHomepage}
                      onChange={(e) => setAddToHomepage(e.target.checked)}
                      style={{ width: '20px', height: '20px' }}
                    />
                    <span className="text-sm">
                      <Home style={{ width: '16px', height: '16px', display: 'inline', marginLeft: '4px' }} />
                      نشر في الصفحة الرئيسية مباشرة
                    </span>
                  </label>
                </div>

                {/* أزرار الإجراءات */}
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={generateAudio}
                    disabled={isLoading || !summary.trim() || !title.trim()}
                    className="btn"
                    style={{ 
                      flex: 1,
                      background: 'hsl(var(--accent))',
                      color: 'white',
                      opacity: isLoading || !summary.trim() || !title.trim() ? 0.6 : 1
                    }}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="animate-spin" style={{ width: '16px', height: '16px' }} />
                        جاري التوليد...
                      </>
                    ) : (
                      <>
                        <Volume2 style={{ width: '16px', height: '16px' }} />
                        توليد النشرة الصوتية
                      </>
                    )}
                  </button>
                </div>

                {/* عرض الأخطاء */}
                {error && (
                  <div className="alert alert-danger">
                    <AlertCircle style={{ width: '16px', height: '16px' }} />
                    {error}
                  </div>
                )}

                {/* عرض النتائج */}
                {result && (
                  <div style={{ 
                    background: '#10b98110', 
                    border: '1px solid #10b981',
                    borderRadius: '12px',
                    padding: '20px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                      <CheckCircle style={{ width: '24px', height: '24px', color: '#10b981' }} />
                      <h4 className="heading-3" style={{ color: '#10b981' }}>
                        تم توليد النشرة بنجاح!
                      </h4>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '16px' }}>
                      <div>
                        <span className="text-sm text-muted">اسم الملف:</span>
                        <p className="text-sm">{result.filename}</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted">الحجم:</span>
                        <p className="text-sm">{(result.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => playAudio(result.url)}
                        className="btn btn-sm"
                        style={{ background: '#10b981', color: 'white' }}
                      >
                        <Play style={{ width: '14px', height: '14px' }} />
                        تشغيل
                      </button>
                      <a href={result.url} download={result.filename}>
                        <button className="btn btn-sm btn-outline">
                          <Download style={{ width: '14px', height: '14px' }} />
                          تحميل
                        </button>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* اختيار الصوت */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">
                  <Mic style={{ width: '20px', height: '20px' }} />
                  اختر الصوت (16 صوت متاح)
                </h3>
              </div>
              <div style={{ padding: '16px', maxHeight: '600px', overflow: 'auto' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {ENHANCED_VOICES.map((voiceOption) => (
                    <div
                      key={voiceOption.id}
                      onClick={() => setVoice(voiceOption.id)}
                      style={{
                        padding: '12px',
                        background: voice === voiceOption.id ? 'hsl(var(--accent) / 0.1)' : 'transparent',
                        border: voice === voiceOption.id ? '2px solid hsl(var(--accent))' : '1px solid hsl(var(--line))',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <p className="text-sm" style={{ fontWeight: '600', marginBottom: '4px' }}>
                            {voiceOption.name}
                          </p>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <span className={`chip chip-sm ${voiceOption.gender === 'male' ? 'chip-info' : 'chip-warning'}`}>
                              {voiceOption.gender === 'male' ? '👨 ذكر' : '👩 أنثى'}
                            </span>
                            <span className="chip chip-sm chip-outline">
                              {voiceOption.accent}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            previewVoice(voiceOption.id);
                          }}
                          disabled={playingPreview === voiceOption.id}
                          className="btn btn-sm btn-ghost"
                        >
                          {playingPreview === voiceOption.id ? (
                            <Pause style={{ width: '16px', height: '16px' }} />
                          ) : (
                            <Volume2 style={{ width: '16px', height: '16px' }} />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'archive' && (
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <Archive style={{ width: '20px', height: '20px' }} />
                أرشيف النشرات الصوتية
              </h3>
            </div>
            <div style={{ padding: '24px' }}>
              {/* أدوات البحث والتصفية */}
              <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                <input
                  type="text"
                  placeholder="ابحث في النشرات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input"
                  style={{ flex: 1 }}
                />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="input"
                  style={{ width: '200px' }}
                >
                  <option value="all">جميع الحالات</option>
                  <option value="published">منشورة</option>
                  <option value="draft">مسودة</option>
                  <option value="archived">مؤرشفة</option>
                </select>
              </div>

              {/* قائمة النشرات */}
              {filteredBulletins.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px' }}>
                  <Archive style={{ width: '64px', height: '64px', margin: '0 auto 16px', color: 'hsl(var(--muted))' }} />
                  <h3 className="heading-3" style={{ marginBottom: '8px' }}>لا توجد نشرات</h3>
                  <p className="text-muted">
                    {bulletins.length === 0 
                      ? 'لم يتم إنشاء أي نشرة بعد' 
                      : 'لا توجد نشرات تطابق معايير البحث'}
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {filteredBulletins.map((bulletin) => {
                    const selectedVoice = ENHANCED_VOICES.find(v => v.id === bulletin.voice_id);
                    return (
                      <div key={bulletin.id} className="card" style={{ padding: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                              <h4 className="heading-3">{bulletin.title}</h4>
                              {bulletin.is_featured && (
                                <span className="chip chip-sm chip-danger">
                                  <Home style={{ width: '12px', height: '12px' }} />
                                  في الصفحة الرئيسية
                                </span>
                              )}
                              <span className={`chip chip-sm ${
                                bulletin.status === 'PUBLISHED' ? 'chip-success' :
                                bulletin.status === 'DRAFT' ? 'chip-warning' :
                                'chip-outline'
                              }`}>
                                {bulletin.status === 'PUBLISHED' ? 'منشورة' :
                                 bulletin.status === 'DRAFT' ? 'مسودة' : 'مؤرشفة'}
                              </span>
                            </div>
                            
                            <p className="text-muted" style={{ marginBottom: '12px' }}>
                              {bulletin.content.substring(0, 150)}...
                            </p>
                            
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                              <span className="text-xs text-muted">
                                <Mic style={{ width: '14px', height: '14px', display: 'inline' }} />
                                {selectedVoice?.name}
                              </span>
                              <span className="text-xs text-muted">
                                <Clock style={{ width: '14px', height: '14px', display: 'inline' }} />
                                {new Date(bulletin.created_at).toLocaleDateString('ar-SA')}
                              </span>
                              <span className="text-xs text-muted">
                                {(bulletin.size / 1024).toFixed(1)} KB
                              </span>
                            </div>
                          </div>
                          
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={() => playAudio(bulletin.audio_url)}
                              className="btn btn-sm btn-outline"
                            >
                              <Play style={{ width: '14px', height: '14px' }} />
                            </button>
                            <a href={bulletin.audio_url} download={bulletin.filename}>
                              <button className="btn btn-sm btn-outline">
                                <Download style={{ width: '14px', height: '14px' }} />
                              </button>
                            </a>
                            <button className="btn btn-sm btn-ghost" style={{ color: 'hsl(var(--danger))' }}>
                              <Trash2 style={{ width: '14px', height: '14px' }} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <Key style={{ width: '20px', height: '20px' }} />
                إعدادات خدمة ElevenLabs
              </h3>
            </div>
            <div style={{ padding: '24px' }}>
              <div className="alert alert-info" style={{ marginBottom: '24px' }}>
                <Activity style={{ width: '16px', height: '16px' }} />
                <div>
                  <h4 style={{ marginBottom: '8px' }}>كيفية إعداد مفتاح API</h4>
                  <ol style={{ paddingRight: '20px', marginTop: '8px' }}>
                    <li>انتقل إلى الملف <code style={{ background: 'hsl(var(--muted) / 0.1)', padding: '2px 6px', borderRadius: '4px' }}>.env.local</code></li>
                    <li>أضف السطر التالي:
                      <pre style={{ 
                        background: 'hsl(var(--muted) / 0.1)', 
                        padding: '12px', 
                        borderRadius: '8px', 
                        marginTop: '8px',
                        direction: 'ltr',
                        textAlign: 'left'
                      }}>
                        ELEVENLABS_API_KEY=sk_your_api_key_here
                      </pre>
                    </li>
                    <li>احفظ الملف وأعد تشغيل الخادم</li>
                  </ol>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div className="card" style={{ background: 'hsl(var(--accent) / 0.05)' }}>
                  <div style={{ padding: '20px' }}>
                    <h4 className="heading-3" style={{ marginBottom: '12px' }}>المميزات المتاحة</h4>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircle style={{ width: '16px', height: '16px', color: '#10b981' }} />
                        16 صوت عالي الجودة
                      </li>
                      <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircle style={{ width: '16px', height: '16px', color: '#10b981' }} />
                        دعم متعدد اللغات
                      </li>
                      <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircle style={{ width: '16px', height: '16px', color: '#10b981' }} />
                        تحكم في السرعة والنبرة
                      </li>
                      <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircle style={{ width: '16px', height: '16px', color: '#10b981' }} />
                        تصدير بصيغة MP3
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="card">
                  <div style={{ padding: '20px' }}>
                    <h4 className="heading-3" style={{ marginBottom: '12px' }}>اللهجات المدعومة</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {['عام', 'خليجي', 'شامي', 'مصري', 'مغاربي', 'فصحى', 'إخباري', 'عصري'].map(accent => (
                        <span key={accent} className="chip chip-sm chip-outline">
                          {accent}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
