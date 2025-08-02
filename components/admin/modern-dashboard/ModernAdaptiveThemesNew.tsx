/**
 * صفحة السمات التكيفية الحديثة - تصميم احترافي
 * Modern Adaptive Themes Page - Professional Design
 */

'use client';

import DashboardLayout from '@/components/admin/modern-dashboard/DashboardLayout';
import { DesignComponents } from '@/components/design-system/DesignSystemGuide';
import {
    Calendar,
    Check,
    Copy,
    Edit,
    Monitor,
    Palette,
    Plus,
    RefreshCw,
    Smartphone,
    Star,
    Trash2,
    Upload,
    Users,
    Zap
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface AdaptiveTheme {
  id: string;
  name: string;
  description: string;
  preview_image: string;
  is_active: boolean;
  is_default: boolean;
  created_at: string;
  usage_count: number;
  rating: number;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
  };
  settings: {
    font_family: string;
    font_size: string;
    border_radius: string;
    spacing: string;
  };
  responsive: {
    mobile: boolean;
    tablet: boolean;
    desktop: boolean;
  };
  features: string[];
}

const ModernAdaptiveThemesNew: React.FC = () => {
  const [themes, setThemes] = useState<AdaptiveTheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTheme, setActiveTheme] = useState<string>('');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showThemeEditor, setShowThemeEditor] = useState(false);
  const [editingTheme, setEditingTheme] = useState<AdaptiveTheme | null>(null);
  const [saving, setSaving] = useState(false);

  // بيانات السمات التجريبية
  const sampleThemes: AdaptiveTheme[] = [
    {
      id: '1',
      name: 'السمة الافتراضية',
      description: 'السمة الأساسية للموقع مع تصميم نظيف ومتوازن',
      preview_image: '/api/placeholder/400/300',
      is_active: true,
      is_default: true,
      created_at: '2025-01-15T10:00:00Z',
      usage_count: 1250,
      rating: 4.8,
      colors: {
        primary: '#3B82F6',
        secondary: '#6366F1',
        accent: '#F59E0B',
        background: '#FFFFFF',
        surface: '#F8FAFC',
        text: '#1F2937'
      },
      settings: {
        font_family: 'Cairo',
        font_size: '16px',
        border_radius: '8px',
        spacing: 'normal'
      },
      responsive: {
        mobile: true,
        tablet: true,
        desktop: true
      },
      features: ['تصميم متجاوب', 'وضع داكن', 'خطوط عربية', 'سرعة التحميل']
    },
    {
      id: '2',
      name: 'السمة الداكنة',
      description: 'تصميم داكن مريح للعينين مع ألوان هادئة',
      preview_image: '/api/placeholder/400/300',
      is_active: false,
      is_default: false,
      created_at: '2025-01-20T14:30:00Z',
      usage_count: 890,
      rating: 4.6,
      colors: {
        primary: '#60A5FA',
        secondary: '#A78BFA',
        accent: '#FBBF24',
        background: '#111827',
        surface: '#1F2937',
        text: '#F9FAFB'
      },
      settings: {
        font_family: 'Cairo',
        font_size: '16px',
        border_radius: '12px',
        spacing: 'comfortable'
      },
      responsive: {
        mobile: true,
        tablet: true,
        desktop: true
      },
      features: ['وضع داكن', 'راحة العينين', 'تباين عالي', 'توفير البطارية']
    },
    {
      id: '3',
      name: 'السمة الملونة',
      description: 'تصميم حيوي مع ألوان جذابة ومتدرجات جميلة',
      preview_image: '/api/placeholder/400/300',
      is_active: false,
      is_default: false,
      created_at: '2025-01-25T09:15:00Z',
      usage_count: 567,
      rating: 4.4,
      colors: {
        primary: '#EC4899',
        secondary: '#8B5CF6',
        accent: '#10B981',
        background: '#FEFEFE',
        surface: '#F0F9FF',
        text: '#0F172A'
      },
      settings: {
        font_family: 'Tajawal',
        font_size: '15px',
        border_radius: '16px',
        spacing: 'compact'
      },
      responsive: {
        mobile: true,
        tablet: false,
        desktop: true
      },
      features: ['ألوان جذابة', 'متدرجات', 'تأثيرات بصرية', 'تفاعلية']
    }
  ];

  useEffect(() => {
    // محاكاة جلب البيانات
    setTimeout(() => {
      setThemes(sampleThemes);
      const active = sampleThemes.find(theme => theme.is_active);
      if (active) setActiveTheme(active.id);
      setLoading(false);
    }, 1000);
  }, []);

  const handleActivateTheme = async (themeId: string) => {
    setSaving(true);
    // محاكاة تفعيل السمة
    await new Promise(resolve => setTimeout(resolve, 1500));

    setThemes(prev => prev.map(theme => ({
      ...theme,
      is_active: theme.id === themeId
    })));
    setActiveTheme(themeId);
    setSaving(false);
  };

  const handleDeleteTheme = async (themeId: string) => {
    const theme = themes.find(t => t.id === themeId);
    if (theme?.is_default) {
      alert('لا يمكن حذف السمة الافتراضية');
      return;
    }

    if (confirm('هل أنت متأكد من حذف هذه السمة؟')) {
      setThemes(prev => prev.filter(theme => theme.id !== themeId));
    }
  };

  const handleDuplicateTheme = (theme: AdaptiveTheme) => {
    const newTheme: AdaptiveTheme = {
      ...theme,
      id: Date.now().toString(),
      name: `${theme.name} - نسخة`,
      is_active: false,
      is_default: false,
      created_at: new Date().toISOString(),
      usage_count: 0
    };
    setThemes(prev => [...prev, newTheme]);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'اليوم';
    if (diffInDays === 1) return 'أمس';
    if (diffInDays < 7) return `منذ ${diffInDays} أيام`;
    if (diffInDays < 30) return `منذ ${Math.floor(diffInDays / 7)} أسابيع`;
    return `منذ ${Math.floor(diffInDays / 30)} شهر`;
  };

  const getPreviewIcon = () => {
    switch (previewMode) {
      case 'mobile': return <Smartphone className="w-4 h-4" />;
      case 'tablet': return <Monitor className="w-4 h-4" />;
      default: return <Monitor className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <Palette className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-2">السمات التكيفية</h1>
                <p className="text-indigo-100">إدارة وتخصيص مظهر الموقع والألوان</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowThemeEditor(true)}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>سمة جديدة</span>
              </button>
              <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                <Upload className="w-4 h-4" />
                <span>رفع سمة</span>
              </button>
            </div>
          </div>
        </div>

        {/* إحصائيات السمات */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <DesignComponents.StandardCard>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">إجمالي السمات</p>
                  <p className="text-2xl font-bold text-indigo-600">{themes.length}</p>
                </div>
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <Palette className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
            </div>
          </DesignComponents.StandardCard>

          <DesignComponents.StandardCard>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">السمة النشطة</p>
                  <p className="text-2xl font-bold text-green-600">1</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
          </DesignComponents.StandardCard>

          <DesignComponents.StandardCard>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">إجمالي الاستخدام</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {themes.reduce((sum, theme) => sum + theme.usage_count, 0).toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
          </DesignComponents.StandardCard>

          <DesignComponents.StandardCard>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">متوسط التقييم</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {(themes.reduce((sum, theme) => sum + theme.rating, 0) / themes.length).toFixed(1)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Star className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>
          </DesignComponents.StandardCard>
        </div>

        {/* شريط المعاينة والفلاتر */}
        <DesignComponents.StandardCard>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h3 className="font-semibold text-gray-900">معاينة السمات</h3>
                <div className="flex items-center gap-2">
                  {(['desktop', 'tablet', 'mobile'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setPreviewMode(mode)}
                      className={`p-2 rounded-lg transition-colors ${
                        previewMode === mode
                          ? 'bg-indigo-100 text-indigo-600'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      title={mode === 'desktop' ? 'سطح المكتب' : mode === 'tablet' ? 'الجهاز اللوحي' : 'الهاتف'}
                    >
                      {mode === 'mobile' ? <Smartphone className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">عرض:</span>
                <span className="text-sm font-medium text-gray-900">
                  {previewMode === 'desktop' ? 'سطح المكتب' :
                   previewMode === 'tablet' ? 'جهاز لوحي' : 'هاتف'}
                </span>
              </div>
            </div>
          </div>
        </DesignComponents.StandardCard>

        {/* قائمة السمات */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {themes.map((theme) => (
            <DesignComponents.StandardCard key={theme.id}>
              <div className="p-6">
                {/* معاينة السمة */}
                <div className="relative mb-4">
                  <div
                    className="aspect-video rounded-lg bg-gradient-to-br overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`
                    }}
                  >
                    <div className="p-4 h-full flex flex-col justify-between text-white">
                      <div className="space-y-2">
                        <div className="h-2 bg-white/30 rounded w-3/4"></div>
                        <div className="h-2 bg-white/20 rounded w-1/2"></div>
                      </div>
                      <div className="space-y-1">
                        <div className="h-1 bg-white/20 rounded w-full"></div>
                        <div className="h-1 bg-white/20 rounded w-2/3"></div>
                      </div>
                    </div>
                  </div>

                  {/* شارات الحالة */}
                  <div className="absolute top-2 left-2 flex gap-2">
                    {theme.is_active && (
                      <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        نشطة
                      </span>
                    )}
                    {theme.is_default && (
                      <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                        افتراضية
                      </span>
                    )}
                  </div>

                  {/* دعم الأجهزة */}
                  <div className="absolute bottom-2 left-2 flex gap-1">
                    {theme.responsive.desktop && (
                      <div className="w-5 h-5 bg-black/20 rounded flex items-center justify-center">
                        <Monitor className="w-3 h-3 text-white" />
                      </div>
                    )}
                    {theme.responsive.mobile && (
                      <div className="w-5 h-5 bg-black/20 rounded flex items-center justify-center">
                        <Smartphone className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                </div>

                {/* معلومات السمة */}
                <div className="space-y-3">
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">{theme.name}</h3>
                    <p className="text-sm text-gray-600">{theme.description}</p>
                  </div>

                  {/* الإحصائيات */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{theme.usage_count.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="text-gray-600">{theme.rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>{formatTimeAgo(theme.created_at)}</span>
                    </div>
                  </div>

                  {/* لوحة الألوان */}
                  <div className="flex gap-2">
                    {Object.values(theme.colors).slice(0, 5).map((color, index) => (
                      <div
                        key={index}
                        className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>

                  {/* الميزات */}
                  <div className="flex flex-wrap gap-1">
                    {theme.features.slice(0, 2).map((feature, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        {feature}
                      </span>
                    ))}
                    {theme.features.length > 2 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{theme.features.length - 2}
                      </span>
                    )}
                  </div>

                  {/* أزرار العمليات */}
                  <div className="flex items-center gap-2 pt-2">
                    {!theme.is_active ? (
                      <button
                        onClick={() => handleActivateTheme(theme.id)}
                        disabled={saving}
                        className="flex-1 bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {saving && activeTheme === theme.id ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Zap className="w-4 h-4" />
                        )}
                        تفعيل
                      </button>
                    ) : (
                      <div className="flex-1 bg-green-100 text-green-700 px-3 py-2 rounded-lg flex items-center justify-center gap-2">
                        <Check className="w-4 h-4" />
                        نشطة
                      </div>
                    )}

                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setEditingTheme(theme);
                          setShowThemeEditor(true);
                        }}
                        className="p-2 text-gray-600 hover:text-indigo-600 transition-colors"
                        title="تعديل"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDuplicateTheme(theme)}
                        className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                        title="نسخ"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      {!theme.is_default && (
                        <button
                          onClick={() => handleDeleteTheme(theme.id)}
                          className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </DesignComponents.StandardCard>
          ))}
        </div>

        {/* إضافة سمة جديدة */}
        <DesignComponents.StandardCard>
          <div className="p-8 text-center border-2 border-dashed border-gray-200 rounded-lg hover:border-indigo-300 transition-colors cursor-pointer"
               onClick={() => setShowThemeEditor(true)}>
            <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">إنشاء سمة جديدة</h3>
            <p className="text-gray-600 mb-4">قم بإنشاء سمة مخصصة بألوان وإعدادات خاصة بك</p>
            <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors">
              ابدأ الآن
            </button>
          </div>
        </DesignComponents.StandardCard>
      </div>
    </DashboardLayout>
  );
};

export default ModernAdaptiveThemesNew;
