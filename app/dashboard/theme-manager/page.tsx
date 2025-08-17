'use client';

import React, { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemeManager } from '@/contexts/ThemeManagerContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Palette, Sun, Moon, Monitor, Save, RotateCcw, Download, Upload, 
  Eye, Settings, Brush, Sliders, RefreshCw, Check, X, ChevronDown,
  Circle, Square, Droplets, Sparkles, Info
} from 'lucide-react';
import toast from 'react-hot-toast';

// تعريف الأنواع
interface ColorScheme {
  id: string;
  name: string;
  displayName: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  darkMode: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
}

interface ThemeSettings {
  currentScheme: string;
  customColors: Record<string, string>;
  enableAnimations: boolean;
  compactMode: boolean;
  borderRadius: 'none' | 'small' | 'medium' | 'large';
  fontSize: 'small' | 'medium' | 'large';
  autoTheme: boolean;
  previewMode: boolean;
}

// الثيمات المُعرّفة مسبقاً
const predefinedSchemes: ColorScheme[] = [
  {
    id: 'sabq',
    name: 'sabq',
    displayName: 'ثيم سبق الافتراضي',
    colors: {
      primary: '#1e40af',
      secondary: '#3b82f6',
      accent: '#06b6d4',
      background: '#ffffff',
      surface: '#f8fafc',
      text: '#1e293b',
      textSecondary: '#64748b',
      border: '#e2e8f0',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    },
    darkMode: {
      primary: '#3b82f6',
      secondary: '#60a5fa',
      accent: '#22d3ee',
      background: '#0f172a',
      surface: '#1e293b',
      text: '#f1f5f9',
      textSecondary: '#cbd5e1',
      border: '#334155',
      success: '#22c55e',
      warning: '#fbbf24',
      error: '#f87171',
      info: '#60a5fa'
    }
  },
  {
    id: 'emerald',
    name: 'emerald',
    displayName: 'الزمرد الأخضر',
    colors: {
      primary: '#059669',
      secondary: '#10b981',
      accent: '#34d399',
      background: '#ffffff',
      surface: '#f0fdf4',
      text: '#064e3b',
      textSecondary: '#374151',
      border: '#d1fae5',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    },
    darkMode: {
      primary: '#10b981',
      secondary: '#34d399',
      accent: '#6ee7b7',
      background: '#022c22',
      surface: '#064e3b',
      text: '#ecfdf5',
      textSecondary: '#a7f3d0',
      border: '#065f46',
      success: '#22c55e',
      warning: '#fbbf24',
      error: '#f87171',
      info: '#60a5fa'
    }
  },
  {
    id: 'purple',
    name: 'purple',
    displayName: 'البنفسجي الملكي',
    colors: {
      primary: '#7c3aed',
      secondary: '#8b5cf6',
      accent: '#a78bfa',
      background: '#ffffff',
      surface: '#faf5ff',
      text: '#581c87',
      textSecondary: '#6b7280',
      border: '#e9d5ff',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    },
    darkMode: {
      primary: '#8b5cf6',
      secondary: '#a78bfa',
      accent: '#c4b5fd',
      background: '#1e1b4b',
      surface: '#312e81',
      text: '#f3f4f6',
      textSecondary: '#d1d5db',
      border: '#4c1d95',
      success: '#22c55e',
      warning: '#fbbf24',
      error: '#f87171',
      info: '#60a5fa'
    }
  },
  {
    id: 'rose',
    name: 'rose',
    displayName: 'الوردي الدافئ',
    colors: {
      primary: '#e11d48',
      secondary: '#f43f5e',
      accent: '#fb7185',
      background: '#ffffff',
      surface: '#fff1f2',
      text: '#881337',
      textSecondary: '#6b7280',
      border: '#fecdd3',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    },
    darkMode: {
      primary: '#f43f5e',
      secondary: '#fb7185',
      accent: '#fda4af',
      background: '#4c0519',
      surface: '#881337',
      text: '#f9fafb',
      textSecondary: '#d1d5db',
      border: '#9f1239',
      success: '#22c55e',
      warning: '#fbbf24',
      error: '#f87171',
      info: '#60a5fa'
    }
  },
  {
    id: 'orange',
    name: 'orange',
    displayName: 'البرتقالي الحيوي',
    colors: {
      primary: '#ea580c',
      secondary: '#f97316',
      accent: '#fb923c',
      background: '#ffffff',
      surface: '#fff7ed',
      text: '#7c2d12',
      textSecondary: '#6b7280',
      border: '#fed7aa',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    },
    darkMode: {
      primary: '#f97316',
      secondary: '#fb923c',
      accent: '#fdba74',
      background: '#431407',
      surface: '#7c2d12',
      text: '#f9fafb',
      textSecondary: '#d1d5db',
      border: '#9a3412',
      success: '#22c55e',
      warning: '#fbbf24',
      error: '#f87171',
      info: '#60a5fa'
    }
  }
];

