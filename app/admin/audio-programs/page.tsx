'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { 
  Plus, 
  Mic, 
  Eye, 
  Edit, 
  Trash2, 
  Settings, 
  BarChart3, 
  Calendar, 
  Users, 
  Clock, 
  Activity,
  ArrowUpRight,
  Headphones,
  PlayCircle,
  PauseCircle,
  Radio,
  X
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

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
      const response = await fetch('/api/audio/programs', {
        credentials: 'include'
      });
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
        },
        credentials: 'include'
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
      active: 'chip-success',
      paused: 'chip-warning',
      inactive: 'chip-outline'
    };

    const labels = {
      active: 'نشط',
      paused: 'متوقف',
      inactive: 'غير نشط'
    };

    return (
      <span className={`chip chip-sm ${badges[status as keyof typeof badges] || badges.inactive}`}>
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '256px' }}>
        <div className="spinner" style={{ 
          width: '48px', 
          height: '48px', 
          border: '3px solid hsl(var(--line))',
          borderTopColor: 'hsl(var(--accent))',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    );
  }

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
                <Radio style={{ width: '28px', height: '28px', color: 'white' }} />
              </div>
              <div>
                <h1 className="heading-2" style={{ marginBottom: '4px' }}>
                  البرامج الصوتية
                </h1>
                <p className="text-muted" style={{ fontSize: '14px' }}>
                  إدارة البرامج والحلقات الصوتية لصحيفة سبق
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn"
              style={{ background: 'hsl(var(--accent))', color: 'white' }}
            >
              <Plus style={{ width: '16px', height: '16px' }} />
              إضافة برنامج جديد
            </button>
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
            title="إجمالي البرامج"
            value={programs.length}
            icon={Mic}
            trend={{ value: 15, label: "هذا الشهر" }}
          />
          <StatCard
            title="البرامج النشطة"
            value={programs.filter(p => p.status === 'active').length}
            icon={Activity}
          />
          <StatCard
            title="إجمالي الحلقات"
            value={programs.reduce((acc, p) => acc + (p.stats?.totalEpisodes || 0), 0)}
            icon={Calendar}
          />
          <StatCard
            title="إجمالي المشاهدات"
            value={programs.reduce((acc, p) => acc + (p.stats?.totalViews || 0), 0).toLocaleString('ar-SA')}
            icon={Eye}
          />
        </div>

        {/* قائمة البرامج */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Headphones style={{ width: '20px', height: '20px' }} />
              البرامج الصوتية المسجلة
            </h3>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid hsl(var(--line))' }}>
                  <th className="text-xs text-muted" style={{ padding: '16px', textAlign: 'right', fontWeight: '600' }}>
                    البرنامج
                  </th>
                  <th className="text-xs text-muted" style={{ padding: '16px', textAlign: 'right', fontWeight: '600' }}>
                    الحالة
                  </th>
                  <th className="text-xs text-muted" style={{ padding: '16px', textAlign: 'right', fontWeight: '600' }}>
                    الموقع
                  </th>
                  <th className="text-xs text-muted" style={{ padding: '16px', textAlign: 'right', fontWeight: '600' }}>
                    الحلقات
                  </th>
                  <th className="text-xs text-muted" style={{ padding: '16px', textAlign: 'right', fontWeight: '600' }}>
                    المشاهدات
                  </th>
                  <th className="text-xs text-muted" style={{ padding: '16px', textAlign: 'right', fontWeight: '600' }}>
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody>
                {programs.map((program) => (
                  <tr key={program.id} style={{ borderBottom: '1px solid hsl(var(--line))' }}>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {program.logo_url && (
                          <img
                            src={program.logo_url}
                            alt={program.name}
                            style={{ 
                              width: '40px', 
                              height: '40px', 
                              borderRadius: '12px', 
                              marginLeft: '12px',
                              objectFit: 'cover'
                            }}
                          />
                        )}
                        <div>
                          <div className="text-sm" style={{ fontWeight: '600', marginBottom: '2px' }}>
                            {program.name}
                          </div>
                          {program.short_description && (
                            <div className="text-xs text-muted">
                              {program.short_description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      {getStatusBadge(program.status)}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span className="text-sm text-muted">
                        {getPositionLabel(program.display_position)}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span className="text-sm" style={{ fontWeight: '600', color: 'hsl(var(--accent))' }}>
                          {program.stats?.publishedEpisodes || 0}
                        </span>
                        <span className="text-sm text-muted">/</span>
                        <span className="text-sm text-muted">{program.stats?.totalEpisodes || 0}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span className="text-sm" style={{ fontWeight: '600' }}>
                        {(program.stats?.totalViews || 0).toLocaleString('ar-SA')}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Link href={`/admin/audio-programs/${program.id}`}>
                          <button className="btn btn-sm btn-ghost">
                            <Eye style={{ width: '16px', height: '16px' }} />
                          </button>
                        </Link>
                        <button
                          onClick={() => setEditingProgram(program)}
                          className="btn btn-sm btn-ghost"
                          style={{ color: 'hsl(var(--warning))' }}
                        >
                          <Edit style={{ width: '16px', height: '16px' }} />
                        </button>
                        <button
                          onClick={() => handleDeleteProgram(program.id)}
                          className="btn btn-sm btn-ghost"
                          style={{ color: 'hsl(var(--danger))' }}
                        >
                          <Trash2 style={{ width: '16px', height: '16px' }} />
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

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
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
          body: JSON.stringify(formData),
          credentials: 'include'
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
    <div style={{
      position: 'fixed',
      inset: '0',
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      zIndex: '9999'
    }}>
      <div className="card" style={{
        maxWidth: '800px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <div className="card-header" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h3 className="card-title">
            <Radio style={{ width: '20px', height: '20px' }} />
            {program ? 'تعديل البرنامج' : 'إنشاء برنامج جديد'}
          </h3>
          <button
            onClick={onClose}
            className="btn btn-sm btn-ghost"
          >
            <X style={{ width: '16px', height: '16px' }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label className="label" style={{ marginBottom: '8px', display: 'block' }}>
                اسم البرنامج *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input"
                style={{ width: '100%' }}
                required
              />
            </div>

            <div>
              <label className="label" style={{ marginBottom: '8px', display: 'block' }}>
                وصف البرنامج
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input"
                style={{ width: '100%', minHeight: '100px', resize: 'vertical' }}
                rows={3}
              />
            </div>

            <div>
              <label className="label" style={{ marginBottom: '8px', display: 'block' }}>
                وصف مختصر
              </label>
              <input
                type="text"
                value={formData.short_description}
                onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                className="input"
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label className="label" style={{ marginBottom: '8px', display: 'block' }}>
                  رابط الشعار
                </label>
                <input
                  type="url"
                  value={formData.logo_url}
                  onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                  className="input"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label className="label" style={{ marginBottom: '8px', display: 'block' }}>
                  رابط الصورة المصغرة
                </label>
                <input
                  type="url"
                  value={formData.thumbnail_url}
                  onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                  className="input"
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label className="label" style={{ marginBottom: '8px', display: 'block' }}>
                  المدة المفضلة (بالدقائق)
                </label>
                <input
                  type="number"
                  value={formData.preferred_duration}
                  onChange={(e) => setFormData({ ...formData, preferred_duration: parseInt(e.target.value) })}
                  className="input"
                  style={{ width: '100%' }}
                  min="1"
                  max="60"
                />
              </div>

              <div>
                <label className="label" style={{ marginBottom: '8px', display: 'block' }}>
                  الصوت الافتراضي
                </label>
                <select
                  value={formData.voice_model}
                  onChange={(e) => setFormData({ ...formData, voice_model: e.target.value })}
                  className="input"
                  style={{ width: '100%' }}
                >
                  <option value="bradford">Bradford (ذكر - عربي)</option>
                  <option value="rachel">Rachel (أنثى - إنجليزي)</option>
                  <option value="alice">Alice (أنثى)</option>
                  <option value="bill">Bill (ذكر)</option>
                  <option value="chris">Chris (ذكر)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label className="label" style={{ marginBottom: '8px', display: 'block' }}>
                  موقع العرض
                </label>
                <select
                  value={formData.display_position}
                  onChange={(e) => setFormData({ ...formData, display_position: e.target.value })}
                  className="input"
                  style={{ width: '100%' }}
                >
                  <option value="header">الهيدر</option>
                  <option value="homepage_card">كارد الصفحة الرئيسية</option>
                  <option value="sidebar">الشريط الجانبي</option>
                </select>
              </div>

              <div>
                <label className="label" style={{ marginBottom: '8px', display: 'block' }}>
                  الترتيب
                </label>
                <input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                  className="input"
                  style={{ width: '100%' }}
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="label" style={{ marginBottom: '8px', display: 'block' }}>
                الحالة
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="input"
                style={{ width: '100%' }}
              >
                <option value="active">نشط</option>
                <option value="paused">متوقف</option>
                <option value="inactive">غير نشط</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '16px' }}>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-outline"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="btn"
                style={{ background: 'hsl(var(--accent))', color: 'white' }}
              >
                {program ? 'تحديث' : 'إنشاء'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
