/**
 * صفحة الإعدادات الحديثة - تصميم احترافي
 * Modern Settings Page - Professional Design
 */

'use client';

import DashboardLayout from '@/components/admin/modern-dashboard/DashboardLayout';
import { DesignComponents } from '@/components/design-system/DesignSystemGuide';
import {
    AlertTriangle,
    Bell,
    Database,
    Eye,
    EyeOff,
    Info,
    Mail,
    Palette,
    RefreshCw,
    Save,
    Settings,
    Shield
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface SettingSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  settings: Setting[];
}

interface Setting {
  id: string;
  label: string;
  description?: string;
  type: 'text' | 'email' | 'password' | 'select' | 'toggle' | 'number' | 'textarea';
  value: any;
  options?: { label: string; value: string }[];
  required?: boolean;
  placeholder?: string;
}

const ModernSettingsNew: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('general');
  const [showPasswords, setShowPasswords] = useState<{[key: string]: boolean}>({});
  const [settings, setSettings] = useState<{[key: string]: SettingSection}>({});
  const [hasChanges, setHasChanges] = useState(false);

  // بيانات الإعدادات
  const settingSections: SettingSection[] = [
    {
      id: 'general',
      title: 'الإعدادات العامة',
      description: 'إعدادات الموقع الأساسية',
      icon: <Settings className="w-5 h-5" />,
      settings: [
        {
          id: 'site_name',
          label: 'اسم الموقع',
          type: 'text',
          value: 'سبق',
          required: true,
          placeholder: 'أدخل اسم الموقع'
        },
        {
          id: 'site_description',
          label: 'وصف الموقع',
          type: 'textarea',
          value: 'موقع إخباري متميز يقدم أحدث الأخبار والتقارير',
          placeholder: 'أدخل وصف الموقع'
        },
        {
          id: 'site_language',
          label: 'لغة الموقع',
          type: 'select',
          value: 'ar',
          options: [
            { label: 'العربية', value: 'ar' },
            { label: 'English', value: 'en' },
            { label: 'Français', value: 'fr' }
          ]
        },
        {
          id: 'timezone',
          label: 'المنطقة الزمنية',
          type: 'select',
          value: 'Asia/Riyadh',
          options: [
            { label: 'الرياض (GMT+3)', value: 'Asia/Riyadh' },
            { label: 'القاهرة (GMT+2)', value: 'Africa/Cairo' },
            { label: 'دبي (GMT+4)', value: 'Asia/Dubai' }
          ]
        }
      ]
    },
    {
      id: 'security',
      title: 'الأمان والحماية',
      description: 'إعدادات الأمان وكلمات المرور',
      icon: <Shield className="w-5 h-5" />,
      settings: [
        {
          id: 'admin_password',
          label: 'كلمة مرور المدير',
          type: 'password',
          value: '',
          placeholder: 'أدخل كلمة مرور جديدة'
        },
        {
          id: 'two_factor_auth',
          label: 'المصادقة الثنائية',
          description: 'تفعيل المصادقة الثنائية لمزيد من الأمان',
          type: 'toggle',
          value: false
        },
        {
          id: 'session_timeout',
          label: 'انتهاء الجلسة (بالدقائق)',
          type: 'number',
          value: 60,
          placeholder: '60'
        },
        {
          id: 'login_attempts',
          label: 'عدد محاولات تسجيل الدخول المسموحة',
          type: 'number',
          value: 5,
          placeholder: '5'
        }
      ]
    },
    {
      id: 'database',
      title: 'قاعدة البيانات',
      description: 'إعدادات الاتصال بقاعدة البيانات',
      icon: <Database className="w-5 h-5" />,
      settings: [
        {
          id: 'db_host',
          label: 'خادم قاعدة البيانات',
          type: 'text',
          value: 'localhost',
          required: true,
          placeholder: 'localhost'
        },
        {
          id: 'db_name',
          label: 'اسم قاعدة البيانات',
          type: 'text',
          value: 'sabq_cms',
          required: true,
          placeholder: 'sabq_cms'
        },
        {
          id: 'db_username',
          label: 'اسم المستخدم',
          type: 'text',
          value: 'admin',
          required: true,
          placeholder: 'admin'
        },
        {
          id: 'db_password',
          label: 'كلمة المرور',
          type: 'password',
          value: '',
          placeholder: 'أدخل كلمة مرور قاعدة البيانات'
        }
      ]
    },
    {
      id: 'email',
      title: 'إعدادات البريد الإلكتروني',
      description: 'إعدادات SMTP والإشعارات',
      icon: <Mail className="w-5 h-5" />,
      settings: [
        {
          id: 'smtp_host',
          label: 'خادم SMTP',
          type: 'text',
          value: 'mail.sabq.org',
          placeholder: 'smtp.gmail.com'
        },
        {
          id: 'smtp_port',
          label: 'منفذ SMTP',
          type: 'number',
          value: 587,
          placeholder: '587'
        },
        {
          id: 'smtp_username',
          label: 'اسم المستخدم',
          type: 'email',
          value: 'noreply@sabq.org',
          placeholder: 'your-email@domain.com'
        },
        {
          id: 'smtp_password',
          label: 'كلمة المرور',
          type: 'password',
          value: '',
          placeholder: 'أدخل كلمة مرور البريد'
        },
        {
          id: 'email_notifications',
          label: 'تفعيل الإشعارات بالبريد',
          type: 'toggle',
          value: true
        }
      ]
    },
    {
      id: 'notifications',
      title: 'الإشعارات',
      description: 'إعدادات التنبيهات والإشعارات',
      icon: <Bell className="w-5 h-5" />,
      settings: [
        {
          id: 'push_notifications',
          label: 'الإشعارات الفورية',
          type: 'toggle',
          value: true
        },
        {
          id: 'email_on_new_article',
          label: 'إشعار عند مقال جديد',
          type: 'toggle',
          value: true
        },
        {
          id: 'email_on_new_comment',
          label: 'إشعار عند تعليق جديد',
          type: 'toggle',
          value: false
        },
        {
          id: 'daily_report',
          label: 'التقرير اليومي',
          type: 'toggle',
          value: true
        }
      ]
    },
    {
      id: 'appearance',
      title: 'المظهر والتخصيص',
      description: 'إعدادات شكل الموقع والألوان',
      icon: <Palette className="w-5 h-5" />,
      settings: [
        {
          id: 'theme',
          label: 'السمة',
          type: 'select',
          value: 'default',
          options: [
            { label: 'الافتراضي', value: 'default' },
            { label: 'الداكن', value: 'dark' },
            { label: 'الملون', value: 'colorful' }
          ]
        },
        {
          id: 'primary_color',
          label: 'اللون الأساسي',
          type: 'text',
          value: '#3B82F6',
          placeholder: '#3B82F6'
        },
        {
          id: 'articles_per_page',
          label: 'عدد المقالات في الصفحة',
          type: 'number',
          value: 12,
          placeholder: '12'
        },
        {
          id: 'show_author',
          label: 'إظهار اسم الكاتب',
          type: 'toggle',
          value: true
        }
      ]
    }
  ];

  useEffect(() => {
    // محاكاة جلب الإعدادات
    setTimeout(() => {
      const settingsMap: {[key: string]: SettingSection} = {};
      settingSections.forEach(section => {
        settingsMap[section.id] = section;
      });
      setSettings(settingsMap);
      setLoading(false);
    }, 1000);
  }, []);

  const handleSettingChange = (sectionId: string, settingId: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        settings: prev[sectionId].settings.map(setting =>
          setting.id === settingId ? { ...setting, value } : setting
        )
      }
    }));
    setHasChanges(true);
  };

  const togglePasswordVisibility = (fieldId: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [fieldId]: !prev[fieldId]
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    // محاكاة حفظ الإعدادات
    await new Promise(resolve => setTimeout(resolve, 2000));
    setSaving(false);
    setHasChanges(false);
    // يمكن إضافة toast notification هنا
  };

  const renderSettingField = (sectionId: string, setting: Setting) => {
    const fieldId = `${sectionId}_${setting.id}`;

    switch (setting.type) {
      case 'text':
      case 'email':
        return (
          <input
            type={setting.type}
            value={setting.value}
            onChange={(e) => handleSettingChange(sectionId, setting.id, e.target.value)}
            placeholder={setting.placeholder}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required={setting.required}
          />
        );

      case 'password':
        return (
          <div className="relative">
            <input
              type={showPasswords[fieldId] ? 'text' : 'password'}
              value={setting.value}
              onChange={(e) => handleSettingChange(sectionId, setting.id, e.target.value)}
              placeholder={setting.placeholder}
              className="w-full px-3 py-2 pr-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility(fieldId)}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPasswords[fieldId] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        );

      case 'textarea':
        return (
          <textarea
            value={setting.value}
            onChange={(e) => handleSettingChange(sectionId, setting.id, e.target.value)}
            placeholder={setting.placeholder}
            rows={3}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
          />
        );

      case 'select':
        return (
          <select
            value={setting.value}
            onChange={(e) => handleSettingChange(sectionId, setting.id, e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {setting.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'number':
        return (
          <input
            type="number"
            value={setting.value}
            onChange={(e) => handleSettingChange(sectionId, setting.id, parseInt(e.target.value) || 0)}
            placeholder={setting.placeholder}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        );

      case 'toggle':
        return (
          <button
            onClick={() => handleSettingChange(sectionId, setting.id, !setting.value)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              setting.value ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                setting.value ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        );

      default:
        return null;
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
      <div className="space-y-6 p-6 w-full max-w-none px-4 lg:px-6 xl:px-8 2xl:px-10">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <Settings className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-2">إعدادات النظام</h1>
                <p className="text-blue-100">إدارة جميع إعدادات الموقع والتطبيق</p>
              </div>
            </div>
            {hasChanges && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* قائمة الأقسام */}
          <div className="lg:col-span-1">
            <DesignComponents.StandardCard>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-4">أقسام الإعدادات</h3>
                <nav className="space-y-2">
                  {Object.values(settings).map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full text-right p-3 rounded-lg transition-colors flex items-center gap-3 ${
                        activeSection === section.id
                          ? 'bg-blue-50 text-blue-600 border border-blue-200'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        activeSection === section.id ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        {section.icon}
                      </div>
                      <div className="flex-1 text-right">
                        <div className="font-medium">{section.title}</div>
                        <div className="text-xs text-gray-500 mt-1">{section.description}</div>
                      </div>
                    </button>
                  ))}
                </nav>
              </div>
            </DesignComponents.StandardCard>
          </div>

          {/* محتوى القسم النشط */}
          <div className="lg:col-span-3">
            {settings[activeSection] && (
              <DesignComponents.StandardCard>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      {settings[activeSection].icon}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{settings[activeSection].title}</h2>
                      <p className="text-gray-600">{settings[activeSection].description}</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {settings[activeSection].settings.map((setting) => (
                      <div key={setting.id} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <label className="font-medium text-gray-900">
                            {setting.label}
                            {setting.required && <span className="text-red-500 mr-1">*</span>}
                          </label>
                          {setting.description && (
                            <div className="group relative">
                              <Info className="w-4 h-4 text-gray-400 cursor-help" />
                              <div className="invisible group-hover:visible absolute bottom-full left-0 mb-2 px-3 py-2 bg-black text-white text-sm rounded-lg whitespace-nowrap z-10">
                                {setting.description}
                              </div>
                            </div>
                          )}
                        </div>
                        {renderSettingField(activeSection, setting)}
                      </div>
                    ))}
                  </div>

                  {/* تحذير خاص لإعدادات قاعدة البيانات */}
                  {activeSection === 'database' && (
                    <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-amber-800">تنبيه مهم</h4>
                        <p className="text-amber-700 text-sm mt-1">
                          تغيير إعدادات قاعدة البيانات قد يؤثر على عمل الموقع. تأكد من صحة البيانات قبل الحفظ.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* تحذير خاص لإعدادات الأمان */}
                  {activeSection === 'security' && (
                    <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                      <Shield className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-red-800">إعدادات حساسة</h4>
                        <p className="text-red-700 text-sm mt-1">
                          هذه الإعدادات تؤثر على أمان النظام. تأكد من استخدام كلمات مرور قوية وتفعيل المصادقة الثنائية.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </DesignComponents.StandardCard>
            )}
          </div>
        </div>

        {/* شريط الحفظ الثابت */}
        {hasChanges && (
          <div className="fixed bottom-4 left-4 right-4 z-50">
            <DesignComponents.StandardCard>
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-700">لديك تغييرات غير محفوظة</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      // إعادة تحميل الإعدادات الأصلية
                      setHasChanges(false);
                      window.location.reload();
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {saving ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>{saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}</span>
                  </button>
                </div>
              </div>
            </DesignComponents.StandardCard>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ModernSettingsNew;
