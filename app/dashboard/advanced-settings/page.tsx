/**
 * صفحة الإعدادات المتقدمة - لوحة التحكم
 * Advanced Settings Dashboard Page
 */

'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Save, 
  RefreshCw, 
  Download, 
  Upload,
  Search,
  Filter,
  AlertCircle,
  CheckCircle,
  Plus,
  Trash2,
  Edit,
  Eye,
  EyeOff
} from 'lucide-react';

interface Setting {
  id: string;
  module: string;
  category: string;
  key: string;
  value: any;
  data_type: string;
  description?: string;
  is_public: boolean;
  is_user_editable: boolean;
  validation_rules?: any;
  created_at: string;
  updated_at: string;
}

interface SettingsFilter {
  module?: string;
  category?: string;
  search?: string;
  public?: boolean;
}

export default function AdvancedSettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filters, setFilters] = useState<SettingsFilter>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSettings, setSelectedSettings] = useState<string[]>([]);
  const [showValues, setShowValues] = useState<{[key: string]: boolean}>({});
  const [editingSettings, setEditingSettings] = useState<{[key: string]: any}>({});
  const [newSetting, setNewSetting] = useState({
    key: '',
    value: '',
    module: 'general',
    category: 'general',
    description: '',
    data_type: 'string',
    is_public: false,
    is_user_editable: false
  });
  const [showNewSettingForm, setShowNewSettingForm] = useState(false);

  // تحميل الإعدادات
  const loadSettings = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      if (filters.module) queryParams.append('module', filters.module);
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.public !== undefined) queryParams.append('public', filters.public.toString());

      const response = await fetch(`/api/admin/settings?${queryParams}`);
      const data = await response.json();

      if (response.ok) {
        setSettings(data.settings || []);
      } else {
        console.error('Error loading settings:', data.error);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  // تحديث إعداد واحد
  const updateSetting = async (settingId: string, newValue: any) => {
    try {
      setSaving(true);
      const setting = settings.find(s => s.id === settingId);
      if (!setting) return;

      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: setting.key,
          value: newValue,
          module: setting.module,
          category: setting.category,
          description: setting.description
        })
      });

      const result = await response.json();

      if (response.ok) {
        await loadSettings();
        setEditingSettings(prev => {
          const updated = { ...prev };
          delete updated[settingId];
          return updated;
        });
      } else {
        alert('خطأ في التحديث: ' + result.error);
      }
    } catch (error) {
      console.error('Error updating setting:', error);
      alert('فشل في تحديث الإعداد');
    } finally {
      setSaving(false);
    }
  };

  // إضافة إعداد جديد
  const addNewSetting = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSetting)
      });

      const result = await response.json();

      if (response.ok) {
        await loadSettings();
        setNewSetting({
          key: '',
          value: '',
          module: 'general',
          category: 'general',
          description: '',
          data_type: 'string',
          is_public: false,
          is_user_editable: false
        });
        setShowNewSettingForm(false);
      } else {
        alert('خطأ في الإضافة: ' + result.error);
      }
    } catch (error) {
      console.error('Error adding setting:', error);
      alert('فشل في إضافة الإعداد');
    } finally {
      setSaving(false);
    }
  };

  // حذف إعداد
  const deleteSetting = async (setting: Setting) => {
    if (!confirm(`هل أنت متأكد من حذف الإعداد "${setting.key}"؟`)) return;

    try {
      const response = await fetch(
        `/api/admin/settings?key=${setting.key}&module=${setting.module}&category=${setting.category}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        await loadSettings();
      } else {
        const result = await response.json();
        alert('خطأ في الحذف: ' + result.error);
      }
    } catch (error) {
      console.error('Error deleting setting:', error);
      alert('فشل في حذف الإعداد');
    }
  };

  // تصدير الإعدادات
  const exportSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings/export');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `settings-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
    } catch (error) {
      console.error('Error exporting settings:', error);
      alert('فشل في تصدير الإعدادات');
    }
  };

  useEffect(() => {
    loadSettings();
  }, [filters]);

  // تصفية الإعدادات المحلية
  const filteredSettings = settings.filter(setting => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        setting.key.toLowerCase().includes(term) ||
        setting.description?.toLowerCase().includes(term) ||
        setting.module.toLowerCase().includes(term) ||
        setting.category.toLowerCase().includes(term)
      );
    }
    return true;
  });

  const renderSettingValue = (setting: Setting) => {
    const isEditing = editingSettings[setting.id] !== undefined;
    const displayValue = isEditing ? editingSettings[setting.id] : setting.value;
    const shouldHide = setting.key.toLowerCase().includes('password') || 
                     setting.key.toLowerCase().includes('secret') ||
                     setting.key.toLowerCase().includes('token');
    const isVisible = showValues[setting.id] || false;

    if (isEditing) {
      return (
        <div className="flex items-center gap-2">
          <input
            type={shouldHide && !isVisible ? 'password' : 'text'}
            value={displayValue}
            onChange={(e) => setEditingSettings(prev => ({
              ...prev,
              [setting.id]: e.target.value
            }))}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => updateSetting(setting.id, editingSettings[setting.id])}
            disabled={saving}
            className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
          </button>
          <button
            onClick={() => setEditingSettings(prev => {
              const updated = { ...prev };
              delete updated[setting.id];
              return updated;
            })}
            className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            ✕
          </button>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <span className="flex-1 font-mono text-sm">
          {shouldHide && !isVisible ? '••••••••' : JSON.stringify(displayValue)}
        </span>
        {shouldHide && (
          <button
            onClick={() => setShowValues(prev => ({
              ...prev,
              [setting.id]: !prev[setting.id]
            }))}
            className="p-1 text-gray-500 hover:text-gray-700"
          >
            {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
        <button
          onClick={() => setEditingSettings(prev => ({
            ...prev,
            [setting.id]: setting.value
          }))}
          className="p-1 text-blue-600 hover:text-blue-800"
        >
          <Edit className="w-4 h-4" />
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* العنوان والأدوات */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Settings className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">الإعدادات المتقدمة</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowNewSettingForm(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                إضافة إعداد
              </button>
              <button
                onClick={exportSettings}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                تصدير
              </button>
              <button
                onClick={loadSettings}
                disabled={loading}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                تحديث
              </button>
            </div>
          </div>

          {/* أدوات البحث والتصفية */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="البحث في الإعدادات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filters.module || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, module: e.target.value || undefined }))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">جميع الوحدات</option>
              <option value="general">عام</option>
              <option value="appearance">المظهر</option>
              <option value="security">الأمان</option>
              <option value="notifications">الإشعارات</option>
              <option value="ai_models">نماذج الذكاء الاصطناعي</option>
            </select>
            <select
              value={filters.public === undefined ? '' : filters.public.toString()}
              onChange={(e) => setFilters(prev => ({ 
                ...prev, 
                public: e.target.value === '' ? undefined : e.target.value === 'true'
              }))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">جميع الإعدادات</option>
              <option value="true">عامة</option>
              <option value="false">خاصة</option>
            </select>
          </div>
        </div>

        {/* نموذج إضافة إعداد جديد */}
        {showNewSettingForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">إضافة إعداد جديد</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="مفتاح الإعداد"
                value={newSetting.key}
                onChange={(e) => setNewSetting(prev => ({ ...prev, key: e.target.value }))}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="text"
                placeholder="القيمة"
                value={newSetting.value}
                onChange={(e) => setNewSetting(prev => ({ ...prev, value: e.target.value }))}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              />
              <select
                value={newSetting.module}
                onChange={(e) => setNewSetting(prev => ({ ...prev, module: e.target.value }))}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="general">عام</option>
                <option value="appearance">المظهر</option>
                <option value="security">الأمان</option>
                <option value="notifications">الإشعارات</option>
              </select>
              <input
                type="text"
                placeholder="الفئة"
                value={newSetting.category}
                onChange={(e) => setNewSetting(prev => ({ ...prev, category: e.target.value }))}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="text"
                placeholder="الوصف"
                value={newSetting.description}
                onChange={(e) => setNewSetting(prev => ({ ...prev, description: e.target.value }))}
                className="px-4 py-2 border border-gray-300 rounded-lg md:col-span-2"
              />
            </div>
            <div className="flex items-center gap-4 mt-4">
              <button
                onClick={addNewSetting}
                disabled={saving || !newSetting.key || !newSetting.value}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                إضافة
              </button>
              <button
                onClick={() => setShowNewSettingForm(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                إلغاء
              </button>
            </div>
          </div>
        )}

        {/* جدول الإعدادات */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    المفتاح
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الوحدة/الفئة
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    القيمة
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    النوع
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الحالة
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center">
                        <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
                        <span className="ml-2 text-gray-500">جاري التحميل...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredSettings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      لا توجد إعدادات
                    </td>
                  </tr>
                ) : (
                  filteredSettings.map(setting => (
                    <tr key={setting.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{setting.key}</div>
                          {setting.description && (
                            <div className="text-sm text-gray-500">{setting.description}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">{setting.module}</div>
                          <div className="text-gray-500">{setting.category}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {renderSettingValue(setting)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {setting.data_type}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          {setting.is_public && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              عام
                            </span>
                          )}
                          {setting.is_user_editable && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              قابل للتعديل
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <button
                          onClick={() => deleteSetting(setting)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* إحصائيات */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-2xl font-bold text-gray-900">{settings.length}</div>
            <div className="text-sm text-gray-500">إجمالي الإعدادات</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-2xl font-bold text-green-600">
              {settings.filter(s => s.is_public).length}
            </div>
            <div className="text-sm text-gray-500">إعدادات عامة</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-2xl font-bold text-blue-600">
              {settings.filter(s => s.is_user_editable).length}
            </div>
            <div className="text-sm text-gray-500">قابلة للتعديل</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-2xl font-bold text-gray-600">
              {new Set(settings.map(s => s.module)).size}
            </div>
            <div className="text-sm text-gray-500">وحدات نظام</div>
          </div>
        </div>
      </div>
    </div>
  );
}
