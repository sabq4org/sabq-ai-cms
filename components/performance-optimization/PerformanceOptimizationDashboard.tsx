/**
 * نظام تحسين الأداء - واجهة لوحة المراقبة
 * Performance Optimization Dashboard Component
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { 
  Activity, 
  Zap, 
  Database, 
  Image, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Cpu, 
  HardDrive,
  Network,
  TrendingUp,
  TrendingDown,
  Play,
  Pause,
  BarChart3,
  Settings,
  Download,
  RefreshCw
} from 'lucide-react';
import { PerformanceSnapshot, OptimizationRule, OptimizationResult, PerformanceAlert, OptimizationRecommendation } from '@/lib/modules/performance-optimization/types';

export default function PerformanceOptimizationDashboard() {
  const [loading, setLoading] = useState(true);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [currentPerformance, setCurrentPerformance] = useState<PerformanceSnapshot | null>(null);
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [recommendations, setRecommendations] = useState<OptimizationRecommendation[]>([]);
  const [optimizationResults, setOptimizationResults] = useState<OptimizationResult[]>([]);
  const [rules, setRules] = useState<OptimizationRule[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setRefreshing(true);
      
      const [performance, alertsData, recommendationsData, resultsData, rulesData] = await Promise.all([
        fetch('/api/performance-optimization?action=current_performance').then(r => r.json()),
        fetch('/api/performance-optimization?action=alerts').then(r => r.json()),
        fetch('/api/performance-optimization?action=recommendations').then(r => r.json()),
        fetch('/api/performance-optimization?action=results').then(r => r.json()),
        fetch('/api/performance-optimization?action=rules').then(r => r.json())
      ]);

      if (performance.success) setCurrentPerformance(performance.data);
      if (alertsData.success) setAlerts(alertsData.data);
      if (recommendationsData.success) setRecommendations(recommendationsData.data);
      if (resultsData.success) setOptimizationResults(resultsData.data);
      if (rulesData.success) setRules(rulesData.data);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const toggleMonitoring = async () => {
    try {
      const action = isMonitoring ? 'stop_monitoring' : 'start_monitoring';
      const response = await fetch('/api/performance-optimization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });

      if (response.ok) {
        setIsMonitoring(!isMonitoring);
      }
    } catch (error) {
      console.error('Error toggling monitoring:', error);
    }
  };

  const implementRecommendation = async (recommendationId: string) => {
    try {
      const response = await fetch('/api/performance-optimization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'implement_recommendation',
          recommendation_id: recommendationId
        })
      });

      if (response.ok) {
        await loadDashboardData();
      }
    } catch (error) {
      console.error('Error implementing recommendation:', error);
    }
  };

  const acknowledgeAlert = async (alertId: string) => {
    try {
      const response = await fetch('/api/performance-optimization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'acknowledge_alert',
          alert_id: alertId
        })
      });

      if (response.ok) {
        await loadDashboardData();
      }
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  };

  const executeOptimization = async (ruleId: string) => {
    try {
      const response = await fetch('/api/performance-optimization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'execute_optimization',
          rule_id: ruleId
        })
      });

      if (response.ok) {
        await loadDashboardData();
      }
    } catch (error) {
      console.error('Error executing optimization:', error);
    }
  };

  const getMetricColor = (value: number, type: string) => {
    if (type === 'cache_hit_rate') {
      return value >= 85 ? 'text-green-600' : value >= 70 ? 'text-yellow-600' : 'text-red-600';
    }
    // For response time, memory, CPU usage - lower is better
    return value <= 50 ? 'text-green-600' : value <= 80 ? 'text-yellow-600' : 'text-red-600';
  };

  const formatMetricValue = (value: number, unit: string) => {
    return `${value.toFixed(1)}${unit}`;
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">نظام تحسين الأداء</h1>
          <p className="text-gray-600 mt-1">مراقبة وتحسين أداء النظام في الوقت الفعلي</p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={loadDashboardData}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            تحديث
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-sm">المراقبة النشطة</span>
            <Switch
              checked={isMonitoring}
              onCheckedChange={toggleMonitoring}
            />
            {isMonitoring ? <Play className="h-4 w-4 text-green-600" /> : <Pause className="h-4 w-4 text-gray-400" />}
          </div>
        </div>
      </div>

      {/* Performance Overview */}
      {currentPerformance && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">النتيجة الإجمالية</p>
                  <p className="text-2xl font-bold">{currentPerformance.overall_score.toFixed(1)}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-600" />
              </div>
              <Progress value={currentPerformance.overall_score} className="mt-2" />
            </CardContent>
          </Card>

          {currentPerformance.metrics.map((metric) => (
            <Card key={metric.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{metric.name}</p>
                    <p className={`text-2xl font-bold ${getMetricColor(metric.value, metric.type)}`}>
                      {formatMetricValue(metric.value, metric.unit)}
                    </p>
                  </div>
                  {metric.type === 'response_time' && <Clock className="h-8 w-8 text-blue-600" />}
                  {metric.type === 'memory_usage' && <HardDrive className="h-8 w-8 text-purple-600" />}
                  {metric.type === 'cpu_usage' && <Cpu className="h-8 w-8 text-orange-600" />}
                  {metric.type === 'cache_hit_rate' && <Database className="h-8 w-8 text-green-600" />}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="alerts">التنبيهات ({alerts.length})</TabsTrigger>
          <TabsTrigger value="recommendations">التوصيات ({recommendations.length})</TabsTrigger>
          <TabsTrigger value="optimizations">التحسينات</TabsTrigger>
          <TabsTrigger value="rules">القواعد</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recent Optimizations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  آخر التحسينات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {optimizationResults.slice(0, 3).map((result) => (
                    <div key={result.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">تحسين {result.rule_id}</p>
                        <p className="text-sm text-gray-600">
                          {result.started_at.toLocaleString('ar-SA')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={result.status === 'completed' ? 'default' : result.status === 'failed' ? 'destructive' : 'secondary'}>
                          {result.status === 'completed' ? 'مكتمل' : result.status === 'failed' ? 'فشل' : 'جاري'}
                        </Badge>
                        {result.improvement_percentage > 0 && (
                          <div className="flex items-center text-green-600">
                            <TrendingUp className="h-4 w-4 mr-1" />
                            {result.improvement_percentage.toFixed(1)}%
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* System Resources */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  موارد النظام
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentPerformance?.system_info && (
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>الذاكرة المستخدمة</span>
                        <span>{((currentPerformance.system_info.memory_used / currentPerformance.system_info.memory_total) * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={(currentPerformance.system_info.memory_used / currentPerformance.system_info.memory_total) * 100} />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>استخدام المعالج</span>
                        <span>{currentPerformance.system_info.cpu_usage.toFixed(1)}%</span>
                      </div>
                      <Progress value={currentPerformance.system_info.cpu_usage} />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>مساحة القرص المستخدمة</span>
                        <span>{((currentPerformance.system_info.disk_space_used / currentPerformance.system_info.disk_space_total) * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={(currentPerformance.system_info.disk_space_used / currentPerformance.system_info.disk_space_total) * 100} />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          {alerts.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <p className="text-lg font-medium">لا توجد تنبيهات نشطة</p>
                <p className="text-gray-600">النظام يعمل بكفاءة عالية</p>
              </CardContent>
            </Card>
          ) : (
            alerts.map((alert) => (
              <Alert key={alert.id} className={alert.severity === 'critical' ? 'border-red-500' : 'border-yellow-500'}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{alert.title}</p>
                      <p className="text-sm text-gray-600">{alert.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {alert.timestamp.toLocaleString('ar-SA')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                        {alert.severity === 'critical' ? 'حرج' : 'تحذير'}
                      </Badge>
                      {!alert.acknowledged && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => acknowledgeAlert(alert.id)}
                        >
                          إقرار
                        </Button>
                      )}
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            ))
          )}
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          {recommendations.map((rec) => (
            <Card key={rec.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium">{rec.title}</h3>
                      <Badge variant={rec.priority === 1 ? 'destructive' : rec.priority === 2 ? 'secondary' : 'outline'}>
                        أولوية {rec.priority === 1 ? 'عالية' : rec.priority === 2 ? 'متوسطة' : 'منخفضة'}
                      </Badge>
                      <Badge variant="outline">{rec.effort_level}</Badge>
                    </div>
                    <p className="text-gray-600 mb-4">{rec.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">تحسن زمن الاستجابة</p>
                        <p className="font-medium text-green-600">+{rec.estimated_impact.response_time_improvement}%</p>
                      </div>
                      <div>
                        <p className="text-gray-500">توفير الذاكرة</p>
                        <p className="font-medium text-blue-600">+{rec.estimated_impact.memory_savings}%</p>
                      </div>
                      <div>
                        <p className="text-gray-500">توفير المعالج</p>
                        <p className="font-medium text-purple-600">+{rec.estimated_impact.cpu_savings}%</p>
                      </div>
                      <div>
                        <p className="text-gray-500">توفير النطاق</p>
                        <p className="font-medium text-orange-600">+{rec.estimated_impact.bandwidth_savings}%</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    {rec.auto_implementable && (
                      <Button
                        onClick={() => implementRecommendation(rec.id)}
                        size="sm"
                      >
                        تطبيق تلقائي
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      عرض التفاصيل
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Optimizations Tab */}
        <TabsContent value="optimizations" className="space-y-4">
          {optimizationResults.map((result) => (
            <Card key={result.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-medium">تحسين {result.rule_id}</h3>
                    <p className="text-sm text-gray-600">
                      بدأ في: {result.started_at.toLocaleString('ar-SA')}
                    </p>
                    {result.completed_at && (
                      <p className="text-sm text-gray-600">
                        انتهى في: {result.completed_at.toLocaleString('ar-SA')}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={result.status === 'completed' ? 'default' : result.status === 'failed' ? 'destructive' : 'secondary'}>
                      {result.status === 'completed' ? 'مكتمل' : result.status === 'failed' ? 'فشل' : 'جاري'}
                    </Badge>
                    {result.improvement_percentage > 0 && (
                      <div className="flex items-center text-green-600">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        {result.improvement_percentage.toFixed(1)}%
                      </div>
                    )}
                  </div>
                </div>

                {result.actions_performed.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">الإجراءات المنفذة:</h4>
                    <div className="space-y-2">
                      {result.actions_performed.map((action, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">{action.description || action.action_type}</span>
                          <Badge variant={action.success ? 'default' : 'destructive'}>
                            {action.success ? 'نجح' : 'فشل'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {result.errors.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2 text-red-600">الأخطاء:</h4>
                    <div className="space-y-2">
                      {result.errors.map((error, index) => (
                        <div key={index} className="p-2 bg-red-50 border border-red-200 rounded">
                          <p className="text-sm text-red-800">{error.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Rules Tab */}
        <TabsContent value="rules" className="space-y-4">
          {rules.map((rule) => (
            <Card key={rule.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium">{rule.name}</h3>
                      <Badge variant={rule.enabled ? 'default' : 'secondary'}>
                        {rule.enabled ? 'مفعل' : 'معطل'}
                      </Badge>
                      <Badge variant="outline">أولوية {rule.priority}</Badge>
                    </div>
                    <p className="text-gray-600 mb-2">{rule.description}</p>
                    <p className="text-sm text-gray-500">
                      نوع التحسين: {rule.type} | 
                      عدد الإجراءات: {rule.actions.length} |
                      آخر تحديث: {rule.updated_at.toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => executeOptimization(rule.id)}
                      disabled={!rule.enabled}
                    >
                      تنفيذ
                    </Button>
                    <Button variant="outline" size="sm">
                      تحرير
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
