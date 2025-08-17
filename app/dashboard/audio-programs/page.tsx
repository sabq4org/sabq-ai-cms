'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Plus, Mic, Eye, Edit, Trash2, Settings, BarChart3, Calendar, Users, Clock, Activity } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

interface AudioProgram {
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
  stats?: {
    totalEpisodes: number;
    publishedEpisodes: number;
    totalViews: number;
  };
  episodes?: any[];
}

export default function AudioProgramsPage() {
  const { user } = useAuth();
  const [programs, setPrograms] = useState<AudioProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProgram, setEditingProgram] = useState<AudioProgram | null>(null);

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const response = await fetch('/api/audio/programs');
      const data = await response.json();
      
      if (data.success) {
        setPrograms(data.programs);
      } else {
        toast.error('فشل في جلب البرامج');
      }
    } catch (error) {
      console.error('Error fetching programs:', error);
      toast.error('حدث خطأ في جلب البرامج');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProgram = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا البرنامج؟')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/audio/programs/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('تم حذف البرنامج بنجاح');
        fetchPrograms();
      } else {
        toast.error('فشل في حذف البرنامج');
      }
    } catch (error) {
      console.error('Error deleting program:', error);
      toast.error('حدث خطأ في حذف البرنامج');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      active: 'bg-green-100 text-green-800',
      paused: 'bg-yellow-100 text-yellow-800',
      inactive: 'bg-gray-100 text-gray-800'
    };

    const labels = {
      active: 'نشط',
      paused: 'متوقف',
      inactive: 'غير نشط'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[status as keyof typeof badges] || badges.inactive}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  const getPositionLabel = (position: string) => {
    const labels = {
      header: 'الهيدر',
      homepage_card: 'كارد الصفحة الرئيسية',
      sidebar: 'الشريط الجانبي'
    };
    return labels[position as keyof typeof labels] || position;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* الهيدر */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">البرامج الصوتية</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">إدارة البرامج والحلقات الصوتية</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          إضافة برنامج جديد
        </button>
      </div>

      {/* إحصائيات عامة */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">إجمالي البرامج</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{programs.length}</p>
            </div>
            <Mic className="w-8 h-8 text-red-500 opacity-20" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">البرامج النشطة</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {programs.filter(p => p.status === 'active').length}
              </p>
            </div>
            <Activity className="w-8 h-8 text-green-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">إجمالي الحلقات</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {programs.reduce((acc, p) => acc + (p.stats?.totalEpisodes || 0), 0)}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-blue-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">إجمالي المشاهدات</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {programs.reduce((acc, p) => acc + (p.stats?.totalViews || 0), 0).toLocaleString()}
              </p>
            </div>
            <Eye className="w-8 h-8 text-purple-500 opacity-20" />
          </div>
        </div>
      </div>

      {/* قائمة البرامج */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">البرامج الصوتية</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  البرنامج
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  الحالة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  الموقع
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  الحلقات
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  المشاهدات
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {programs.map((program) => (
                <tr key={program.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {program.logo_url && (
                        <img
                          src={program.logo_url}
                          alt={program.name}
                          className="w-10 h-10 rounded-full ml-3"
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {program.name}
                        </div>
                        {program.short_description && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {program.short_description}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(program.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {getPositionLabel(program.display_position)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    <div className="flex items-center gap-2">
                      <span>{program.stats?.publishedEpisodes || 0}</span>
                      <span className="text-gray-400">/</span>
                      <span className="text-gray-500">{program.stats?.totalEpisodes || 0}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {(program.stats?.totalViews || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/dashboard/audio-programs/${program.id}`}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <Eye className="w-5 h-5" />
                      </Link>
                      <button
                        onClick={() => setEditingProgram(program)}
                        className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteProgram(program.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* مودال إنشاء/تعديل البرنامج */}
      {(showCreateModal || editingProgram) && (
        <CreateEditProgramModal
          program={editingProgram}
          onClose={() => {
            setShowCreateModal(false);
            setEditingProgram(null);
          }}
          onSave={() => {
            fetchPrograms();
            setShowCreateModal(false);
            setEditingProgram(null);
          }}
        />
      )}
    </div>
  );
}

// مكون مودال إنشاء/تعديل البرنامج
function CreateEditProgramModal({
  program,
  onClose,
  onSave
}: {
  program?: AudioProgram | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const [formData, setFormData] = useState({
    name: program?.name || '',
    description: program?.description || '',
    short_description: program?.short_description || '',
    logo_url: program?.logo_url || '',
    thumbnail_url: program?.thumbnail_url || '',
    preferred_duration: program?.preferred_duration || 5,
    voice_model: program?.voice_model || 'bradford',
    display_position: program?.display_position || 'header',
    display_order: program?.display_order || 0,
    status: program?.status || 'active'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        program ? `/api/audio/programs/${program.id}` : '/api/audio/programs',
        {
          method: program ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        }
      );

      if (response.ok) {
        toast.success(program ? 'تم تحديث البرنامج بنجاح' : 'تم إنشاء البرنامج بنجاح');
        onSave();
      } else {
        const error = await response.json();
        toast.error(error.error || 'حدث خطأ');
      }
    } catch (error) {
      console.error('Error saving program:', error);
      toast.error('حدث خطأ في حفظ البرنامج');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            {program ? 'تعديل البرنامج' : 'إنشاء برنامج جديد'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                اسم البرنامج *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                وصف البرنامج
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                وصف مختصر
              </label>
              <input
                type="text"
                value={formData.short_description}
                onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  رابط الشعار
                </label>
                <input
                  type="url"
                  value={formData.logo_url}
                  onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  رابط الصورة المصغرة
                </label>
                <input
                  type="url"
                  value={formData.thumbnail_url}
                  onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  المدة المفضلة (بالدقائق)
                </label>
                <input
                  type="number"
                  value={formData.preferred_duration}
                  onChange={(e) => setFormData({ ...formData, preferred_duration: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
                  min="1"
                  max="60"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  الصوت الافتراضي
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  موقع العرض
                </label>
                <select
                  value={formData.display_position}
                  onChange={(e) => setFormData({ ...formData, display_position: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="header">الهيدر</option>
                  <option value="homepage_card">كارد الصفحة الرئيسية</option>
                  <option value="sidebar">الشريط الجانبي</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  الترتيب
                </label>
                <input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                الحالة
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="active">نشط</option>
                <option value="paused">متوقف</option>
                <option value="inactive">غير نشط</option>
              </select>
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
                {program ? 'تحديث' : 'إنشاء'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 