/**
 * صفحة الإعدادات المتقدمة
 * Advanced Settings Page
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
// تم إزالة DashboardLayout - تستخدم الصفحة layout.tsx الأساسي
import {
  Settings,
  Database,
  Shield,
  Zap,
  Globe,
  Code,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Key,
  Server,
  Cloud
} from 'lucide-react';

export default function AdvancedSettingsPage() {
  const [apiSettings, setApiSettings] = useState({
    rateLimitEnabled: true,
    maxRequestsPerMinute: 100,
    timeoutSeconds: 30,
    cacheEnabled: true,
    cacheTtl: 300
  });

  const [databaseSettings, setDatabaseSettings] = useState({
    autoBackup: true,
    backupInterval: '24',
    connectionPoolSize: 10,
    queryLogging: false,
    indexOptimization: true
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: true,
    passwordPolicy: 'strong',
    sessionTimeout: 30,
    ipWhitelisting: false,
    auditLogging: true
  });

  return (
    <>
      <link rel="stylesheet" href="/manus-ui.css" />
      <div style={{ 
        minHeight: '100vh', 
        background: 'hsl(var(--bg))', 
        padding: '24px',
        color: 'hsl(var(--fg))'
      }}>
        {/* رسالة الترحيب */}
        <div className="card card-accent" style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
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
              <Settings style={{ width: '24px', height: '24px' }} />
            </div>
            <div style={{ flex: 1 }}>
              <h2 className="heading-2" style={{ marginBottom: '8px' }}>
                الإعدادات المتقدمة
              </h2>
              <p className="text-muted" style={{ marginBottom: '16px' }}>
                إعدادات النظام المتقدمة للمطورين والمديرين المتخصصين
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div className="chip">
                  ⚙️ إعدادات متقدمة
                </div>
                <div className="chip chip-muted">
                  🔧 للمطورين
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* تحذير */}
        <div className="card" style={{ 
          marginBottom: '24px',
          background: 'hsl(var(--accent-4) / 0.05)',
          border: '1px solid hsl(var(--accent-4) / 0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertTriangle style={{ width: '20px', height: '20px', color: 'hsl(var(--accent-4))' }} />
            <div>
              <h3 style={{ fontWeight: '500', color: 'hsl(var(--accent-4))', marginBottom: '4px' }}>تحذير مهم</h3>
              <p className="text-sm text-muted">
                هذه الإعدادات للمستخدمين المتقدمين فقط. تغيير هذه الإعدادات قد يؤثر على أداء النظام.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">

        <Tabs defaultValue="api" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="api">API</TabsTrigger>
            <TabsTrigger value="database">قاعدة البيانات</TabsTrigger>
            <TabsTrigger value="security">الأمان</TabsTrigger>
            <TabsTrigger value="performance">الأداء</TabsTrigger>
          </TabsList>

          <TabsContent value="api" className="space-y-6">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">
                  <Globe style={{ width: '20px', height: '20px', marginLeft: '8px' }} />
                  إعدادات API
                </h3>
              </div>
              <div style={{ padding: '0 24px 24px 24px', display: 'grid', gap: '24px' }}>
                {/* تحديد المعدل */}
                <div style={{ display: 'grid', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <label className="label">تحديد معدل الطلبات</label>
                    <Switch
                      id="rate-limit"
                      checked={apiSettings.rateLimitEnabled}
                      onCheckedChange={(checked) => 
                        setApiSettings({...apiSettings, rateLimitEnabled: checked})
                      }
                    />
                  </div>
                  {apiSettings.rateLimitEnabled && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="label">الحد الأقصى للطلبات/دقيقة</label>
                        <input
                          type="number"
                          value={apiSettings.maxRequestsPerMinute}
                          onChange={(e) => 
                            setApiSettings({...apiSettings, maxRequestsPerMinute: parseInt(e.target.value)})
                          }
                          style={{
                            width: '100%',
                            padding: '12px',
                            border: '1px solid hsl(var(--line))',
                            borderRadius: '8px',
                            background: 'hsl(var(--bg-card))',
                            color: 'hsl(var(--fg))',
                          }}
                        />
                      </div>
                      <div>
                        <label className="label">انتهاء المهلة (ثانية)</label>
                        <input
                          type="number"
                          value={apiSettings.timeoutSeconds}
                          onChange={(e) => 
                            setApiSettings({...apiSettings, timeoutSeconds: parseInt(e.target.value)})
                          }
                          style={{
                            width: '100%',
                            padding: '12px',
                            border: '1px solid hsl(var(--line))',
                            borderRadius: '8px',
                            background: 'hsl(var(--bg-card))',
                            color: 'hsl(var(--fg))',
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* التخزين المؤقت */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="cache">التخزين المؤقت</Label>
                    <Switch
                      id="cache"
                      checked={apiSettings.cacheEnabled}
                      onCheckedChange={(checked) => 
                        setApiSettings({...apiSettings, cacheEnabled: checked})
                      }
                    />
                  </div>
                  {apiSettings.cacheEnabled && (
                    <div>
                      <Label htmlFor="cache-ttl">مدة التخزين (ثانية)</Label>
                      <Input
                        id="cache-ttl"
                        type="number"
                        value={apiSettings.cacheTtl}
                        onChange={(e) => 
                          setApiSettings({...apiSettings, cacheTtl: parseInt(e.target.value)})
                        }
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="database" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  إعدادات قاعدة البيانات
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* النسخ الاحتياطي التلقائي */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-backup">النسخ الاحتياطي التلقائي</Label>
                    <Switch
                      id="auto-backup"
                      checked={databaseSettings.autoBackup}
                      onCheckedChange={(checked) => 
                        setDatabaseSettings({...databaseSettings, autoBackup: checked})
                      }
                    />
                  </div>
                  {databaseSettings.autoBackup && (
                    <div>
                      <Label htmlFor="backup-interval">فترة النسخ الاحتياطي (ساعة)</Label>
                      <Input
                        id="backup-interval"
                        type="number"
                        value={databaseSettings.backupInterval}
                        onChange={(e) => 
                          setDatabaseSettings({...databaseSettings, backupInterval: e.target.value})
                        }
                      />
                    </div>
                  )}
                </div>

                {/* حجم تجمع الاتصالات */}
                <div>
                  <Label htmlFor="pool-size">حجم تجمع الاتصالات</Label>
                  <Input
                    id="pool-size"
                    type="number"
                    value={databaseSettings.connectionPoolSize}
                    onChange={(e) => 
                      setDatabaseSettings({...databaseSettings, connectionPoolSize: parseInt(e.target.value)})
                    }
                  />
                </div>

                {/* تسجيل الاستعلامات */}
                <div className="flex items-center justify-between">
                  <Label htmlFor="query-logging">تسجيل الاستعلامات</Label>
                  <Switch
                    id="query-logging"
                    checked={databaseSettings.queryLogging}
                    onCheckedChange={(checked) => 
                      setDatabaseSettings({...databaseSettings, queryLogging: checked})
                    }
                  />
                </div>

                {/* تحسين الفهارس */}
                <div className="flex items-center justify-between">
                  <Label htmlFor="index-optimization">تحسين الفهارس التلقائي</Label>
                  <Switch
                    id="index-optimization"
                    checked={databaseSettings.indexOptimization}
                    onCheckedChange={(checked) => 
                      setDatabaseSettings({...databaseSettings, indexOptimization: checked})
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  إعدادات الأمان
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* المصادقة الثنائية */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="2fa">المصادقة الثنائية</Label>
                    <p className="text-sm text-gray-600">مطلوبة لجميع المدراء</p>
                  </div>
                  <Switch
                    id="2fa"
                    checked={securitySettings.twoFactorAuth}
                    onCheckedChange={(checked) => 
                      setSecuritySettings({...securitySettings, twoFactorAuth: checked})
                    }
                  />
                </div>

                {/* انتهاء الجلسة */}
                <div>
                  <Label htmlFor="session-timeout">انتهاء الجلسة (دقيقة)</Label>
                  <Input
                    id="session-timeout"
                    type="number"
                    value={securitySettings.sessionTimeout}
                    onChange={(e) => 
                      setSecuritySettings({...securitySettings, sessionTimeout: parseInt(e.target.value)})
                    }
                  />
                </div>

                {/* القائمة البيضاء للعناوين */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="ip-whitelist">القائمة البيضاء للعناوين</Label>
                    <p className="text-sm text-gray-600">تقييد الوصول حسب IP</p>
                  </div>
                  <Switch
                    id="ip-whitelist"
                    checked={securitySettings.ipWhitelisting}
                    onCheckedChange={(checked) => 
                      setSecuritySettings({...securitySettings, ipWhitelisting: checked})
                    }
                  />
                </div>

                {/* تسجيل التدقيق */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="audit-logging">تسجيل التدقيق</Label>
                    <p className="text-sm text-gray-600">تسجيل جميع العمليات المهمة</p>
                  </div>
                  <Switch
                    id="audit-logging"
                    checked={securitySettings.auditLogging}
                    onCheckedChange={(checked) => 
                      setSecuritySettings({...securitySettings, auditLogging: checked})
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  مراقبة الأداء
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { label: 'استخدام المعالج', value: '45%', status: 'good' },
                    { label: 'استخدام الذاكرة', value: '67%', status: 'warning' },
                    { label: 'مساحة القرص', value: '23%', status: 'good' },
                  ].map((metric) => (
                    <div key={metric.label} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{metric.label}</span>
                        <Badge variant={metric.status === 'good' ? 'default' : 'destructive'}>
                          {metric.value}
                        </Badge>
                      </div>
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            metric.status === 'good' ? 'bg-green-500' : 'bg-yellow-500'
                          }`}
                          style={{ width: metric.value }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* أزرار الحفظ */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
          <button className="btn">
            <RefreshCw style={{ width: '16px', height: '16px', marginLeft: '8px' }} />
            إعادة تعيين
          </button>
          <button className="btn btn-primary">
            <Save style={{ width: '16px', height: '16px', marginLeft: '8px' }} />
            حفظ الإعدادات
          </button>
        </div>
        </div>
      </div>
    </>)
  );
}
