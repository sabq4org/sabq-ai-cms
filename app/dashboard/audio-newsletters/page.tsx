'use client';

import { useState, useEffect, useRef } from 'react';
import { Volume2, Mic, Play, Download, Trash2, Eye, EyeOff, Copy, Share2, Pause, RefreshCw, Clock, Calendar, Hash, User, AlertCircle, Loader2, CheckCircle, PlusCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

// أنواع البيانات
interface VoiceOption {
  voice_id: string;
  name: string;
  preview_url: string;
  labels: {
    accent?: string;
    description?: string;
    age?: string;
    gender?: string;
    use_case?: string;
  };
}

interface AudioNewsletter {
  id: string;
  title: string;
  content: string;
  audioUrl: string;
  duration: number;
  voice_id: string;
  voice_name: string;
  language: string;
  category?: string;
  is_published: boolean;
  is_featured: boolean;
  play_count: number;
  created_at: string;
  updated_at: string;
}

export default function AudioNewslettersPage() {
  // حالات القسم الأول - إنشاء النشرة
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('Amr');
  const [selectedLanguage, setSelectedLanguage] = useState('ar');
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [isFeatured, setIsFeatured] = useState(true);
  
  // حالات القسم الثاني - الأرشيف
  const [newsletters, setNewsletters] = useState<AudioNewsletter[]>([]);
  const [loadingNewsletters, setLoadingNewsletters] = useState(true);
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'status'>('date');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'unpublished'>('all');
  
  // حالات التشغيل
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [previewVoice, setPreviewVoice] = useState<string | null>(null);

  // تحميل الأصوات المتاحة
  useEffect(() => {
    loadVoices();
    loadNewsletters();
  }, []);

  const loadVoices = async () => {
    try {
      const response = await fetch('/api/audio/voices');
      if (response.ok) {
        const data = await response.json();
        setVoices(data.voices || []);
      }
    } catch (error) {
      console.error('خطأ في تحميل الأصوات:', error);
    }
  };

  const loadNewsletters = async () => {
    setLoadingNewsletters(true);
    try {
      const response = await fetch('/api/audio/newsletters');
      if (response.ok) {
        const data = await response.json();
        setNewsletters(data.newsletters || []);
      }
    } catch (error) {
      console.error('خطأ في تحميل النشرات:', error);
      toast.error('فشل تحميل النشرات');
    } finally {
      setLoadingNewsletters(false);
    }
  };

  // توليد النشرة الصوتية
  const handleGenerate = async () => {
    if (!content.trim()) {
      toast.error('يرجى إدخال محتوى النشرة');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/audio/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: content,
          voice_id: selectedVoice,
          language: selectedLanguage
        })
      });

      if (!response.ok) {
        throw new Error('فشل توليد النشرة');
      }

      const data = await response.json();
      setGeneratedAudio(data.audioUrl);
      setDuration(data.duration);
      toast.success('تم توليد النشرة بنجاح!');
    } catch (error) {
      console.error('خطأ في توليد النشرة:', error);
      toast.error('فشل توليد النشرة');
    } finally {
      setIsGenerating(false);
    }
  };

  // نشر النشرة
  const handlePublish = async () => {
    if (!generatedAudio) {
      toast.error('يرجى توليد النشرة أولاً');
      return;
    }

    try {
      const response = await fetch('/api/audio/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title || 'النشرة اليومية الصباحية',
          content,
          audioUrl: generatedAudio,
          duration,
          voice_id: selectedVoice,
          voice_name: voices.find(v => v.voice_id === selectedVoice)?.name || selectedVoice,
          language: selectedLanguage,
          category,
          is_featured: isFeatured
        })
      });

      if (!response.ok) {
        throw new Error('فشل نشر النشرة');
      }

      toast.success('تم نشر النشرة بنجاح!');
      
      // تنظيف النموذج
      setContent('');
      setTitle('');
      setCategory('');
      setGeneratedAudio(null);
      setDuration(0);
      
      // إعادة تحميل الأرشيف
      loadNewsletters();
    } catch (error) {
      console.error('خطأ في نشر النشرة:', error);
      toast.error('فشل نشر النشرة');
    }
  };

  // تشغيل معاينة الصوت
  const playVoicePreview = (voiceId: string) => {
    const voice = voices.find(v => v.voice_id === voiceId);
    if (voice?.preview_url) {
      if (previewVoice === voiceId) {
        // إيقاف المعاينة الحالية
        setPreviewVoice(null);
      } else {
        setPreviewVoice(voiceId);
        const audio = new Audio(voice.preview_url);
        audio.play();
        audio.onended = () => setPreviewVoice(null);
      }
    }
  };

  // تشغيل/إيقاف النشرة
  const togglePlay = (audioUrl: string, id: string) => {
    if (playingId === id && isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
        setPlayingId(id);
        setIsPlaying(true);
      }
    }
  };

  // تبديل حالة النشر
  const togglePublishStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/audio/newsletters/${id}/toggle-publish`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_published: !currentStatus })
      });

      if (!response.ok) {
        throw new Error('فشل تحديث حالة النشر');
      }

      toast.success(currentStatus ? 'تم إلغاء نشر النشرة' : 'تم نشر النشرة');
      loadNewsletters();
    } catch (error) {
      console.error('خطأ في تحديث حالة النشر:', error);
      toast.error('فشل تحديث حالة النشر');
    }
  };

  // حذف النشرة
  const deleteNewsletter = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه النشرة؟')) {
      return;
    }

    try {
      const response = await fetch(`/api/audio/newsletters/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('فشل حذف النشرة');
      }

      toast.success('تم حذف النشرة بنجاح');
      loadNewsletters();
    } catch (error) {
      console.error('خطأ في حذف النشرة:', error);
      toast.error('فشل حذف النشرة');
    }
  };

  // فلترة وترتيب النشرات
  const filteredAndSortedNewsletters = newsletters
    .filter(n => {
      if (filterStatus === 'published') return n.is_published;
      if (filterStatus === 'unpublished') return !n.is_published;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title, 'ar');
        case 'status':
          return (b.is_published ? 1 : 0) - (a.is_published ? 1 : 0);
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* الهيدر */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Volume2 className="w-8 h-8 text-red-600" />
            النشرات الإخبارية الصوتية
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            إدارة وإنشاء النشرات الصوتية بتقنية الذكاء الاصطناعي
          </p>
        </div>

        {/* القسم الأول: إنشاء نشرة جديدة */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <PlusCircle className="w-6 h-6 text-green-600" />
            إنشاء نشرة جديدة
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* النموذج */}
            <div className="space-y-4">
              {/* العنوان */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  عنوان النشرة (اختياري)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="النشرة اليومية الصباحية"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* المحتوى */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  محتوى النشرة
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="اكتب ملخص الأخبار هنا..."
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white resize-none"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {content.length} حرف
                </p>
              </div>

              {/* التصنيف */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  التصنيف (اختياري)
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">بدون تصنيف</option>
                  <option value="عام">عام</option>
                  <option value="اقتصادي">اقتصادي</option>
                  <option value="رياضي">رياضي</option>
                  <option value="ثقافي">ثقافي</option>
                  <option value="تقني">تقني</option>
                  <option value="صحي">صحي</option>
                </select>
              </div>

              {/* خيار العرض في البلوك الرئيسي */}
              <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <input
                  type="checkbox"
                  id="featured"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
                />
                <label htmlFor="featured" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                  عرض في البلوك الأحمر الرئيسي
                </label>
              </div>
            </div>

            {/* إعدادات الصوت */}
            <div className="space-y-4">
              {/* اختيار الصوت */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  اختر الصوت
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                  {voices.map((voice) => (
                    <button
                      key={voice.voice_id}
                      onClick={() => setSelectedVoice(voice.voice_id)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedVoice === voice.voice_id
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {voice.name}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            playVoicePreview(voice.voice_id);
                          }}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                        >
                          {previewVoice === voice.voice_id ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      {voice.labels.accent && (
                        <p className="text-xs text-gray-500 mt-1">{voice.labels.accent}</p>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* اختيار اللغة */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  اللغة
                </label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="ar">العربية</option>
                  <option value="en">English</option>
                </select>
              </div>

              {/* معاينة الصوت المولد */}
              {generatedAudio && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                    معاينة النشرة
                  </h3>
                  <audio
                    ref={audioRef}
                    src={generatedAudio}
                    controls
                    className="w-full"
                    onEnded={() => setIsPlaying(false)}
                  />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    المدة: {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')} دقيقة
                  </p>
                </div>
              )}

              {/* أزرار الإجراءات */}
              <div className="flex gap-3">
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !content.trim()}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      جارٍ التوليد...
                    </>
                  ) : (
                    <>
                      <Mic className="w-5 h-5" />
                      معاينة الصوت
                    </>
                  )}
                </button>

                <button
                  onClick={handlePublish}
                  disabled={!generatedAudio}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  نشر النشرة
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* القسم الثاني: أرشيف النشرات */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-600" />
              أرشيف النشرات الصوتية
            </h2>

            {/* خيارات الفلترة والترتيب */}
            <div className="flex items-center gap-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
              >
                <option value="all">جميع النشرات</option>
                <option value="published">المنشورة فقط</option>
                <option value="unpublished">غير المنشورة</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
              >
                <option value="date">حسب التاريخ</option>
                <option value="title">حسب العنوان</option>
                <option value="status">حسب الحالة</option>
              </select>
            </div>
          </div>

          {/* جدول النشرات */}
          {loadingNewsletters ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : filteredAndSortedNewsletters.length === 0 ? (
            <div className="text-center py-12">
              <Volume2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                لا توجد نشرات صوتية
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                      العنوان
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                      التاريخ
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                      التصنيف
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                      الحالة
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                      الاستماع
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedNewsletters.map((newsletter) => (
                    <tr
                      key={newsletter.id}
                      className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {newsletter.title}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                            {newsletter.content}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <p>{new Date(newsletter.created_at).toLocaleDateString('ar-SA')}</p>
                          <p className="text-xs">{new Date(newsletter.created_at).toLocaleTimeString('ar-SA')}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                          {newsletter.category || 'عام'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            newsletter.is_published
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                              : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                          }`}>
                            <span className={`w-2 h-2 rounded-full ${
                              newsletter.is_published ? 'bg-green-500' : 'bg-red-500'
                            }`} />
                            {newsletter.is_published ? 'منشورة' : 'غير منشورة'}
                          </span>
                          {newsletter.is_featured && (
                            <span className="text-xs text-red-600 dark:text-red-400">
                              مميزة
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-1 text-gray-600 dark:text-gray-400">
                          <Eye className="w-4 h-4" />
                          <span className="text-sm">{newsletter.play_count}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-2">
                          {/* تشغيل */}
                          <button
                            onClick={() => togglePlay(newsletter.audioUrl, newsletter.id)}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="تشغيل"
                          >
                            {playingId === newsletter.id && isPlaying ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </button>

                          {/* تحميل */}
                          <a
                            href={newsletter.audioUrl}
                            download
                            className="p-2 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
                            title="تحميل"
                          >
                            <Download className="w-4 h-4" />
                          </a>

                          {/* نشر/إلغاء النشر */}
                          <button
                            onClick={() => togglePublishStatus(newsletter.id, newsletter.is_published)}
                            className={`p-2 rounded-lg transition-colors ${
                              newsletter.is_published
                                ? 'text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                                : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                            }`}
                            title={newsletter.is_published ? 'إلغاء النشر' : 'نشر'}
                          >
                            {newsletter.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>

                          {/* حذف */}
                          <button
                            onClick={() => deleteNewsletter(newsletter.id)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="حذف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* مشغل الصوت المخفي */}
      <audio ref={audioRef} className="hidden" onEnded={() => setIsPlaying(false)} />
    </div>
  );
} 