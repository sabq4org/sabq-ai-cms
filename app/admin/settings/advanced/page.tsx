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
    <div className="space-y-6">
        {/* تحذير */}
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <div>
                <h3 className="font-medium text-orange-800 dark:text-orange-200">تحذير مهم</h3>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  هذه الإعدادات للمستخدمين المتقدمين فقط. تغيير هذه الإعدادات قد يؤثر على أداء النظام.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="api" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="api">API</TabsTrigger>
            <TabsTrigger value="database">قاعدة البيانات</TabsTrigger>
            <TabsTrigger value="security">الأمان</TabsTrigger>
            <TabsTrigger value="performance">الأداء</TabsTrigger>
          </TabsList>

          <TabsContent value="api" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  إعدادات API
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* تحديد المعدل */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="rate-limit">تحديد معدل الطلبات</Label>
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
                        <Label htmlFor="max-requests">الحد الأقصى للطلبات/دقيقة</Label>
                        <Input
                          id="max-requests"
                          type="number"
                          value={apiSettings.maxRequestsPerMinute}
                          onChange={(e) => 
                            setApiSettings({...apiSettings, maxRequestsPerMinute: parseInt(e.target.value)})
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="timeout">انتهاء المهلة (ثانية)</Label>
                        <Input
                          id="timeout"
                          type="number"
                          value={apiSettings.timeoutSeconds}
                          onChange={(e) => 
                            setApiSettings({...apiSettings, timeoutSeconds: parseInt(e.target.value)})
                          }
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
        <div className="flex justify-between">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            إعادة تعيين
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Save className="h-4 w-4 mr-2" />
            حفظ الإعدادات
          </Button>
        </div>
      </div>
  );
}
