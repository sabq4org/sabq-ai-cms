import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Database, 
  Zap, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Activity,
  Settings,
  Plus,
  Play,
  Pause,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  Globe,
  Server
} from 'lucide-react';

interface DataSource {
  id: string;
  name: string;
  type: string;
  provider: string;
  status: 'active' | 'inactive' | 'error' | 'maintenance';
  last_sync: string | null;
  created_at: string;
}

interface SyncResult {
  sync_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  records_processed: number;
  records_created: number;
  records_failed: number;
  started_at: string;
  completed_at: string | null;
  performance_metrics: {
    duration_ms: number;
    throughput_rps: number;
  };
}

interface IntegrationHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  response_time_ms: number;
  error_count: number;
  uptime_percentage: number;
}

export default function ExternalDataIntegrationDashboard() {
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [activeSyncs, setActiveSyncs] = useState<SyncResult[]>([]);
  const [integrationHealth, setIntegrationHealth] = useState<IntegrationHealth | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load data sources
      const sourcesResponse = await fetch('/api/integration/data-sources');
      if (sourcesResponse.ok) {
        const sourcesData = await sourcesResponse.json();
        setDataSources(sourcesData.data || []);
      }

      // Load integration health
      const healthResponse = await fetch('/api/integration/reports?type=health');
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        setIntegrationHealth(healthData.data);
      }

      // Mock active syncs data (in real implementation, would fetch from API)
      setActiveSyncs([
        {
          sync_id: 'sync-1',
          status: 'running',
          records_processed: 1250,
          records_created: 1200,
          records_failed: 50,
          started_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          completed_at: null,
          performance_metrics: {
            duration_ms: 300000,
            throughput_rps: 4.16
          }
        }
      ]);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncDataSource = async (sourceId: string) => {
    try {
      const response = await fetch(`/api/integration/sync/${sourceId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force: false, dry_run: false })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Sync started:', result);
        loadDashboardData(); // Refresh data
      }
    } catch (error) {
      console.error('Failed to start sync:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
      case 'failed':
      case 'unhealthy':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running':
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'degraded':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      completed: 'bg-green-100 text-green-800',
      healthy: 'bg-green-100 text-green-800',
      error: 'bg-red-100 text-red-800',
      failed: 'bg-red-100 text-red-800',
      unhealthy: 'bg-red-100 text-red-800',
      running: 'bg-blue-100 text-blue-800',
      pending: 'bg-yellow-100 text-yellow-800',
      degraded: 'bg-orange-100 text-orange-800',
      inactive: 'bg-gray-100 text-gray-800',
      maintenance: 'bg-purple-100 text-purple-800'
    };

    return (
      <Badge className={variants[status] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    );
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>جاري تحميل بيانات التكامل...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            إدارة التكامل مع البيانات الخارجية
          </h1>
          <p className="text-gray-600 mt-2">
            مراقبة وإدارة مصادر البيانات الخارجية والمزامنة
          </p>
        </div>
        <Button className="flex items-center space-x-2 space-x-reverse">
          <Plus className="h-4 w-4" />
          <span>إضافة مصدر بيانات</span>
        </Button>
      </div>

      {/* Health Overview */}
      {integrationHealth && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 space-x-reverse">
              <Activity className="h-5 w-5" />
              <span>حالة النظام العامة</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  {getStatusIcon(integrationHealth.status)}
                </div>
                <p className="text-sm text-gray-600">الحالة العامة</p>
                <p className="font-semibold">{integrationHealth.status}</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {integrationHealth.response_time_ms}ms
                </div>
                <p className="text-sm text-gray-600">وقت الاستجابة</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {integrationHealth.uptime_percentage.toFixed(1)}%
                </div>
                <p className="text-sm text-gray-600">نسبة التشغيل</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {integrationHealth.error_count}
                </div>
                <p className="text-sm text-gray-600">عدد الأخطاء</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="sources">مصادر البيانات</TabsTrigger>
          <TabsTrigger value="syncs">عمليات المزامنة</TabsTrigger>
          <TabsTrigger value="reports">التقارير</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">مصادر البيانات النشطة</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dataSources.filter(source => source.status === 'active').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  من إجمالي {dataSources.length} مصدر
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">المزامنة النشطة</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {activeSyncs.filter(sync => sync.status === 'running').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  عملية مزامنة جارية
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">السجلات المعالجة اليوم</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {activeSyncs.reduce((sum, sync) => sum + sync.records_processed, 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  سجل تم معالجته
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Active Syncs */}
          {activeSyncs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>عمليات المزامنة النشطة</CardTitle>
                <CardDescription>المزامنة الجارية حالياً</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeSyncs.map((sync) => (
                    <div key={sync.sync_id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2 space-x-reverse">
                          {getStatusIcon(sync.status)}
                          <span className="font-medium">مزامنة {sync.sync_id}</span>
                          {getStatusBadge(sync.status)}
                        </div>
                        <div className="text-sm text-gray-500">
                          بدأت منذ {formatDuration(Date.now() - new Date(sync.started_at).getTime())}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">السجلات المعالجة:</span>
                          <span className="font-medium mr-2">{sync.records_processed.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">تم إنشاؤها:</span>
                          <span className="font-medium mr-2 text-green-600">{sync.records_created.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">فشلت:</span>
                          <span className="font-medium mr-2 text-red-600">{sync.records_failed.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-gray-600">
                        السرعة: {sync.performance_metrics.throughput_rps.toFixed(2)} سجل/ثانية
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="sources" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>مصادر البيانات المكونة</CardTitle>
              <CardDescription>إدارة ومراقبة مصادر البيانات الخارجية</CardDescription>
            </CardHeader>
            <CardContent>
              {dataSources.length === 0 ? (
                <div className="text-center py-8">
                  <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">لا توجد مصادر بيانات مكونة بعد</p>
                  <Button className="mt-4">
                    <Plus className="h-4 w-4 ml-2" />
                    إضافة مصدر البيانات الأول
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {dataSources.map((source) => (
                    <div key={source.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3 space-x-reverse">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            {source.provider === 'google' && <Globe className="h-5 w-5 text-blue-600" />}
                            {source.provider === 'facebook' && <Globe className="h-5 w-5 text-blue-600" />}
                            {source.provider === 'custom' && <Server className="h-5 w-5 text-gray-600" />}
                            {!['google', 'facebook', 'custom'].includes(source.provider) && 
                              <Database className="h-5 w-5 text-blue-600" />}
                          </div>
                          <div>
                            <h3 className="font-medium">{source.name}</h3>
                            <p className="text-sm text-gray-600">{source.type} • {source.provider}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 space-x-reverse">
                          {getStatusBadge(source.status)}
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleSyncDataSource(source.id)}
                          >
                            <Play className="h-4 w-4 ml-1" />
                            مزامنة
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        آخر مزامنة: {source.last_sync ? 
                          new Date(source.last_sync).toLocaleString('ar-SA') : 
                          'لم تتم المزامنة بعد'
                        }
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="syncs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>سجل عمليات المزامنة</CardTitle>
              <CardDescription>تاريخ عمليات المزامنة ونتائجها</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">سيتم عرض سجل المزامنة هنا</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>تقارير التكامل</CardTitle>
              <CardDescription>إحصائيات وتقارير شاملة عن أداء التكامل</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">سيتم عرض التقارير التفصيلية هنا</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
