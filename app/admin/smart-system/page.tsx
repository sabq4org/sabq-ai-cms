"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Brain, 
  Activity, 
  BarChart3, 
  Heart, 
  TrendingUp, 
  Search, 
  Bell,
  Users,
  Eye,
  MessageSquare,
  CheckCircle,
  XCircle,
  Loader2,
  Settings
} from "lucide-react";

interface SystemModule {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  status: 'active' | 'inactive' | 'error';
  enabled: boolean;
  metrics?: {
    value: string;
    label: string;
  };
}

const smartSystemModules: SystemModule[] = [
  {
    id: 'recommendations',
    name: 'نظام التوصيات الذكية',
    description: 'توصيات مخصصة للمقالات بناء على سلوك المستخدم',
    icon: TrendingUp,
    status: 'active',
    enabled: true,
    metrics: { value: '94%', label: 'دقة التوصيات' }
  },
  {
    id: 'sentiment',
    name: 'تحليل المشاعر العربية',
    description: 'تحليل مشاعر القراء والتعليقات باللغة العربية',
    icon: Heart,
    status: 'active',
    enabled: true,
    metrics: { value: '87%', label: 'دقة التحليل' }
  },
  {
    id: 'notifications',
    name: 'الإشعارات الذكية',
    description: 'إشعارات مخصصة بناء على اهتمامات المستخدم',
    icon: Bell,
    status: 'active',
    enabled: true,
    metrics: { value: '156', label: 'إشعار يومي' }
  },
  {
    id: 'analytics',
    name: 'التحليلات المتقدمة',
    description: 'تحليل شامل لسلوك المستخدمين والمحتوى',
    icon: BarChart3,
    status: 'active',
    enabled: true,
    metrics: { value: '24/7', label: 'مراقبة مستمرة' }
  },
  {
    id: 'search',
    name: 'البحث الذكي',
    description: 'بحث متقدم مع فهم السياق والمعنى',
    icon: Search,
    status: 'inactive',
    enabled: false,
    metrics: { value: '0', label: 'استعلامات' }
  },
  {
    id: 'interactions',
    name: 'تتبع التفاعلات',
    description: 'تتبع ذكي لتفاعلات المستخدمين مع المحتوى',
    icon: Users,
    status: 'active',
    enabled: true,
    metrics: { value: '2.4K', label: 'تفاعل يومي' }
  }
];

export default function SmartSystemPage() {
  const [modules, setModules] = useState<SystemModule[]>(smartSystemModules);
  const [loading, setLoading] = useState(false);
  const [systemHealth, setSystemHealth] = useState<'healthy' | 'warning' | 'error'>('healthy');

  const handleToggleModule = async (moduleId: string) => {
    setLoading(true);
    try {
      // محاكاة API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setModules(prev => prev.map(module => 
        module.id === moduleId 
          ? { 
              ...module, 
              enabled: !module.enabled,
              status: !module.enabled ? 'active' : 'inactive'
            }
          : module
      ));
      
      // إشعار نجاح
      if (window.showNotification) {
        window.showNotification({
          type: 'success',
          message: 'تم تحديث حالة النظام بنجاح',
          duration: 3000
        });
      }
    } catch (error) {
      console.error('Error toggling module:', error);
      if (window.showNotification) {
        window.showNotification({
          type: 'error',
          message: 'حدث خطأ في تحديث النظام',
          duration: 5000
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: SystemModule['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'inactive':
        return <XCircle className="w-5 h-5 text-gray-400" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusBadge = (status: SystemModule['status']) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">نشط</Badge>;
      case 'inactive':
        return <Badge variant="secondary">متوقف</Badge>;
      case 'error':
        return <Badge variant="destructive">خطأ</Badge>;
    }
  };

  const activeModules = modules.filter(m => m.enabled).length;
  const totalModules = modules.length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Brain className="w-8 h-8 text-blue-600" />
            النظام الذكي المتكامل
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            إدارة ومراقبة جميع الأنظمة الذكية لموقع سبق
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {activeModules}/{totalModules}
            </div>
            <div className="text-sm text-gray-500">نظام نشط</div>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-500" />
            <span className="text-sm text-green-600 font-medium">النظام يعمل بكفاءة</span>
          </div>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Brain className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">6</div>
                <div className="text-sm text-gray-500">أنظمة ذكية</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">94%</div>
                <div className="text-sm text-gray-500">كفاءة النظام</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">2.4K</div>
                <div className="text-sm text-gray-500">مستخدم نشط</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Eye className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">156</div>
                <div className="text-sm text-gray-500">توصية يومية</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Smart Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => {
          const Icon = module.icon;
          return (
            <Card key={module.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      module.enabled 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{module.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusIcon(module.status)}
                        {getStatusBadge(module.status)}
                      </div>
                    </div>
                  </div>
                  
                  <Switch
                    checked={module.enabled}
                    onCheckedChange={() => handleToggleModule(module.id)}
                    disabled={loading}
                  />
                </div>
              </CardHeader>
              
              <CardContent>
                <CardDescription className="mb-4">
                  {module.description}
                </CardDescription>
                
                {module.metrics && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {module.metrics.value}
                    </div>
                    <div className="text-sm text-gray-500">
                      {module.metrics.label}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            إجراءات سريعة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-auto p-4 text-right"
              onClick={() => window.open('/admin/analytics/live', '_blank')}
            >
              <div>
                <div className="font-medium">التحليلات المباشرة</div>
                <div className="text-sm text-gray-500 mt-1">
                  مراقبة النشاط في الوقت الفعلي
                </div>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto p-4 text-right"
              onClick={() => window.open('/admin/system-status', '_blank')}
            >
              <div>
                <div className="font-medium">مراقبة الأنظمة</div>
                <div className="text-sm text-gray-500 mt-1">
                  حالة جميع الخدمات والتطبيقات
                </div>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto p-4 text-right"
              onClick={() => {
                if (window.showNotification) {
                  window.showNotification({
                    type: 'info',
                    message: 'جاري تحديث جميع الأنظمة...',
                    duration: 3000
                  });
                }
              }}
            >
              <div>
                <div className="font-medium">تحديث شامل</div>
                <div className="text-sm text-gray-500 mt-1">
                  تحديث جميع النماذج والخوارزميات
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg flex items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>جاري تحديث النظام...</span>
          </div>
        </div>
      )}
    </div>
  );
}
