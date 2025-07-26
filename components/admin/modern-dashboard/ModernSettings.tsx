/**
 * صفحة الإعدادات الحديثة
 * Modern Settings Page
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import DashboardLayout from '@/components/admin/modern-dashboard/DashboardLayout';
import {
  Settings,
  Globe,
  Shield,
  Bell,
  Palette,
  Database,
  Zap,
  Mail,
  Smartphone,
  Lock,
  Users,
  FileText,
  Cloud,
  Save,
  RotateCcw,
  Eye,
  EyeOff,
  Info,
  AlertTriangle,
  CheckCircle,
  Upload,
  Download,
  RefreshCw,
  Key,
  Monitor,
  Server,
  HardDrive
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SettingGroup {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  settings: Setting[];
}

interface Setting {
  id: string;
  name: string;
  description: string;
  type: 'boolean' | 'string' | 'number' | 'select' | 'textarea';
  value: any;
  options?: { label: string; value: string }[];
  required?: boolean;
  sensitive?: boolean;
}

const settingsData: SettingGroup[] = [
  {
    id: 'general',
    title: 'إعدادات عامة',
    description: 'الإعدادات الأساسية للموقع',
    icon: Settings,
    settings: [
      {
        id: 'site_name',
        name: 'اسم الموقع',
        description: 'اسم الموقع الذي يظهر في الشريط العلوي',
        type: 'string',
        value: 'سبق الذكية',
        required: true
      },
      {
        id: 'site_description',
        name: 'وصف الموقع',
        description: 'وصف قصير للموقع يظهر في محركات البحث',
        type: 'textarea',
        value: 'منصة إعلامية ذكية تقدم الأخبار والتحليلات بتقنيات الذكاء الاصطناعي',
        required: true
      },
      {
        id: 'maintenance_mode',
        name: 'وضع الصيانة',
        description: 'تفعيل وضع الصيانة للموقع',
        type: 'boolean',
        value: false
      },
      {
        id: 'default_language',
        name: 'اللغة الافتراضية',
        description: 'لغة الواجهة الافتراضية',
        type: 'select',
        value: 'ar',
        options: [
          { label: 'العربية', value: 'ar' },
          { label: 'English', value: 'en' }
        ]
      }
    ]
  },
  {
    id: 'security',
    title: 'الأمان والحماية',
    description: 'إعدادات الأمان وحماية البيانات',
    icon: Shield,
    settings: [
      {
        id: 'two_factor_auth',
        name: 'المصادقة الثنائية',
        description: 'تفعيل المصادقة الثنائية لجميع المدراء',
        type: 'boolean',
        value: true
      },
      {
        id: 'session_timeout',
        name: 'انتهاء صلاحية الجلسة (دقيقة)',
        description: 'مدة انتهاء صلاحية جلسة المستخدم',
        type: 'number',
        value: 120
      },
      {
        id: 'password_policy',
        name: 'سياسة كلمة المرور القوية',
        description: 'إلزام استخدام كلمات مرور قوية',
        type: 'boolean',
        value: true
      },
      {
        id: 'api_rate_limit',
        name: 'حد معدل API (طلب/دقيقة)',
        description: 'عدد الطلبات المسموحة لكل دقيقة',
        type: 'number',
        value: 100
      }
    ]
  },
  {
    id: 'notifications',
    title: 'التنبيهات',
    description: 'إعدادات التنبيهات والإشعارات',
    icon: Bell,
    settings: [
      {
        id: 'email_notifications',
        name: 'تنبيهات الإيميل',
        description: 'إرسال التنبيهات عبر البريد الإلكتروني',
        type: 'boolean',
        value: true
      },
      {
        id: 'push_notifications',
        name: 'الإشعارات الفورية',
        description: 'إرسال إشعارات فورية للمتصفح',
        type: 'boolean',
        value: true
      },
      {
        id: 'notification_frequency',
        name: 'تكرار التنبيهات',
        description: 'عدد مرات إرسال التنبيهات',
        type: 'select',
        value: 'immediate',
        options: [
          { label: 'فوري', value: 'immediate' },
          { label: 'يومي', value: 'daily' },
          { label: 'أسبوعي', value: 'weekly' }
        ]
      }
    ]
  },
  {
    id: 'content',
    title: 'إدارة المحتوى',
    description: 'إعدادات المحتوى والنشر',
    icon: FileText,
    settings: [
      {
        id: 'auto_publish',
        name: 'النشر التلقائي',
        description: 'نشر المقالات تلقائياً بعد المراجعة',
        type: 'boolean',
        value: false
      },
      {
        id: 'content_moderation',
        name: 'إشراف ذكي على المحتوى',
        description: 'استخدام الذكاء الاصطناعي لمراجعة المحتوى',
        type: 'boolean',
        value: true
      },
      {
        id: 'max_article_length',
        name: 'طول المقال الأقصى (كلمة)',
        description: 'عدد الكلمات الأقصى للمقال الواحد',
        type: 'number',
        value: 5000
      },
      {
        id: 'auto_tags',
        name: 'العلامات التلقائية',
        description: 'إنشاء علامات تلقائية للمقالات',
        type: 'boolean',
        value: true
      }
    ]
  },
  {
    id: 'performance',
    title: 'الأداء والتحسين',
    description: 'إعدادات تحسين الأداء',
    icon: Zap,
    settings: [
      {
        id: 'cache_enabled',
        name: 'ذاكرة التخزين المؤقت',
        description: 'تفعيل نظام التخزين المؤقت',
        type: 'boolean',
        value: true
      },
      {
        id: 'image_optimization',
        name: 'تحسين الصور',
        description: 'ضغط وتحسين الصور تلقائياً',
        type: 'boolean',
        value: true
      },
      {
        id: 'cdn_enabled',
        name: 'شبكة توصيل المحتوى (CDN)',
        description: 'استخدام CDN لتسريع التحميل',
        type: 'boolean',
        value: true
      },
      {
        id: 'lazy_loading',
        name: 'التحميل التدريجي',
        description: 'تحميل المحتوى عند الحاجة فقط',
        type: 'boolean',
        value: true
      }
    ]
  }
];

export default function ModernSettings() {
  const [settings, setSettings] = useState(settingsData);
  const [activeTab, setActiveTab] = useState('general');
  const [hasChanges, setHasChanges] = useState(false);
  const [showSensitive, setShowSensitive] = useState<Record<string, boolean>>({});

  const updateSetting = (groupId: string, settingId: string, value: any) => {
    setSettings(prev => prev.map(group => 
      group.id === groupId 
        ? {
            ...group,
            settings: group.settings.map(setting =>
              setting.id === settingId ? { ...setting, value } : setting
            )
          }
        : group
    ));
    setHasChanges(true);
  };

  const toggleSensitive = (settingId: string) => {
    setShowSensitive(prev => ({
      ...prev,
      [settingId]: !prev[settingId]
    }));
  };

  const saveSettings = () => {
    // حفظ الإعدادات
    console.log('Saving settings:', settings);
    setHasChanges(false);
    // إظهار رسالة نجاح
  };

  const resetSettings = () => {
    setSettings(settingsData);
    setHasChanges(false);
  };

  const renderSettingInput = (setting: Setting, groupId: string) => {
    const commonProps = {
      id: setting.id,
      required: setting.required
    };

    switch (setting.type) {
      case 'boolean':
        return (
          <Switch
            checked={setting.value}
            onCheckedChange={(checked) => updateSetting(groupId, setting.id, checked)}
          />
        );
      
      case 'string':
        return (
          <div className="relative">
            <Input
              {...commonProps}
              type={setting.sensitive && !showSensitive[setting.id] ? 'password' : 'text'}
              value={setting.value}
              onChange={(e) => updateSetting(groupId, setting.id, e.target.value)}
              className="pr-10"
            />
            {setting.sensitive && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute left-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => toggleSensitive(setting.id)}
              >
                {showSensitive[setting.id] ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        );
      
      case 'number':
        return (
          <Input
            {...commonProps}
            type="number"
            value={setting.value}
            onChange={(e) => updateSetting(groupId, setting.id, parseInt(e.target.value))}
          />
        );
      
      case 'textarea':
        return (
          <Textarea
            {...commonProps}
            value={setting.value}
            onChange={(e) => updateSetting(groupId, setting.id, e.target.value)}
            rows={3}
          />
        );
      
      case 'select':
        return (
          <select
            {...commonProps}
            value={setting.value}
            onChange={(e) => updateSetting(groupId, setting.id, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {setting.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      
      default:
        return null;
    }
  };

  return (
    <DashboardLayout 
      pageTitle="إعدادات النظام"
      pageDescription="تكوين وإدارة إعدادات منصة سبق الذكية"
    >
      <div className="space-y-6">
        {/* شريط الحفظ العلوي */}
        {hasChanges && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div>
                <div className="font-medium text-yellow-800">لديك تغييرات غير محفوظة</div>
                <div className="text-sm text-yellow-600">احرص على حفظ التغييرات قبل الخروج</div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={resetSettings}>
                <RotateCcw className="h-4 w-4 mr-2" />
                إلغاء التغييرات
              </Button>
              <Button onClick={saveSettings} className="bg-green-600 hover:bg-green-700">
                <Save className="h-4 w-4 mr-2" />
                حفظ الإعدادات
              </Button>
            </div>
          </div>
        )}

        {/* حالة النظام */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { title: 'حالة النظام', value: 'متصل', icon: CheckCircle, color: 'green' },
            { title: 'آخر نسخة احتياطية', value: 'منذ ساعة', icon: Database, color: 'blue' },
            { title: 'استخدام التخزين', value: '67%', icon: HardDrive, color: 'purple' },
            { title: 'أداء الخادم', value: '98%', icon: Server, color: 'orange' }
          ].map((stat) => (
            <Card key={stat.title}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
                    <p className="text-xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon className={cn(
                    "h-8 w-8",
                    stat.color === 'green' && "text-green-500",
                    stat.color === 'blue' && "text-blue-500",
                    stat.color === 'purple' && "text-purple-500",
                    stat.color === 'orange' && "text-orange-500"
                  )} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* التبويبات */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            {settings.map((group) => (
              <TabsTrigger key={group.id} value={group.id}>
                <group.icon className="h-4 w-4 mr-2" />
                {group.title}
              </TabsTrigger>
            ))}
          </TabsList>

          {settings.map((group) => (
            <TabsContent key={group.id} value={group.id} className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <group.icon className="h-6 w-6 text-blue-500" />
                    <div>
                      <CardTitle>{group.title}</CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {group.description}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {group.settings.map((setting) => (
                    <div key={setting.id} className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <Label htmlFor={setting.id} className="text-sm font-medium flex items-center gap-2">
                            {setting.name}
                            {setting.required && (
                              <Badge variant="outline" className="text-xs">مطلوب</Badge>
                            )}
                            {setting.sensitive && (
                              <Badge variant="secondary" className="text-xs">حساس</Badge>
                            )}
                          </Label>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {setting.description}
                          </p>
                        </div>
                        <div className="w-64">
                          {renderSettingInput(setting, group.id)}
                        </div>
                      </div>
                      {setting.id === group.settings[group.settings.length - 1].id && 
                       group.settings.indexOf(setting) !== group.settings.length - 1 && (
                        <hr className="my-4" />
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* إعدادات إضافية حسب النوع */}
              {group.id === 'security' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Key className="h-5 w-5" />
                      إدارة المفاتيح والشهادات
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button variant="outline" className="h-20 flex-col">
                        <Upload className="h-6 w-6 mb-2" />
                        رفع شهادة SSL
                      </Button>
                      <Button variant="outline" className="h-20 flex-col">
                        <RefreshCw className="h-6 w-6 mb-2" />
                        تجديد المفاتيح
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {group.id === 'performance' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Monitor className="h-5 w-5" />
                      إحصائيات الأداء
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { metric: 'متوسط وقت التحميل', value: '2.3s', status: 'good' },
                        { metric: 'معدل نجاح التخزين المؤقت', value: '94.2%', status: 'excellent' },
                        { metric: 'استخدام الذاكرة', value: '67%', status: 'average' }
                      ].map((metric) => (
                        <div key={metric.metric} className="text-center p-4 border rounded-lg">
                          <div className="text-2xl font-bold">{metric.value}</div>
                          <div className="text-sm text-gray-600">{metric.metric}</div>
                          <Badge 
                            variant={metric.status === 'excellent' ? 'default' : 'secondary'}
                            className="mt-2"
                          >
                            {metric.status === 'excellent' ? 'ممتاز' : 
                             metric.status === 'good' ? 'جيد' : 'متوسط'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          ))}
        </Tabs>

        {/* أزرار الحفظ السفلية */}
        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button variant="outline" onClick={resetSettings}>
            <RotateCcw className="h-4 w-4 mr-2" />
            إعادة تعيين
          </Button>
          <Button onClick={saveSettings} disabled={!hasChanges}>
            <Save className="h-4 w-4 mr-2" />
            حفظ جميع الإعدادات
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