export default function ThemeManagerPage() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const {
    settings,
    setSettings,
    customScheme,
    setCustomScheme,
    saveSettings,
    resetToDefault,
    exportTheme,
    importTheme,
    predefinedSchemes,
    isLoading
  } = useThemeManager();
  
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);

  // إنشاء ثيم مخصص
  const createCustomScheme = () => {
    const baseScheme = predefinedSchemes.find(s => s.id === settings.currentScheme) || predefinedSchemes[0];
    setCustomScheme({
      ...baseScheme,
      id: 'custom',
      name: 'custom',
      displayName: 'ثيم مخصص'
    });
    setSettings(prev => ({ ...prev, currentScheme: 'custom' }));
  };

  // استيراد الثيم
  const handleImportTheme = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target?.result as string);
        importTheme(importData);
        toast.success('تم استيراد الثيم بنجاح');
      } catch (error) {
        toast.error('ملف الثيم غير صالح');
      }
    };
    reader.readAsText(file);
  };

  // حفظ الإعدادات مع toast
  const handleSaveSettings = async () => {
    try {
      await saveSettings();
      toast.success('تم حفظ إعدادات الثيم بنجاح');
    } catch (error) {
      toast.error('حدث خطأ في حفظ الإعدادات');
    }
  };

  // إعادة تعيين مع toast
  const handleReset = () => {
    resetToDefault();
    toast.success('تم إعادة تعيين الثيم للإعدادات الافتراضية');
  };

  // تصدير مع toast
  const handleExport = () => {
    exportTheme();
    toast.success('تم تصدير الثيم بنجاح');
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Palette className="h-8 w-8 text-blue-600" />
            إدارة الثيم والألوان
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            تحكم في مظهر وألوان المشروع بالكامل
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleReset}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            إعادة تعيين
          </Button>
          
          <Button
            onClick={handleSaveSettings}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            حفظ التغييرات
          </Button>
        </div>
      </div>

      <Tabs defaultValue="schemes" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="schemes" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            الثيمات
          </TabsTrigger>
          <TabsTrigger value="colors" className="flex items-center gap-2">
            <Droplets className="h-4 w-4" />
            الألوان
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            المظهر
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <Sliders className="h-4 w-4" />
            متقدم
          </TabsTrigger>
        </TabsList>

        {/* تبويب الثيمات */}
        <TabsContent value="schemes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brush className="h-5 w-5" />
                الثيمات المُعرّفة مسبقاً
              </CardTitle>
              <CardDescription>
                اختر من مجموعة الثيمات الجاهزة أو قم بإنشاء ثيم مخصص
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {predefinedSchemes.map((scheme) => (
                  <div
                    key={scheme.id}
                    className={`
                      border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md
                      ${settings.currentScheme === scheme.id 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                        : 'border-gray-200 dark:border-gray-700'
                      }
                    `}
                    onClick={() => setSettings(prev => ({ ...prev, currentScheme: scheme.id }))}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">{scheme.displayName}</h3>
                      {settings.currentScheme === scheme.id && (
                        <Check className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                    
                    {/* معاينة الألوان */}
                    <div className="flex gap-1 mb-3">
                      {Object.entries(resolvedTheme === 'dark' ? scheme.darkMode : scheme.colors)
                        .slice(0, 6)
                        .map(([key, color]) => (
                          <div
                            key={key}
                            className="w-6 h-6 rounded-full border border-gray-300"
                            style={{ backgroundColor: color }}
                            title={key}
                          />
                        ))
                      }
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {scheme.id === 'sabq' && 'الثيم الافتراضي لسبق'}
                      {scheme.id === 'emerald' && 'ثيم هادئ بدرجات الأخضر'}
                      {scheme.id === 'purple' && 'ثيم احترافي بدرجات البنفسجي'}
                      {scheme.id === 'rose' && 'ثيم دافئ بدرجات الوردي'}
                      {scheme.id === 'orange' && 'ثيم حيوي بدرجات البرتقالي'}
                    </p>
                  </div>
                ))}
                
                {/* خيار الثيم المخصص */}
                <div
                  className={`
                    border-2 border-dashed rounded-lg p-4 cursor-pointer transition-all hover:shadow-md
                    flex flex-col items-center justify-center min-h-[140px]
                    ${settings.currentScheme === 'custom' 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                      : 'border-gray-300 dark:border-gray-600'
                    }
                  `}
                  onClick={createCustomScheme}
                >
                  <Sparkles className="h-8 w-8 text-gray-400 mb-2" />
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300">
                    إنشاء ثيم مخصص
                  </h3>
                  <p className="text-xs text-gray-500 text-center mt-1">
                    قم بإنشاء ثيم خاص بك
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* تبويب الألوان */}
        <TabsContent value="colors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Droplets className="h-5 w-5" />
                تخصيص الألوان
              </CardTitle>
              <CardDescription>
                قم بتعديل ألوان الثيم المحدد حسب تفضيلاتك
              </CardDescription>
            </CardHeader>
            <CardContent>
              {customScheme && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* ألوان الوضع النهاري */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Sun className="h-5 w-5" />
                      الوضع النهاري
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(customScheme.colors).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-3">
                          <Label className="w-24 text-sm">{getColorLabel(key)}</Label>
                          <div className="flex items-center gap-2 flex-1">
                            <Input
                              type="color"
                              value={value}
                              onChange={(e) => {
                                if (customScheme) {
                                  setCustomScheme({
                                    ...customScheme,
                                    colors: { ...customScheme.colors, [key]: e.target.value }
                                  });
                                }
                              }}
                              className="w-12 h-8 p-0 border-0"
                            />
                            <Input
                              type="text"
                              value={value}
                              onChange={(e) => {
                                if (customScheme) {
                                  setCustomScheme({
                                    ...customScheme,
                                    colors: { ...customScheme.colors, [key]: e.target.value }
                                  });
                                }
                              }}
                              className="font-mono text-sm"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ألوان الوضع الليلي */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Moon className="h-5 w-5" />
                      الوضع الليلي
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(customScheme.darkMode).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-3">
                          <Label className="w-24 text-sm">{getColorLabel(key)}</Label>
                          <div className="flex items-center gap-2 flex-1">
                            <Input
                              type="color"
                              value={value}
                              onChange={(e) => {
                                if (customScheme) {
                                  setCustomScheme({
                                    ...customScheme,
                                    darkMode: { ...customScheme.darkMode, [key]: e.target.value }
                                  });
                                }
                              }}
                              className="w-12 h-8 p-0 border-0"
                            />
                            <Input
                              type="text"
                              value={value}
                              onChange={(e) => {
                                if (customScheme) {
                                  setCustomScheme({
                                    ...customScheme,
                                    darkMode: { ...customScheme.darkMode, [key]: e.target.value }
                                  });
                                }
                              }}
                              className="font-mono text-sm"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {!customScheme && (
                <div className="text-center py-8">
                  <Palette className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    لا يوجد ثيم مخصص
                  </h3>
                  <p className="text-gray-500 mb-4">
                    قم بإنشاء ثيم مخصص من تبويب "الثيمات" لتتمكن من تعديل الألوان
                  </p>
                  <Button onClick={createCustomScheme} variant="outline">
                    إنشاء ثيم مخصص
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* تبويب المظهر */}
        <TabsContent value="appearance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* إعدادات المظهر العامة */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  إعدادات المظهر
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>تفعيل الحركات والانتقالات</Label>
                  <Switch
                    checked={settings.enableAnimations}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, enableAnimations: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>الوضع المضغوط</Label>
                  <Switch
                    checked={settings.compactMode}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, compactMode: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>تبديل تلقائي للثيم</Label>
                  <Switch
                    checked={settings.autoTheme}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, autoTheme: checked }))
                    }
                  />
                </div>
                
                <Separator />
                
                <div>
                  <Label className="mb-3 block">انحناء الحواف</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { value: 'none', label: 'بدون', icon: Square },
                      { value: 'small', label: 'صغير', icon: Square },
                      { value: 'medium', label: 'متوسط', icon: Square },
                      { value: 'large', label: 'كبير', icon: Circle }
                    ].map(({ value, label, icon: Icon }) => (
                      <Button
                        key={value}
                        variant={settings.borderRadius === value ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSettings(prev => ({ ...prev, borderRadius: value as any }))}
                        className="flex flex-col items-center gap-1 h-auto p-3"
                      >
                        <Icon className="h-4 w-4" />
                        <span className="text-xs">{label}</span>
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label className="mb-3 block">حجم الخط</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'small', label: 'صغير' },
                      { value: 'medium', label: 'متوسط' },
                      { value: 'large', label: 'كبير' }
                    ].map(({ value, label }) => (
                      <Button
                        key={value}
                        variant={settings.fontSize === value ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSettings(prev => ({ ...prev, fontSize: value as any }))}
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* معاينة الثيم */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  معاينة الثيم
                </CardTitle>
                <CardDescription>
                  معاينة مباشرة للثيم مع مكونات تفاعلية
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 p-4 rounded-lg" style={{
                  backgroundColor: 'var(--theme-surface, #f8fafc)',
                  color: 'var(--theme-text, #1e293b)',
                  borderColor: 'var(--theme-border, #e2e8f0)'
                }}>
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-full"
                      style={{ backgroundColor: 'var(--theme-primary, #1e40af)' }}
                    />
                    <div>
                      <h4 className="font-semibold">عنوان تجريبي</h4>
                      <p className="text-sm opacity-70">نص فرعي تجريبي</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      className="px-3 py-1 rounded text-white text-sm transition-all hover:scale-105"
                      style={{ backgroundColor: 'var(--theme-primary, #1e40af)' }}
                    >
                      زر أساسي
                    </button>
                    <button 
                      className="px-3 py-1 rounded text-sm border transition-all hover:scale-105"
                      style={{ 
                        borderColor: 'var(--theme-border, #e2e8f0)',
                        color: 'var(--theme-text, #1e293b)'
                      }}
                    >
                      زر ثانوي
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: 'var(--theme-success, #10b981)' }}
                      />
                      نجاح
                    </div>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: 'var(--theme-warning, #f59e0b)' }}
                      />
                      تحذير
                    </div>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: 'var(--theme-error, #ef4444)' }}
                      />
                      خطأ
                    </div>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: 'var(--theme-info, #3b82f6)' }}
                      />
                      معلومات
                    </div>
                  </div>

                  <div className="mt-4 p-3 rounded border" style={{ borderColor: 'var(--theme-border, #e2e8f0)' }}>
                    <div className="text-sm font-medium mb-2">بطاقة تجريبية</div>
                    <div className="text-xs opacity-70">
                      هذا نص تجريبي لمعاينة التصميم والألوان في الثيم المحدد.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* تبويب المتقدم */}
        <TabsContent value="advanced" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* تصدير واستيراد */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  تصدير واستيراد
                </CardTitle>
                <CardDescription>
                  حفظ ومشاركة إعدادات الثيم المخصص
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={handleExport}
                  variant="outline"
                  className="w-full flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  تصدير الثيم الحالي
                </Button>
                
                <div>
                  <Label className="cursor-pointer">
                    <Button variant="outline" className="w-full flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      استيراد ثيم
                    </Button>
                  </Label>
                  <input
                    id="import-theme"
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={handleImportTheme}
                  />
                </div>
              </CardContent>
            </Card>

            {/* معلومات الثيم */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  معلومات الثيم
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">الثيم الحالي:</span>
                  <span className="font-medium">
                    {predefinedSchemes.find(s => s.id === settings.currentScheme)?.displayName || 'ثيم مخصص'}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">الوضع:</span>
                  <span className="font-medium">
                    {resolvedTheme === 'dark' ? 'ليلي' : 'نهاري'}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">الحركات:</span>
                  <span className="font-medium">
                    {settings.enableAnimations ? 'مفعلة' : 'معطلة'}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">الوضع المضغوط:</span>
                  <span className="font-medium">
                    {settings.compactMode ? 'مفعل' : 'معطل'}
                  </span>
                </div>
                
                <Separator />
                
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  سيتم تطبيق التغييرات على المشروع بالكامل عند الحفظ
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// دالة مساعدة لترجمة أسماء الألوان
function getColorLabel(key: string): string {
  const labels: Record<string, string> = {
    primary: 'أساسي',
    secondary: 'ثانوي',
    accent: 'مميز',
    background: 'خلفية',
    surface: 'سطح',
    text: 'نص',
    textSecondary: 'نص ثانوي',
    border: 'حدود',
    success: 'نجاح',
    warning: 'تحذير',
    error: 'خطأ',
    info: 'معلومات'
  };
  return labels[key] || key;
}
