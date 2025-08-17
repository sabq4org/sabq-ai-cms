'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Eye,
  Users,
  Calendar,
  Clock,
  Heart,
  MessageCircle,
  Share2,
  BookOpen,
  Target,
  Zap,
  Globe,
  Smartphone,
  Monitor,
  Download,
  Filter,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Minus,
  Plus,
  PieChart,
  Activity,
  MapPin,
  Star,
  Trophy,
  Award,
  Flame,
  LineChart,
  AreaChart,
  Map,
  Settings,
  Calendar as CalendarIcon,
  Clock4,
  UserCheck,
  MousePointer,
  Navigation,
  Wifi,
  AlertCircle
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useGlobalStore, useAuth } from '@/stores/globalStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, TimeScale } from 'chart.js';
import { Bar, Line, Doughnut, Radar } from 'react-chartjs-2';
import { format, subDays, startOfDay, endOfDay, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval } from 'date-fns';
import { ar } from 'date-fns/locale';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

// ===========================================
// Types
// ===========================================

interface AnalyticsData {
  overview: {
    totalViews: number;
    uniqueVisitors: number;
    pageViews: number;
    bounceRate: number;
    avgSessionDuration: number;
    conversionRate: number;
    growth: {
      views: number;
      visitors: number;
      engagement: number;
    };
  };
  
  traffic: {
    timeline: Array<{
      date: string;
      views: number;
      visitors: number;
      sessions: number;
    }>;
    sources: Array<{
      source: string;
      visitors: number;
      percentage: number;
    }>;
    devices: Array<{
      device: string;
      visitors: number;
      percentage: number;
    }>;
    countries: Array<{
      country: string;
      visitors: number;
      percentage: number;
    }>;
  };
  
  content: {
    topArticles: Array<{
      id: string;
      title: string;
      views: number;
      likes: number;
      comments: number;
      shares: number;
      engagement: number;
    }>;
    categories: Array<{
      name: string;
      views: number;
      percentage: number;
    }>;
    authors: Array<{
      name: string;
      articles: number;
      views: number;
      engagement: number;
    }>;
  };
  
  engagement: {
    timeline: Array<{
      date: string;
      likes: number;
      comments: number;
      shares: number;
      saves: number;
    }>;
    demographics: {
      ageGroups: Array<{
        group: string;
        count: number;
        percentage: number;
      }>;
      interests: Array<{
        interest: string;
        count: number;
        percentage: number;
      }>;
    };
    userBehavior: {
      readingPatterns: Array<{
        hour: number;
        activity: number;
      }>;
      sessionDepth: Array<{
        pages: number;
        sessions: number;
      }>;
    };
  };
  
  performance: {
    pageSpeed: {
      average: number;
      mobile: number;
      desktop: number;
      trend: Array<{
        date: string;
        speed: number;
      }>;
    };
    errors: Array<{
      type: string;
      count: number;
      trend: number;
    }>;
    uptime: number;
  };
}

interface RealtimeData {
  activeUsers: number;
  currentViews: number;
  topPages: Array<{
    page: string;
    views: number;
  }>;
  recentEvents: Array<{
    type: string;
    page: string;
    timestamp: string;
    user?: string;
  }>;
}

// ===========================================
// API Functions
// ===========================================

const fetchAnalytics = async (
  dateRange: { from: Date; to: Date },
  filters?: any
): Promise<AnalyticsData> => {
  const params = new URLSearchParams({
    from: dateRange.from.toISOString(),
    to: dateRange.to.toISOString(),
    ...filters,
  });

  const response = await fetch(`/api/analytics?${params}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
    },
  });

  if (!response.ok) {
    throw new Error('فشل في جلب بيانات التحليلات');
  }

  return response.json();
};

const fetchRealtimeData = async (): Promise<RealtimeData> => {
  const response = await fetch('/api/analytics/realtime', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
    },
  });

  if (!response.ok) {
    throw new Error('فشل في جلب البيانات المباشرة');
  }

  return response.json();
};

const exportAnalytics = async (
  dateRange: { from: Date; to: Date },
  format: 'csv' | 'pdf' | 'excel'
): Promise<Blob> => {
  const params = new URLSearchParams({
    from: dateRange.from.toISOString(),
    to: dateRange.to.toISOString(),
    format,
  });

  const response = await fetch(`/api/analytics/export?${params}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
    },
  });

  if (!response.ok) {
    throw new Error('فشل في تصدير التحليلات');
  }

  return response.blob();
};

