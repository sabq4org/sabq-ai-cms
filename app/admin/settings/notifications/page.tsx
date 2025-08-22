"use client";

import React, { useState, useEffect } from 'react';
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
  Save,
  Loader2,
  Activity,
  BarChart3,
  Users,
  Target,
  Sparkles,
  BellRing,
  Volume2,
  VolumeX,
  Timer,
  Calendar
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
  const [testingChannel, setTestingChannel] = useState<string | null>(null);
  const [creatingDemo, setCreatingDemo] = useState(false);
  const [stats, setStats] = useState({
    totalSent: 15420,
    delivered: 14890,
    opened: 12340,
    clicked: 8920,
    activeUsers: 4521,
    avgDeliveryTime: 2.3
  });

  // جلب الإعدادات من الخادم
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/notifications/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/notifications/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        toast.success('تم حفظ إعدادات الإشعارات بنجاح');
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      toast.error('حدث خطأ في حفظ الإعدادات');
    } finally {
      setLoading(false);
    }
  };

  const createDemoNotifications = async () => {
    setCreatingDemo(true);
    try {
      const response = await fetch('/api/notifications/demo', {
        method: 'POST'
      });

      if (response.ok) {
        toast.success('تم إنشاء إشعارات تجريبية بنجاح');
      } else {
        throw new Error('Failed to create demo notifications');
      }
    } catch (error) {
      toast.error('فشل إنشاء الإشعارات التجريبية');
    } finally {
      setCreatingDemo(false);
    }
  };

  const testNotification = async (channel: string) => {
    setTestingChannel(channel);
    try {
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel })
      });

      if (response.ok) {
        toast.success(`تم إرسال إشعار تجريبي عبر ${getChannelName(channel)}`);
      } else {
        throw new Error('Failed to send test notification');
      }
    } catch (error) {
      toast.error('فشل إرسال الإشعار التجريبي');
    } finally {
      setTestingChannel(null);
    }
  };

  const getChannelName = (channel: string) => {
    const names: Record<string, string> = {
      email: 'البريد الإلكتروني',
      push: 'الإشعارات الفورية',
      sms: 'الرسائل النصية',
      inApp: 'داخل التطبيق'
    };
    return names[channel] || channel;
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
    <div style={{ padding: '0', background: 'hsl(var(--bg))' }}>
      {/* الهيدر */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                background: 'linear-gradient(135deg, hsl(var(--accent)), hsl(var(--accent-hover)))',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px hsla(var(--accent), 0.3)'
              }}>
                <Bell style={{ width: '28px', height: '28px', color: 'white' }} />
              </div>
              <div>
                <h1 className="heading-2" style={{ marginBottom: '4px' }}>
                  نظام الإشعارات الذكية
                </h1>
                <p className="text-muted">
                  تحكم كامل في إشعاراتك مع قوة الذكاء الاصطناعي
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <button
                className={`btn btn-ghost btn-sm ${creatingDemo ? 'loading' : ''}`}
                onClick={createDemoNotifications}
                disabled={creatingDemo}
                style={{ minWidth: '140px' }}
              >
                {creatingDemo ? (
                  <>
                    <Loader2 className="animate-spin" style={{ width: '14px', height: '14px', marginRight: '6px' }} />
                    جاري الإنشاء...
                  </>
                ) : (
                  <>
                    <Sparkles style={{ width: '14px', height: '14px', marginRight: '6px' }} />
                    إشعارات تجريبية
                  </>
                )}
              </button>
              <div style={{ textAlign: 'center' }}>
                <div className="text-xs text-muted">الحالة</div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px',
                  marginTop: '4px'
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: settings.enabled ? '#10b981' : '#ef4444',
                    animation: settings.enabled ? 'pulse 2s infinite' : 'none'
                  }} />
                  <span className="text-sm font-medium">
                    {settings.enabled ? 'مفعّل' : 'معطّل'}
                  </span>
                </div>
              </div>
              <button
                className={`btn btn-primary ${loading ? 'loading' : ''}`}
                onClick={handleSave}
                disabled={loading}
                style={{ minWidth: '120px' }}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Save style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                    حفظ التغييرات
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* الإحصائيات المباشرة */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '16px',
        marginBottom: '24px'
      }}>
        {[
          { 
            title: 'إجمالي الإشعارات', 
            value: stats.totalSent.toLocaleString(), 
            icon: MessageSquare, 
            color: 'hsl(var(--accent))',
            trend: '+12%'
          },
          { 
            title: 'نسبة التسليم', 
            value: `${((stats.delivered / stats.totalSent) * 100).toFixed(1)}%`, 
            icon: CheckCircle, 
            color: '#10b981',
            trend: '+3.2%'
          },
          { 
            title: 'معدل الفتح', 
            value: `${((stats.opened / stats.delivered) * 100).toFixed(1)}%`, 
            icon: Mail, 
            color: '#8b5cf6',
            trend: '+5.7%'
          },
          { 
            title: 'معدل التفاعل', 
            value: `${((stats.clicked / stats.opened) * 100).toFixed(1)}%`, 
            icon: TrendingUp, 
            color: '#f59e0b',
            trend: '+8.4%'
          },
          { 
            title: 'المستخدمون النشطون', 
            value: stats.activeUsers.toLocaleString(), 
            icon: Users, 
            color: '#3b82f6',
            trend: '+125'
          },
          { 
            title: 'زمن التسليم', 
            value: `${stats.avgDeliveryTime} ثانية`, 
            icon: Timer, 
            color: '#06b6d4',
            trend: '-0.3s'
          }
        ].map((stat, index) => (
          <div key={index} className="card card-hover" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p className="text-xs text-muted" style={{ marginBottom: '8px' }}>{stat.title}</p>
                <p className="heading-3" style={{ marginBottom: '4px', color: stat.color }}>
                  {stat.value}
                </p>
                <p className="text-xs" style={{ color: '#10b981' }}>{stat.trend}</p>
              </div>
              <div style={{
                width: '48px',
                height: '48px',
                background: `${stat.color}20`,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <stat.icon style={{ width: '24px', height: '24px', color: stat.color }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* المحتوى الرئيسي */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* القسم الأيسر */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* التحكم الرئيسي */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">التحكم الرئيسي</div>
            </div>
            <div style={{ padding: '24px' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                padding: '16px',
                background: settings.enabled ? 'hsla(var(--accent), 0.1)' : 'hsla(0, 0%, 50%, 0.1)',
                borderRadius: '12px',
                border: `1px solid ${settings.enabled ? 'hsla(var(--accent), 0.3)' : 'hsla(0, 0%, 50%, 0.3)'}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {settings.enabled ? (
                    <Volume2 style={{ width: '24px', height: '24px', color: 'hsl(var(--accent))' }} />
                  ) : (
                    <VolumeX style={{ width: '24px', height: '24px', color: 'hsl(var(--text-muted))' }} />
                  )}
                  <div>
                    <div className="font-medium">نظام الإشعارات</div>
                    <div className="text-xs text-muted">
                      {settings.enabled ? 'جميع الإشعارات مفعّلة' : 'جميع الإشعارات معطّلة'}
                    </div>
                  </div>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={settings.enabled}
                    onChange={(e) => setSettings(prev => ({ ...prev, enabled: e.target.checked }))}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          </div>

          {/* قنوات التوصيل */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">قنوات التوصيل</div>
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {Object.entries({
                email: { label: 'البريد الإلكتروني', icon: Mail, description: 'إشعارات مفصلة للبريد' },
                push: { label: 'الإشعارات الفورية', icon: Smartphone, description: 'إشعارات المتصفح والجوال' },
                sms: { label: 'الرسائل النصية', icon: MessageSquare, description: 'رسائل SMS للأمور المهمة' },
                inApp: { label: 'داخل التطبيق', icon: BellRing, description: 'إشعارات داخل الموقع' }
              }).map(([key, { label, icon: Icon, description }]) => (
                <div 
                  key={key} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px solid hsl(var(--line))',
                    background: settings.channels[key as keyof typeof settings.channels] 
                      ? 'hsla(var(--accent), 0.05)' 
                      : 'hsl(var(--bg))'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: settings.channels[key as keyof typeof settings.channels]
                        ? 'hsla(var(--accent), 0.15)'
                        : 'hsl(var(--line))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Icon style={{ 
                        width: '20px', 
                        height: '20px',
                        color: settings.channels[key as keyof typeof settings.channels]
                          ? 'hsl(var(--accent))'
                          : 'hsl(var(--text-muted))'
                      }} />
                    </div>
                    <div>
                      <div className="font-medium">{label}</div>
                      <div className="text-xs text-muted">{description}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                      className="btn btn-sm btn-ghost"
                      onClick={() => testNotification(key)}
                      disabled={!settings.channels[key as keyof typeof settings.channels] || testingChannel === key}
                    >
                      {testingChannel === key ? (
                        <Loader2 className="animate-spin" style={{ width: '14px', height: '14px' }} />
                      ) : (
                        'تجربة'
                      )}
                    </button>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={settings.channels[key as keyof typeof settings.channels]}
                        onChange={() => toggleChannel(key as keyof typeof settings.channels)}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* فئات الإشعارات */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">فئات الإشعارات</div>
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {Object.entries({
                news: { label: 'الأخبار العاجلة', icon: Globe, color: '#ef4444' },
                comments: { label: 'التعليقات والردود', icon: MessageSquare, color: '#3b82f6' },
                mentions: { label: 'الإشارات والمنشنات', icon: Bell, color: '#8b5cf6' },
                system: { label: 'تحديثات النظام', icon: Settings, color: '#06b6d4' },
                marketing: { label: 'العروض والتسويق', icon: TrendingUp, color: '#f59e0b' }
              }).map(([key, { label, icon: Icon, color }]) => (
                <div 
                  key={key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    background: settings.categories[key as keyof typeof settings.categories]
                      ? `${color}10`
                      : 'hsl(var(--bg-elevated))'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Icon style={{ width: '18px', height: '18px', color }} />
                    <span className="text-sm font-medium">{label}</span>
                  </div>
                  <label className="switch switch-sm">
                    <input
                      type="checkbox"
                      checked={settings.categories[key as keyof typeof settings.categories]}
                      onChange={() => toggleCategory(key as keyof typeof settings.categories)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* القسم الأيمن */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* مميزات الذكاء الاصطناعي */}
          <div className="card">
            <div className="card-header">
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Brain style={{ width: '20px', height: '20px', color: 'hsl(var(--accent))' }} />
                مميزات الذكاء الاصطناعي
              </div>
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {Object.entries({
                smartTiming: { 
                  label: 'التوقيت الذكي',
                  description: 'يحدد أفضل وقت لإرسال الإشعار لكل مستخدم',
                  icon: Clock,
                  stats: 'زيادة معدل الفتح 35%'
                },
                contentPersonalization: { 
                  label: 'تخصيص المحتوى',
                  description: 'يعدل نص الإشعار حسب اهتمامات المستخدم',
                  icon: Target,
                  stats: 'زيادة التفاعل 42%'
                },
                priorityOptimization: { 
                  label: 'تحسين الأولوية',
                  description: 'يرتب الإشعارات حسب أهميتها للمستخدم',
                  icon: Activity,
                  stats: 'تقليل الإلغاء 28%'
                },
                userSegmentation: { 
                  label: 'تجزئة المستخدمين',
                  description: 'يصنف المستخدمين لإرسال إشعارات مستهدفة',
                  icon: Users,
                  stats: 'دقة استهداف 89%'
                }
              }).map(([key, { label, description, icon: Icon, stats }]) => (
                <div 
                  key={key}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px solid hsl(var(--line))',
                    background: settings.aiFeatures[key as keyof typeof settings.aiFeatures]
                      ? 'linear-gradient(135deg, hsla(var(--accent), 0.05), hsla(var(--accent), 0.1))'
                      : 'hsl(var(--bg))'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <Icon style={{ width: '18px', height: '18px', color: 'hsl(var(--accent))' }} />
                        <span className="font-medium">{label}</span>
                        {settings.aiFeatures[key as keyof typeof settings.aiFeatures] && (
                          <Sparkles style={{ width: '14px', height: '14px', color: '#f59e0b' }} />
                        )}
                      </div>
                      <p className="text-xs text-muted" style={{ marginBottom: '8px' }}>{description}</p>
                      {settings.aiFeatures[key as keyof typeof settings.aiFeatures] && (
                        <div className="text-xs" style={{ color: '#10b981' }}>{stats}</div>
                      )}
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={settings.aiFeatures[key as keyof typeof settings.aiFeatures]}
                        onChange={() => toggleAIFeature(key as keyof typeof settings.aiFeatures)}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* الجدولة والتوقيت */}
          <div className="card">
            <div className="card-header">
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar style={{ width: '20px', height: '20px', color: 'hsl(var(--accent))' }} />
                الجدولة والتوقيت
              </div>
            </div>
            <div style={{ padding: '24px' }}>
              {/* ساعات الهدوء */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  marginBottom: '16px'
                }}>
                  <div>
                    <div className="font-medium">ساعات الهدوء</div>
                    <div className="text-xs text-muted">عدم إرسال إشعارات في أوقات معينة</div>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={settings.schedule.quietHoursEnabled}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        schedule: { ...prev.schedule, quietHoursEnabled: e.target.checked }
                      }))}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                
                {settings.schedule.quietHoursEnabled && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label className="text-xs text-muted">من الساعة</label>
                      <input
                        type="time"
                        value={settings.schedule.quietHoursStart}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          schedule: { ...prev.schedule, quietHoursStart: e.target.value }
                        }))}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: '1px solid hsl(var(--line))',
                          background: 'hsl(var(--bg))',
                          marginTop: '4px'
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted">إلى الساعة</label>
                      <input
                        type="time"
                        value={settings.schedule.quietHoursEnd}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          schedule: { ...prev.schedule, quietHoursEnd: e.target.value }
                        }))}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: '1px solid hsl(var(--line))',
                          background: 'hsl(var(--bg))',
                          marginTop: '4px'
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* إشعارات نهاية الأسبوع */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                padding: '16px',
                borderRadius: '12px',
                background: 'hsl(var(--bg-elevated))'
              }}>
                <div>
                  <div className="font-medium">إشعارات نهاية الأسبوع</div>
                  <div className="text-xs text-muted">السماح بالإشعارات يومي الجمعة والسبت</div>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={settings.schedule.weekendNotifications}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      schedule: { ...prev.schedule, weekendNotifications: e.target.checked }
                    }))}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }

        .switch {
          position: relative;
          display: inline-block;
          width: 48px;
          height: 24px;
        }

        .switch.switch-sm {
          width: 36px;
          height: 20px;
        }

        .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: hsl(var(--line));
          transition: .3s;
          border-radius: 24px;
        }

        .slider:before {
          position: absolute;
          content: "";
          height: 16px;
          width: 16px;
          left: 4px;
          bottom: 4px;
          background-color: white;
          transition: .3s;
          border-radius: 50%;
        }

        .switch.switch-sm .slider:before {
          height: 14px;
          width: 14px;
          left: 3px;
          bottom: 3px;
        }

        input:checked + .slider {
          background-color: hsl(var(--accent));
        }

        input:checked + .slider:before {
          transform: translateX(24px);
        }

        .switch.switch-sm input:checked + .slider:before {
          transform: translateX(16px);
        }

        .card-hover {
          transition: all 0.3s ease;
        }

        .card-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
}