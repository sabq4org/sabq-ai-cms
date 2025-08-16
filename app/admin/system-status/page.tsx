'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  RefreshCw,
  Server,
  Brain,
  Bell,
  Users,
  Shield,
  BarChart3,
  Activity,
  Zap,
  Globe,
  Database
} from 'lucide-react';

interface SystemStatus {
  name: string;
  url: string;
  port: number;
  icon: React.ElementType;
  description: string;
  status: 'online' | 'offline' | 'checking';
  responseTime?: number;
  lastCheck?: Date;
  version?: string;
  health?: any;
}

const SYSTEMS: SystemStatus[] = [
  {
    name: 'التطبيق الرئيسي',
    url: 'http://localhost:3000/api/health',
    port: 3000,
    icon: Globe,
    description: 'النظام الأساسي ولوحة التحكم',
    status: 'checking'
  },
  {
    name: 'نظام تحليل المشاعر العربي',
    url: 'http://localhost:8000/health',
    port: 8000,
    icon: Brain,
    description: 'تحليل المشاعر للنصوص العربية بالذكاء الاصطناعي',
    status: 'checking'
  },
  {
    name: 'محرك التوصيات الذكية',
    url: 'http://localhost:8080/health',
    port: 8080,
    icon: Zap,
    description: 'نظام التوصيات المخصصة والذكية',
    status: 'checking'
  },
  {
    name: 'نظام تتبع السلوك',
    url: 'http://localhost:8002/health',
    port: 8002,
    icon: Activity,
    description: 'تتبع وتحليل سلوك المستخدمين',
    status: 'checking'
  },
  {
    name: 'نظام إدارة المستخدمين',
    url: 'http://localhost:8001/health',
    port: 8001,
    icon: Users,
    description: 'إدارة الحسابات والصلاحيات',
    status: 'checking'
  },
  {
    name: 'قاعدة البيانات الرئيسية',
    url: '/api/database/health',
    port: 5432,
    icon: Database,
    description: 'PostgreSQL - قاعدة البيانات الأساسية',
    status: 'checking'
  }
];

export default function SystemStatusPage() {
  const [systems, setSystems] = useState<SystemStatus[]>(SYSTEMS);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const checkSystemHealth = async (system: SystemStatus): Promise<SystemStatus> => {
    const startTime = Date.now();
    
    try {
      const response = await fetch(system.url, {
        method: 'GET',
        timeout: 5000
      } as any);
      
      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        let health = null;
        try {
          health = await response.json();
        } catch (e) {
          // إذا لم يكن JSON، فهو يعمل على الأقل
        }
        
        return {
          ...system,
          status: 'online',
          responseTime,
          lastCheck: new Date(),
          health
        };
      } else {
        return {
          ...system,
          status: 'offline',
          responseTime,
          lastCheck: new Date()
        };
      }
    } catch (error) {
      return {
        ...system,
        status: 'offline',
        lastCheck: new Date()
      };
    }
  };

  const checkAllSystems = async () => {
    setLoading(true);
    
    try {
      const updatedSystems = await Promise.all(
        systems.map(system => checkSystemHealth(system))
      );
      
      setSystems(updatedSystems);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error checking systems:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAllSystems();
    
    // تحديث تلقائي كل 30 ثانية
    const interval = setInterval(checkAllSystems, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const onlineSystems = systems.filter(s => s.status === 'online').length;
  const offlineSystems = systems.filter(s => s.status === 'offline').length;
  const overallHealth = onlineSystems / systems.length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-600 bg-green-50 border-green-200';
      case 'offline': return 'text-red-600 bg-red-50 border-red-200';
      case 'checking': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'offline': return <XCircle className="w-5 h-5 text-red-600" />;
      case 'checking': return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      {/* العنوان والإحصائيات العامة */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Server className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold">حالة الأنظمة الذكية</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          مراقبة شاملة لجميع أنظمة سبق الذكية
        </p>
      </div>

      {/* الإحصائيات السريعة */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className={`border-2 ${overallHealth >= 0.8 ? 'border-green-200 bg-green-50' : overallHealth >= 0.5 ? 'border-yellow-200 bg-yellow-50' : 'border-red-200 bg-red-50'}`}>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{Math.round(overallHealth * 100)}%</div>
            <div className="text-sm text-muted-foreground">الصحة العامة</div>
          </CardContent>
        </Card>
        
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{onlineSystems}</div>
            <div className="text-sm text-green-700">أنظمة نشطة</div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{offlineSystems}</div>
            <div className="text-sm text-red-700">أنظمة متوقفة</div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{systems.length}</div>
            <div className="text-sm text-blue-700">إجمالي الأنظمة</div>
          </CardContent>
        </Card>
      </div>

      {/* أزرار التحكم */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>عمليات النظام</CardTitle>
            <div className="text-sm text-muted-foreground">
              آخر تحديث: {lastUpdate.toLocaleTimeString('ar-SA')}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button 
              onClick={checkAllSystems}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'جاري الفحص...' : 'فحص جميع الأنظمة'}
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => window.open('/admin/smart-system', '_blank')}
              className="flex items-center gap-2"
            >
              <Brain className="w-4 h-4" />
              لوحة التحكم الذكية
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* قائمة الأنظمة */}
      <div className="grid gap-4">
        {systems.map((system) => {
          const Icon = system.icon;
          return (
            <Card key={system.name} className={`border-2 ${getStatusColor(system.status)}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className="w-6 h-6" />
                    <div>
                      <CardTitle className="text-lg">{system.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{system.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(system.status)}
                    <Badge className={getStatusColor(system.status)}>
                      {system.status === 'online' ? 'نشط' : 
                       system.status === 'offline' ? 'متوقف' : 'جاري الفحص'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium">المنفذ:</span>
                    <div>{system.port}</div>
                  </div>
                  
                  {system.responseTime && (
                    <div>
                      <span className="font-medium">زمن الاستجابة:</span>
                      <div>{system.responseTime}ms</div>
                    </div>
                  )}
                  
                  {system.lastCheck && (
                    <div>
                      <span className="font-medium">آخر فحص:</span>
                      <div>{system.lastCheck.toLocaleTimeString('ar-SA')}</div>
                    </div>
                  )}
                  
                  <div>
                    <span className="font-medium">العنوان:</span>
                    <div className="text-xs truncate">localhost:{system.port}</div>
                  </div>
                </div>

                {system.health && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium mb-2">معلومات النظام:</div>
                    <pre className="text-xs text-gray-600 overflow-auto">
                      {JSON.stringify(system.health, null, 2)}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ملاحظات النظام */}
      <Alert>
        <Server className="w-4 h-4" />
        <AlertDescription>
          <strong>ملاحظة:</strong> يتم فحص جميع الأنظمة تلقائياً كل 30 ثانية. 
          إذا كان أي نظام متوقفاً، تأكد من تشغيله باستخدام الأمر{' '}
          <code className="bg-gray-100 px-2 py-1 rounded">./activate-all-systems.sh</code>
        </AlertDescription>
      </Alert>
    </div>
  );
}
