"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Bell, 
  Settings, 
  Zap, 
  Clock, 
  Mail, 
  MessageSquare, 
  Smartphone,
  Globe,
  Brain,
  TrendingUp,
  Shield,
  CheckCircle,
  AlertCircle,
  Save
} from 'lucide-react';
import toast from 'react-hot-toast';

interface NotificationSettings {
  enabled: boolean;
  channels: {
    email: boolean;
    push: boolean;
    sms: boolean;
    inApp: boolean;
  };
  aiFeatures: {
    smartTiming: boolean;
    contentPersonalization: boolean;
    priorityOptimization: boolean;
    userSegmentation: boolean;
  };
  categories: {
    news: boolean;
    comments: boolean;
    mentions: boolean;
    system: boolean;
    marketing: boolean;
  };
  schedule: {
    quietHoursEnabled: boolean;
    quietHoursStart: string;
    quietHoursEnd: string;
    weekendNotifications: boolean;
  };
}

export default function NotificationSettingsPage() {
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: true,
    channels: {
      email: true,
      push: true,
      sms: false,
      inApp: true
    },
    aiFeatures: {
      smartTiming: true,
      contentPersonalization: true,
      priorityOptimization: true,
      userSegmentation: false
    },
    categories: {
      news: true,
      comments: true,
      mentions: true,
      system: true,
      marketing: false
    },
    schedule: {
      quietHoursEnabled: true,
      quietHoursStart: '22:00',
      quietHoursEnd: '08:00',
      weekendNotifications: false
    }
  });

  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalSent: 15420,
    delivered: 14890,
    opened: 12340,
    clicked: 8920
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      // هنا يتم حفظ الإعدادات
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('تم حفظ إعدادات الإشعارات بنجاح');
    } catch (error) {
      toast.error('حدث خطأ في حفظ الإعدادات');
    } finally {
      setLoading(false);
    }
  };

  const toggleChannel = (channel: keyof typeof settings.channels) => {
    setSettings(prev => ({
      ...prev,
      channels: {
        ...prev.channels,
        [channel]: !prev.channels[channel]
      }
    }));
  };

  const toggleAIFeature = (feature: keyof typeof settings.aiFeatures) => {
    setSettings(prev => ({
      ...prev,
      aiFeatures: {
        ...prev.aiFeatures,
        [feature]: !prev.aiFeatures[feature]
      }
    }));
  };

  const toggleCategory = (category: keyof typeof settings.categories) => {
    setSettings(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [category]: !prev.categories[category]
      }
    }));
  };

  return (
    <div className="space-y-6">
      {/* الهيدر */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bell className="h-8 w-8 text-blue-600" />
            إعدادات الإشعارات الذكية
          </h1>
          <p className="text-gray-600 mt-2">تحكم في كيفية وصول الإشعارات إليك</p>
        </div>
        <Button onClick={handleSave} disabled={loading}>
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
        </Button>
      </div>

      {/* الإحصائيات السريعة */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">الإشعارات المرسلة</p>
                <p className="text-2xl font-bold">{stats.totalSent.toLocaleString()}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">معدل التسليم</p>
                <p className="text-2xl font-bold">{((stats.delivered / stats.totalSent) * 100).toFixed(1)}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">معدل الفتح</p>
                <p className="text-2xl font-bold">{((stats.opened / stats.delivered) * 100).toFixed(1)}%</p>
              </div>
              <Mail className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">معدل النقر</p>
                <p className="text-2xl font-bold">{((stats.clicked / stats.opened) * 100).toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* التبويبات الرئيسية */}
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">عام</TabsTrigger>
          <TabsTrigger value="channels">قنوات التوصيل</TabsTrigger>
          <TabsTrigger value="ai">الذكاء الاصطناعي</TabsTrigger>
          <TabsTrigger value="schedule">الجدولة</TabsTrigger>
        </TabsList>

        {/* تبويب الإعدادات العامة */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>الإعدادات العامة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notifications-enabled">تفعيل الإشعارات</Label>
                  <p className="text-sm text-gray-600">تفعيل أو تعطيل جميع الإشعارات</p>
                </div>
                <Switch
                  id="notifications-enabled"
                  checked={settings.enabled}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enabled: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>فئات الإشعارات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries({
                news: { label: 'الأخبار العاجلة', icon: Globe },
                comments: { label: 'التعليقات والردود', icon: MessageSquare },
                mentions: { label: 'الإشارات والمنشنات', icon: Bell },
                system: { label: 'تحديثات النظام', icon: Settings },
                marketing: { label: 'العروض والتسويق', icon: TrendingUp }
              }).map(([key, { label, icon: Icon }]) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-gray-600" />
                    <Label htmlFor={`category-${key}`}>{label}</Label>
                  </div>
                  <Switch
                    id={`category-${key}`}
                    checked={settings.categories[key as keyof typeof settings.categories]}
                    onCheckedChange={() => toggleCategory(key as keyof typeof settings.categories)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* تبويب قنوات التوصيل */}
        <TabsContent value="channels" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>قنوات التوصيل المتاحة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries({
                email: { label: 'البريد الإلكتروني', icon: Mail, badge: 'مفعّل' },
                push: { label: 'الإشعارات الفورية', icon: Smartphone, badge: 'مفعّل' },
                sms: { label: 'الرسائل النصية', icon: MessageSquare, badge: 'معطّل' },
                inApp: { label: 'داخل التطبيق', icon: Bell, badge: 'مفعّل' }
              }).map(([key, { label, icon: Icon, badge }]) => (
                <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-gray-600" />
                    <div>
                      <Label htmlFor={`channel-${key}`}>{label}</Label>
                      <Badge variant={settings.channels[key as keyof typeof settings.channels] ? 'default' : 'secondary'} className="ml-2">
                        {settings.channels[key as keyof typeof settings.channels] ? 'مفعّل' : 'معطّل'}
                      </Badge>
                    </div>
                  </div>
                  <Switch
                    id={`channel-${key}`}
                    checked={settings.channels[key as keyof typeof settings.channels]}
                    onCheckedChange={() => toggleChannel(key as keyof typeof settings.channels)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* تبويب الذكاء الاصطناعي */}
        <TabsContent value="ai" className="space-y-4">
          <Alert>
            <Zap className="h-4 w-4" />
            <AlertDescription>
              مميزات الذكاء الاصطناعي تساعد في تحسين تجربة الإشعارات وزيادة معدلات التفاعل
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                مميزات الذكاء الاصطناعي
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries({
                smartTiming: { 
                  label: 'التوقيت الذكي', 
                  description: 'إرسال الإشعارات في الوقت الأنسب لكل مستخدم'
                },
                contentPersonalization: { 
                  label: 'تخصيص المحتوى', 
                  description: 'تخصيص نص الإشعار بناءً على اهتمامات المستخدم'
                },
                priorityOptimization: { 
                  label: 'تحسين الأولوية', 
                  description: 'ترتيب الإشعارات حسب أهميتها للمستخدم'
                },
                userSegmentation: { 
                  label: 'تجزئة المستخدمين', 
                  description: 'إرسال إشعارات مختلفة لشرائح مختلفة'
                }
              }).map(([key, { label, description }]) => (
                <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <Label htmlFor={`ai-${key}`} className="text-base">{label}</Label>
                    <p className="text-sm text-gray-600 mt-1">{description}</p>
                  </div>
                  <Switch
                    id={`ai-${key}`}
                    checked={settings.aiFeatures[key as keyof typeof settings.aiFeatures]}
                    onCheckedChange={() => toggleAIFeature(key as keyof typeof settings.aiFeatures)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* تبويب الجدولة */}
        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                إعدادات الجدولة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="quiet-hours">ساعات الهدوء</Label>
                  <p className="text-sm text-gray-600">عدم إرسال إشعارات خلال فترة معينة</p>
                </div>
                <Switch
                  id="quiet-hours"
                  checked={settings.schedule.quietHoursEnabled}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    schedule: { ...prev.schedule, quietHoursEnabled: checked }
                  }))}
                />
              </div>

              {settings.schedule.quietHoursEnabled && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label htmlFor="quiet-start">من الساعة</Label>
                    <input
                      id="quiet-start"
                      type="time"
                      value={settings.schedule.quietHoursStart}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        schedule: { ...prev.schedule, quietHoursStart: e.target.value }
                      }))}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <Label htmlFor="quiet-end">إلى الساعة</Label>
                    <input
                      id="quiet-end"
                      type="time"
                      value={settings.schedule.quietHoursEnd}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        schedule: { ...prev.schedule, quietHoursEnd: e.target.value }
                      }))}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between mt-6">
                <div>
                  <Label htmlFor="weekend-notifications">إشعارات نهاية الأسبوع</Label>
                  <p className="text-sm text-gray-600">إرسال إشعارات في أيام الجمعة والسبت</p>
                </div>
                <Switch
                  id="weekend-notifications"
                  checked={settings.schedule.weekendNotifications}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    schedule: { ...prev.schedule, weekendNotifications: checked }
                  }))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