// ===========================================
// Utility Functions
// ===========================================

const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

const formatPercentage = (value: number): string => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
};

const formatDuration = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds}ث`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}د ${remainingSeconds}ث`;
};

// ===========================================
// Components
// ===========================================

const OverviewCards = ({ data }: { data: AnalyticsData['overview'] }) => {
  const cards = [
    {
      title: 'إجمالي المشاهدات',
      value: data.totalViews,
      growth: data.growth.views,
      icon: Eye,
      color: 'blue',
    },
    {
      title: 'الزوار الفريدين',
      value: data.uniqueVisitors,
      growth: data.growth.visitors,
      icon: Users,
      color: 'green',
    },
    {
      title: 'معدل الارتداد',
      value: data.bounceRate,
      growth: -data.bounceRate,
      icon: MousePointer,
      color: 'orange',
      suffix: '%',
    },
    {
      title: 'مدة الجلسة',
      value: data.avgSessionDuration,
      growth: data.growth.engagement,
      icon: Clock,
      color: 'purple',
      formatter: formatDuration,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold">
                    {card.formatter ? card.formatter(card.value) : formatNumber(card.value)}
                    {card.suffix}
                  </p>
                </div>
                <div className={`h-12 w-12 bg-${card.color}-100 rounded-lg flex items-center justify-center`}>
                  <card.icon className={`h-6 w-6 text-${card.color}-600`} />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center gap-2">
                  {card.growth >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  <span className={`text-sm font-medium ${
                    card.growth >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatPercentage(card.growth)}
                  </span>
                  <span className="text-sm text-gray-500">من الشهر الماضي</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

const TrafficChart = ({ data }: { data: AnalyticsData['traffic']['timeline'] }) => {
  const chartData = {
    labels: data.map(item => format(new Date(item.date), 'dd/MM')),
    datasets: [
      {
        label: 'المشاهدات',
        data: data.map(item => item.views),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'الزوار',
        data: data.map(item => item.visitors),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'التاريخ',
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'العدد',
        },
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LineChart className="w-5 h-5" />
          حركة المرور
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <Line data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  );
};

const EngagementMetrics = ({ data }: { data: AnalyticsData['engagement']['timeline'] }) => {
  const chartData = {
    labels: data.map(item => format(new Date(item.date), 'dd/MM')),
    datasets: [
      {
        label: 'إعجابات',
        data: data.map(item => item.likes),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
      },
      {
        label: 'تعليقات',
        data: data.map(item => item.comments),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
      },
      {
        label: 'مشاركات',
        data: data.map(item => item.shares),
        backgroundColor: 'rgba(168, 85, 247, 0.8)',
      },
      {
        label: 'حفظ',
        data: data.map(item => item.saves),
        backgroundColor: 'rgba(245, 158, 11, 0.8)',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
      },
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          مقاييس التفاعل
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <Bar data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  );
};

const TopContent = ({ data }: { data: AnalyticsData['content']['topArticles'] }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          أفضل المقالات
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-80">
          <div className="space-y-4">
            {data.map((article, index) => (
              <div
                key={article.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                    <span className="text-sm font-bold text-blue-600">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium line-clamp-1">{article.title}</h4>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {formatNumber(article.views)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {formatNumber(article.likes)}
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        {formatNumber(article.comments)}
                      </div>
                    </div>
                  </div>
                </div>
                <Badge variant="secondary">
                  {article.engagement.toFixed(1)}%
                </Badge>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

const TrafficSources = ({ data }: { data: AnalyticsData['traffic']['sources'] }) => {
  const chartData = {
    labels: data.map(item => item.source),
    datasets: [
      {
        data: data.map(item => item.percentage),
        backgroundColor: [
          '#EF4444',
          '#10B981',
          '#3B82F6',
          '#F59E0B',
          '#8B5CF6',
          '#EC4899',
        ],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="w-5 h-5" />
          مصادر الزيارات
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <Doughnut data={chartData} options={options} />
        </div>
        <div className="mt-4 space-y-2">
          {data.map((source, index) => (
            <div key={source.source} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded"
                  style={{
                    backgroundColor: ['#EF4444', '#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899'][index]
                  }}
                />
                <span className="text-sm">{source.source}</span>
              </div>
              <div className="text-sm font-medium">
                {source.percentage.toFixed(1)}%
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const DeviceBreakdown = ({ data }: { data: AnalyticsData['traffic']['devices'] }) => {
  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="w-4 h-4" />;
      case 'desktop':
        return <Monitor className="w-4 h-4" />;
      case 'tablet':
        return <Monitor className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="w-5 h-5" />
          الأجهزة
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((device) => (
            <div key={device.device} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getDeviceIcon(device.device)}
                  <span className="text-sm font-medium">{device.device}</span>
                </div>
                <div className="text-sm">
                  {device.percentage.toFixed(1)}%
                </div>
              </div>
              <Progress value={device.percentage} className="h-2" />
              <div className="text-xs text-gray-500">
                {formatNumber(device.visitors)} زائر
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const RealTimeWidget = () => {
  const {
    data: realtimeData,
    isLoading,
    error
  } = useQuery({
    queryKey: ['realtime-analytics'],
    queryFn: fetchRealtimeData,
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !realtimeData) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>فشل في تحميل البيانات المباشرة</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          البيانات المباشرة
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {realtimeData.activeUsers}
            </p>
            <p className="text-sm text-gray-600">مستخدم نشط</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {realtimeData.currentViews}
            </p>
            <p className="text-sm text-gray-600">مشاهدة حالية</p>
          </div>
        </div>

        <Separator />

        <div>
          <h4 className="font-medium mb-2">الصفحات الأكثر زيارة</h4>
          <div className="space-y-2">
            {realtimeData.topPages.map((page, index) => (
              <div key={page.page} className="flex items-center justify-between">
                <span className="text-sm truncate">{page.page}</span>
                <Badge variant="secondary">{page.views}</Badge>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <div>
          <h4 className="font-medium mb-2">الأحداث الأخيرة</h4>
          <ScrollArea className="h-32">
            <div className="space-y-1">
              {realtimeData.recentEvents.map((event, index) => (
                <div key={index} className="text-xs text-gray-600">
                  <span className="font-medium">{event.type}</span> على{' '}
                  <span className="text-blue-600">{event.page}</span>
                  {event.user && ` بواسطة ${event.user}`}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};

// ===========================================
// Main Component
// ===========================================

export const AnalyticsDashboard: React.FC = () => {
  const { user, trackPageView } = useGlobalStore();
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    trackPageView('/analytics');
  }, [trackPageView]);

  // Fetch analytics data
  const {
    data: analytics,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['analytics', dateRange],
    queryFn: () => fetchAnalytics(dateRange),
    enabled: !!user,
  });

  const handleExport = async (format: 'csv' | 'pdf' | 'excel') => {
    try {
      const blob = await exportAnalytics(dateRange, format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${format}-${format(new Date(), 'yyyy-MM-dd')}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">يجب تسجيل الدخول لعرض التحليلات</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>حدث خطأ في تحميل التحليلات</AlertDescription>
          </Alert>
          <Button onClick={() => refetch()} className="mt-4">
            إعادة المحاولة
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="w-6 h-6" />
            لوحة التحليلات
          </h1>
          <p className="text-gray-600 mt-1">
            تحليلات شاملة وتقارير تفاعلية لموقعك
          </p>
        </div>

        <div className="flex items-center gap-2">
          <DatePicker
            date={dateRange.from}
            onDateChange={(date) => setDateRange({ ...dateRange, from: date || new Date() })}
            placeholder="من تاريخ"
          />
          
          <DatePicker
            date={dateRange.to}
            onDateChange={(date) => setDateRange({ ...dateRange, to: date || new Date() })}
            placeholder="إلى تاريخ"
          />

          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            تحديث
          </Button>

          <Select onValueChange={(value) => handleExport(value as any)}>
            <SelectTrigger className="w-32">
              <Download className="w-4 h-4 mr-2" />
              تصدير
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">CSV</SelectItem>
              <SelectItem value="excel">Excel</SelectItem>
              <SelectItem value="pdf">PDF</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Real-time widget */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : analytics ? (
            <OverviewCards data={analytics.overview} />
          ) : null}
        </div>
        
        <div>
          <RealTimeWidget />
        </div>
      </div>

      {/* Main analytics tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="traffic">حركة المرور</TabsTrigger>
          <TabsTrigger value="content">المحتوى</TabsTrigger>
          <TabsTrigger value="engagement">التفاعل</TabsTrigger>
          <TabsTrigger value="performance">الأداء</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                      <div className="h-64 bg-gray-200 rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : analytics ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TrafficChart data={analytics.traffic.timeline} />
              <EngagementMetrics data={analytics.engagement.timeline} />
            </div>
          ) : null}
        </TabsContent>

        <TabsContent value="traffic" className="space-y-6">
          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                      <div className="h-64 bg-gray-200 rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : analytics ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <TrafficSources data={analytics.traffic.sources} />
              <DeviceBreakdown data={analytics.traffic.devices} />
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    البلدان
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.traffic.countries.map((country) => (
                      <div key={country.country} className="flex items-center justify-between">
                        <span className="text-sm">{country.country}</span>
                        <div className="flex items-center gap-2">
                          <Progress value={country.percentage} className="w-16 h-2" />
                          <span className="text-sm font-medium">
                            {country.percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse space-y-4">
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                      {[1, 2, 3, 4, 5].map((j) => (
                        <div key={j} className="h-12 bg-gray-200 rounded"></div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : analytics ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TopContent data={analytics.content.topArticles} />
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    الفئات الأكثر شعبية
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.content.categories.map((category) => (
                      <div key={category.name} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{category.name}</span>
                          <span className="text-sm">{category.percentage.toFixed(1)}%</span>
                        </div>
                        <Progress value={category.percentage} className="h-2" />
                        <div className="text-xs text-gray-500">
                          {formatNumber(category.views)} مشاهدة
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          {analytics ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>الفئات العمرية</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.engagement.demographics.ageGroups.map((group) => (
                      <div key={group.group} className="flex items-center justify-between">
                        <span className="text-sm">{group.group}</span>
                        <div className="flex items-center gap-2">
                          <Progress value={group.percentage} className="w-16 h-2" />
                          <span className="text-sm font-medium">
                            {group.percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>الاهتمامات</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.engagement.demographics.interests.map((interest) => (
                      <div key={interest.interest} className="flex items-center justify-between">
                        <span className="text-sm">{interest.interest}</span>
                        <div className="flex items-center gap-2">
                          <Progress value={interest.percentage} className="w-16 h-2" />
                          <span className="text-sm font-medium">
                            {interest.percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {analytics ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    سرعة الصفحة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{analytics.performance.pageSpeed.average}ms</p>
                      <p className="text-sm text-gray-600">متوسط</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{analytics.performance.pageSpeed.mobile}ms</p>
                      <p className="text-sm text-gray-600">موبايل</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{analytics.performance.pageSpeed.desktop}ms</p>
                      <p className="text-sm text-gray-600">سطح المكتب</p>
                    </div>
                  </div>
                  <div className="h-32">
                    <Line
                      data={{
                        labels: analytics.performance.pageSpeed.trend.map(item => 
                          format(new Date(item.date), 'dd/MM')
                        ),
                        datasets: [{
                          label: 'سرعة الصفحة (ms)',
                          data: analytics.performance.pageSpeed.trend.map(item => item.speed),
                          borderColor: 'rgb(168, 85, 247)',
                          tension: 0.4,
                        }],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    الأخطاء
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.performance.errors.map((error) => (
                      <div key={error.type} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{error.type}</p>
                          <p className="text-xs text-gray-500">{error.count} خطأ</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {error.trend >= 0 ? (
                            <ArrowUp className="w-4 h-4 text-red-500" />
                          ) : (
                            <ArrowDown className="w-4 h-4 text-green-500" />
                          )}
                          <span className={`text-sm font-medium ${
                            error.trend >= 0 ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {formatPercentage(error.trend)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">وقت التشغيل</span>
                    <div className="flex items-center gap-2">
                      <Progress value={analytics.performance.uptime} className="w-16 h-2" />
                      <span className="text-sm font-bold text-green-600">
                        {analytics.performance.uptime.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;
