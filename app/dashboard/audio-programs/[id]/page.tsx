'use client';

import { useState, useEffect, use } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Plus, Play, Pause, Download, Trash2, Edit, 
  Calendar, Clock, Mic, Eye, CheckCircle, AlertCircle, 
  BarChart3, Volume2, RefreshCw, Sparkles
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Episode {
  id: string;
  program_id: string;
  episode_number?: number;
  title: string;
  content: string;
  audio_url?: string;
  duration?: number;
  voice_model: string;
  scheduled_at?: string;
  published_at?: string;
  status: string;
  generation_status: string;
  views: number;
  created_at: string;
  program?: {
    id: string;
    name: string;
    slug: string;
  };
}

interface Program {
  id: string;
  name: string;
  description?: string;
  short_description?: string;
  logo_url?: string;
  thumbnail_url?: string;
  preferred_duration?: number;
  voice_model: string;
  display_position: string;
  display_order: number;
  status: string;
  slug: string;
  created_at: string;
  episodes?: Episode[];
  stats?: {
    totalEpisodes: number;
    publishedEpisodes: number;
    totalViews: number;
  };
}

export default function ProgramDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { user } = useAuth();
  const router = useRouter();
  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEpisode, setEditingEpisode] = useState<Episode | null>(null);
  const [generatingAudio, setGeneratingAudio] = useState<string | null>(null);

  useEffect(() => {
    fetchProgram();
  }, [resolvedParams.id]);

  const fetchProgram = async () => {
    try {
      const response = await fetch(`/api/audio/programs/${resolvedParams.id}`);
      const data = await response.json();
      
      if (data.success) {
        setProgram(data.program);
      } else {
        toast.error('فشل في جلب البرنامج');
        router.push('/dashboard/audio-programs');
      }
    } catch (error) {
      console.error('Error fetching program:', error);
      toast.error('حدث خطأ في جلب البرنامج');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAudio = async (episodeId: string) => {
    setGeneratingAudio(episodeId);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/audio/episodes/${episodeId}/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('تم توليد الصوت بنجاح');
        fetchProgram(); // إعادة جلب البيانات
      } else {
        const error = await response.json();
        toast.error(error.error || 'فشل في توليد الصوت');
      }
    } catch (error) {
      console.error('Error generating audio:', error);
      toast.error('حدث خطأ في توليد الصوت');
    } finally {
      setGeneratingAudio(null);
    }
  };

  const handleDeleteEpisode = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الحلقة؟')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/audio/episodes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('تم حذف الحلقة بنجاح');
        fetchProgram();
      } else {
        toast.error('فشل في حذف الحلقة');
      }
    } catch (error) {
      console.error('Error deleting episode:', error);
      toast.error('حدث خطأ في حذف الحلقة');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      draft: 'bg-gray-100 text-gray-800',
      scheduled: 'bg-blue-100 text-blue-800',
      processing: 'bg-yellow-100 text-yellow-800',
      published: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800'
    };

    const labels = {
      draft: 'مسودة',
      scheduled: 'مجدولة',
      processing: 'قيد المعالجة',
      published: 'منشورة',
      failed: 'فشلت'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[status as keyof typeof badges] || badges.draft}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  const getGenerationBadge = (status: string) => {
    const badges = {
      pending: 'bg-gray-100 text-gray-800',
      generating: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800'
    };

    const labels = {
      pending: 'في الانتظار',
      generating: 'جاري التوليد',
      completed: 'مكتمل',
      failed: 'فشل'
    };

    const icons = {
      pending: <Clock className="w-3 h-3" />,
      generating: <RefreshCw className="w-3 h-3 animate-spin" />,
      completed: <CheckCircle className="w-3 h-3" />,
      failed: <AlertCircle className="w-3 h-3" />
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${badges[status as keyof typeof badges] || badges.pending}`}>
        {icons[status as keyof typeof icons]}
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  if (loading || !program) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* الهيدر */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/audio-programs"
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            {program.logo_url && (
              <img
                src={program.logo_url}
                alt={program.name}
                className="w-12 h-12 rounded-full"
              />
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{program.name}</h1>
              {program.short_description && (
                <p className="text-gray-600 dark:text-gray-400 mt-1">{program.short_description}</p>
              )}
            </div>
          </div>
        </div>
        
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          إضافة حلقة جديدة
        </button>
      </div>

      {/* إحصائيات البرنامج */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">إجمالي الحلقات</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{program.stats?.totalEpisodes || 0}</p>
            </div>
            <Mic className="w-8 h-8 text-red-500 opacity-20" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">الحلقات المنشورة</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{program.stats?.publishedEpisodes || 0}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">إجمالي الاستماع</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {(program.stats?.totalViews || 0).toLocaleString()}
              </p>
            </div>
            <Volume2 className="w-8 h-8 text-blue-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">متوسط المشاهدات</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {program.episodes?.length ? 
                  Math.round((program.stats?.totalViews || 0) / program.episodes.length).toLocaleString() 
                  : 0
                }
              </p>
            </div>
            <BarChart3 className="w-8 h-8 text-purple-500 opacity-20" />
          </div>
        </div>
      </div>

      {/* قائمة الحلقات */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">حلقات البرنامج</h2>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {program.episodes?.map((episode) => (
            <div key={episode.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      الحلقة {episode.episode_number}
                    </span>
                    {getStatusBadge(episode.status)}
                    {getGenerationBadge(episode.generation_status)}
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {episode.title}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                    {episode.content}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    {episode.audio_url && (
                      <>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {episode.duration ? `${Math.floor(episode.duration / 60)}:${(episode.duration % 60).toString().padStart(2, '0')}` : 'غير محدد'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {episode.views.toLocaleString()} استماع
                        </span>
                      </>
                    )}
                    {episode.scheduled_at && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        مجدولة: {new Date(episode.scheduled_at).toLocaleDateString('ar-SA')}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mr-4">
                  {/* زر توليد الصوت */}
                  {!episode.audio_url && episode.generation_status !== 'completed' && (
                    <button
                      onClick={() => handleGenerateAudio(episode.id)}
                      disabled={generatingAudio === episode.id}
                      className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      title="توليد الصوت"
                    >
                      {generatingAudio === episode.id ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      ) : (
                        <Sparkles className="w-5 h-5" />
                      )}
                    </button>
                  )}
                  
                  {/* زر التشغيل/التحميل */}
                  {episode.audio_url && (
                    <>
                      <button
                        className="p-2 text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                        title="تشغيل"
                      >
                        <Play className="w-5 h-5" />
                      </button>
                      <a
                        href={episode.audio_url}
                        download
                        className="p-2 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        title="تحميل"
                      >
                        <Download className="w-5 h-5" />
                      </a>
                    </>
                  )}
                  
                  {/* زر التعديل */}
                  <button
                    onClick={() => setEditingEpisode(episode)}
                    className="p-2 text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                    title="تعديل"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  
                  {/* زر الحذف */}
                  <button
                    onClick={() => handleDeleteEpisode(episode.id)}
                    className="p-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    title="حذف"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {(!program.episodes || program.episodes.length === 0) && (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400">
              <Mic className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>لا توجد حلقات بعد</p>
            </div>
          )}
        </div>
      </div>

      {/* مودال إنشاء/تعديل الحلقة */}
      {(showCreateModal || editingEpisode) && (
        <CreateEditEpisodeModal
          programId={program.id}
          programVoiceModel={program.voice_model}
          episode={editingEpisode}
          onClose={() => {
            setShowCreateModal(false);
            setEditingEpisode(null);
          }}
          onSave={() => {
            fetchProgram();
            setShowCreateModal(false);
            setEditingEpisode(null);
          }}
        />
      )}
    </div>
  );
}

// مكون مودال إنشاء/تعديل الحلقة
function CreateEditEpisodeModal({
  programId,
  programVoiceModel,
  episode,
  onClose,
  onSave
}: {
  programId: string;
  programVoiceModel: string;
  episode?: Episode | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const [formData, setFormData] = useState({
    title: episode?.title || '',
    content: episode?.content || '',
    episode_number: episode?.episode_number || undefined,
    voice_model: episode?.voice_model || programVoiceModel,
    scheduled_at: episode?.scheduled_at ? new Date(episode.scheduled_at).toISOString().slice(0, 16) : '',
    auto_generate: false,
    auto_publish: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const payload = {
        ...formData,
        program_id: programId,
        scheduled_at: formData.scheduled_at || null
      };

      const response = await fetch(
        episode ? `/api/audio/episodes/${episode.id}` : '/api/audio/episodes',
        {
          method: episode ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        }
      );

      if (response.ok) {
        toast.success(episode ? 'تم تحديث الحلقة بنجاح' : 'تم إنشاء الحلقة بنجاح');
        onSave();
      } else {
        const error = await response.json();
        toast.error(error.error || 'حدث خطأ');
      }
    } catch (error) {
      console.error('Error saving episode:', error);
      toast.error('حدث خطأ في حفظ الحلقة');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            {episode ? 'تعديل الحلقة' : 'إنشاء حلقة جديدة'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  رقم الحلقة
                </label>
                <input
                  type="number"
                  value={formData.episode_number || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    episode_number: e.target.value ? parseInt(e.target.value) : undefined 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
                  placeholder="سيتم التعيين تلقائياً"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  الصوت
                </label>
                <select
                  value={formData.voice_model}
                  onChange={(e) => setFormData({ ...formData, voice_model: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="bradford">Bradford (ذكر - عربي)</option>
                  <option value="rachel">Rachel (أنثى - إنجليزي)</option>
                  <option value="alice">Alice (أنثى)</option>
                  <option value="bill">Bill (ذكر)</option>
                  <option value="chris">Chris (ذكر)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                عنوان الحلقة *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                محتوى الحلقة *
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
                rows={6}
                required
                placeholder="اكتب النص الذي سيتم تحويله إلى صوت..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                جدولة النشر
              </label>
              <input
                type="datetime-local"
                value={formData.scheduled_at}
                onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
              />
              {formData.scheduled_at && (
                <div className="mt-2 space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.auto_generate}
                      onChange={(e) => setFormData({ ...formData, auto_generate: e.target.checked })}
                      className="rounded border-gray-300 dark:border-gray-600 text-red-500 focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      توليد الصوت تلقائياً قبل موعد النشر
                    </span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.auto_publish}
                      onChange={(e) => setFormData({ ...formData, auto_publish: e.target.checked })}
                      className="rounded border-gray-300 dark:border-gray-600 text-red-500 focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      نشر الحلقة تلقائياً في الموعد المحدد
                    </span>
                  </label>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
              >
                {episode ? 'تحديث' : 'إنشاء'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 