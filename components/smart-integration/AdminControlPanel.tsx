'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Users,
  FileText,
  BarChart3,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Eye,
  MessageSquare,
  Heart,
  Share2,
  Download,
  Upload,
  RefreshCw,
  Filter,
  Search,
  Calendar,
  MapPin,
  Globe,
  Server,
  Database,
  Cpu,
  HardDrive,
  Wifi,
  Activity,
  Zap,
  Bell,
  Lock,
  Key,
  UserCheck,
  UserX,
  Mail,
  Smartphone,
  Monitor,
  Trash2,
  Edit,
  Plus,
  Minus,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Copy,
  Flag,
  Crown,
  Award,
  Target
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useGlobalStore, useAuth } from '@/stores/globalStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { format, subDays, subMonths } from 'date-fns';
import { ar } from 'date-fns/locale';
import { toast } from 'react-hot-toast';

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
  Legend
);

// ===========================================
// Types
// ===========================================

interface SystemStats {
  users: {
    total: number;
    active: number;
    newToday: number;
    growth: number;
  };
  content: {
    articles: number;
    published: number;
    draft: number;
    scheduled: number;
  };
  engagement: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
  };
  performance: {
    responseTime: number;
    uptime: number;
    errorRate: number;
    throughput: number;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'subscriber';
  status: 'active' | 'suspended' | 'banned';
  lastLogin: string;
  joinedAt: string;
  articlesCount: number;
  engagement: number;
}

interface ContentItem {
  id: string;
  title: string;
  author: string;
  status: 'published' | 'draft' | 'scheduled' | 'archived';
  publishedAt: string;
  views: number;
  likes: number;
  comments: number;
  category: string;
  featured: boolean;
}

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  services: {
    name: string;
    status: 'online' | 'offline' | 'degraded';
    responseTime: number;
    uptime: number;
  }[];
  resources: {
    cpu: number;
    memory: number;
    storage: number;
    bandwidth: number;
  };
}

interface SecurityEvent {
  id: string;
  type: 'login_attempt' | 'permission_change' | 'data_access' | 'system_change';
  severity: 'low' | 'medium' | 'high' | 'critical';
  user?: string;
  description: string;
  timestamp: string;
  ip?: string;
  resolved: boolean;
}

// ===========================================
// API Functions
// ===========================================

const fetchSystemStats = async (period: string = '30d'): Promise<SystemStats> => {
  const response = await fetch(`/api/admin/stats?period=${period}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
    },
  });

  if (!response.ok) {
    throw new Error('فشل في جلب إحصائيات النظام');
  }

  return response.json();
};

const fetchUsers = async (page: number = 1, limit: number = 50, filters?: any): Promise<{ users: User[]; total: number }> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...filters,
  });

  const response = await fetch(`/api/admin/users?${params}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
    },
  });

  if (!response.ok) {
    throw new Error('فشل في جلب بيانات المستخدمين');
  }

  return response.json();
};

const fetchContent = async (page: number = 1, limit: number = 50, filters?: any): Promise<{ content: ContentItem[]; total: number }> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...filters,
  });

  const response = await fetch(`/api/admin/content?${params}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
    },
  });

  if (!response.ok) {
    throw new Error('فشل في جلب بيانات المحتوى');
  }

  return response.json();
};

const fetchSystemHealth = async (): Promise<SystemHealth> => {
  const response = await fetch('/api/admin/health', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
    },
  });

  if (!response.ok) {
    throw new Error('فشل في جلب حالة النظام');
  }

  return response.json();
};

const fetchSecurityEvents = async (page: number = 1, limit: number = 20): Promise<{ events: SecurityEvent[]; total: number }> => {
  const response = await fetch(`/api/admin/security?page=${page}&limit=${limit}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
    },
  });

  if (!response.ok) {
    throw new Error('فشل في جلب أحداث الأمان');
  }

  return response.json();
};

// ===========================================
// Components
// ===========================================

const StatsOverview = ({ stats }: { stats: SystemStats }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">المستخدمين النشطين</p>
              <p className="text-2xl font-bold">{stats.users.active.toLocaleString()}</p>
              <p className="text-xs text-gray-500">
                +{stats.users.newToday} اليوم
              </p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-600 font-medium">
                +{stats.users.growth}%
              </span>
              <span className="text-sm text-gray-500">من الشهر الماضي</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">المقالات المنشورة</p>
              <p className="text-2xl font-bold">{stats.content.published.toLocaleString()}</p>
              <p className="text-xs text-gray-500">
                {stats.content.draft} مسودة
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <Progress 
              value={(stats.content.published / stats.content.articles) * 100} 
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">إجمالي المشاهدات</p>
              <p className="text-2xl font-bold">{stats.engagement.views.toLocaleString()}</p>
              <p className="text-xs text-gray-500">
                {stats.engagement.likes.toLocaleString()} إعجاب
              </p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Eye className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-purple-500" />
              <span className="text-sm text-purple-600 font-medium">
                {((stats.engagement.likes / stats.engagement.views) * 100).toFixed(1)}%
              </span>
              <span className="text-sm text-gray-500">معدل التفاعل</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">أداء الخادم</p>
              <p className="text-2xl font-bold">{stats.performance.responseTime}ms</p>
              <p className="text-xs text-gray-500">
                {stats.performance.uptime}% وقت التشغيل
              </p>
            </div>
            <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Server className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-orange-500" />
              <span className="text-sm text-orange-600 font-medium">
                {stats.performance.throughput}/s
              </span>
              <span className="text-sm text-gray-500">طلبات</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const UsersManagement = () => {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({});
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const {
    data: usersData,
    isLoading,
    error
  } = useQuery({
    queryKey: ['admin-users', page, filters],
    queryFn: () => fetchUsers(page, 50, filters),
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'editor':
        return 'bg-blue-100 text-blue-800';
      case 'subscriber':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'suspended':
        return 'bg-yellow-100 text-yellow-800';
      case 'banned':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>حدث خطأ في تحميل بيانات المستخدمين</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            إدارة المستخدمين
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Input
              placeholder="البحث عن مستخدم..."
              className="w-64"
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
            
            <Select onValueChange={(value) => setFilters({ ...filters, role: value })}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="الدور" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="admin">مدير</SelectItem>
                <SelectItem value="editor">محرر</SelectItem>
                <SelectItem value="subscriber">مشترك</SelectItem>
              </SelectContent>
            </Select>
            
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              إضافة مستخدم
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>المستخدم</TableHead>
              <TableHead>الدور</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>آخر دخول</TableHead>
              <TableHead>المقالات</TableHead>
              <TableHead>التفاعل</TableHead>
              <TableHead>الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usersData?.users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getRoleColor(user.role)}>
                    {user.role === 'admin' ? 'مدير' : user.role === 'editor' ? 'محرر' : 'مشترك'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(user.status)}>
                    {user.status === 'active' ? 'نشط' : user.status === 'suspended' ? 'معلق' : 'محظور'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {format(new Date(user.lastLogin), 'dd/MM/yyyy', { locale: ar })}
                </TableCell>
                <TableCell>{user.articlesCount}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <span>{user.engagement}%</span>
                    <Progress value={user.engagement} className="w-16 h-2" />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Mail className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-600">
                      <UserX className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-500">
            عرض {(page - 1) * 50 + 1}-{Math.min(page * 50, usersData?.total || 0)} من {usersData?.total}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              السابق
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={!usersData || page * 50 >= usersData.total}
            >
              التالي
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const SystemHealth = () => {
  const {
    data: health,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['system-health'],
    queryFn: fetchSystemHealth,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
        return 'text-green-600 bg-green-100';
      case 'warning':
      case 'degraded':
        return 'text-yellow-600 bg-yellow-100';
      case 'critical':
      case 'offline':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
        return <CheckCircle className="w-4 h-4" />;
      case 'warning':
      case 'degraded':
        return <AlertTriangle className="w-4 h-4" />;
      case 'critical':
      case 'offline':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !health) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>حدث خطأ في تحميل حالة النظام</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            حالة النظام
            <Badge className={getStatusColor(health.status)}>
              {getStatusIcon(health.status)}
              {health.status === 'healthy' ? 'سليم' : 
               health.status === 'warning' ? 'تحذير' : 'حرج'}
            </Badge>
          </CardTitle>
          
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            تحديث
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Services */}
        <div>
          <h3 className="font-semibold mb-3">الخدمات</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {health.services.map((service) => (
              <div
                key={service.name}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1 rounded ${getStatusColor(service.status)}`}>
                    {getStatusIcon(service.status)}
                  </div>
                  <div>
                    <div className="font-medium">{service.name}</div>
                    <div className="text-sm text-gray-500">
                      {service.responseTime}ms • {service.uptime}% uptime
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resources */}
        <div>
          <h3 className="font-semibold mb-3">الموارد</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4" />
                  <span className="text-sm">المعالج</span>
                </div>
                <span className="text-sm font-medium">{health.resources.cpu}%</span>
              </div>
              <Progress value={health.resources.cpu} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  <span className="text-sm">الذاكرة</span>
                </div>
                <span className="text-sm font-medium">{health.resources.memory}%</span>
              </div>
              <Progress value={health.resources.memory} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4" />
                  <span className="text-sm">التخزين</span>
                </div>
                <span className="text-sm font-medium">{health.resources.storage}%</span>
              </div>
              <Progress value={health.resources.storage} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wifi className="w-4 h-4" />
                  <span className="text-sm">النطاق</span>
                </div>
                <span className="text-sm font-medium">{health.resources.bandwidth}%</span>
              </div>
              <Progress value={health.resources.bandwidth} className="h-2" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const SecurityEvents = () => {
  const [page, setPage] = useState(1);

  const {
    data: eventsData,
    isLoading,
    error
  } = useQuery({
    queryKey: ['security-events', page],
    queryFn: () => fetchSecurityEvents(page, 20),
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'bg-blue-100 text-blue-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>حدث خطأ في تحميل أحداث الأمان</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          أحداث الأمان
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-3">
            {eventsData?.events.map((event) => (
              <div
                key={event.id}
                className={`p-4 border rounded-lg ${
                  event.resolved ? 'bg-gray-50' : 'bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge className={getSeverityColor(event.severity)}>
                        {event.severity === 'low' ? 'منخفض' :
                         event.severity === 'medium' ? 'متوسط' :
                         event.severity === 'high' ? 'عالي' : 'حرج'}
                      </Badge>
                      
                      <span className="text-sm text-gray-500">
                        {format(new Date(event.timestamp), 'dd/MM/yyyy HH:mm', { locale: ar })}
                      </span>
                      
                      {event.resolved && (
                        <Badge variant="outline" className="text-green-600">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          محلول
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm mb-2">{event.description}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      {event.user && (
                        <span>المستخدم: {event.user}</span>
                      )}
                      {event.ip && (
                        <span>IP: {event.ip}</span>
                      )}
                      <span>النوع: {event.type}</span>
                    </div>
                  </div>
                  
                  {!event.resolved && (
                    <Button variant="outline" size="sm">
                      حل
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

// ===========================================
// Main Component
// ===========================================

export const AdminControlPanel: React.FC = () => {
  const { user } = useAuth();
  const { trackPageView } = useGlobalStore();
  const [timePeriod, setTimePeriod] = useState('30d');

  useEffect(() => {
    trackPageView('/admin');
  }, [trackPageView]);

  // Check admin permissions
  if (!user || user.role !== 'admin') {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">غير مصرح</h2>
          <p className="text-gray-500">تحتاج إلى صلاحيات إدارية للوصول إلى هذه الصفحة</p>
        </CardContent>
      </Card>
    );
  }

  // Fetch system stats
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError
  } = useQuery({
    queryKey: ['admin-stats', timePeriod],
    queryFn: () => fetchSystemStats(timePeriod),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6" />
            لوحة التحكم الإدارية
          </h1>
          <p className="text-gray-600 mt-1">
            إدارة شاملة للنظام والمستخدمين والمحتوى
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Select value={timePeriod} onValueChange={setTimePeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">آخر 7 أيام</SelectItem>
              <SelectItem value="30d">آخر 30 يوم</SelectItem>
              <SelectItem value="90d">آخر 3 أشهر</SelectItem>
              <SelectItem value="1y">آخر سنة</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            تصدير التقرير
          </Button>
        </div>
      </div>

      {/* Stats overview */}
      {statsLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : statsError || !stats ? (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>حدث خطأ في تحميل الإحصائيات</AlertDescription>
        </Alert>
      ) : (
        <StatsOverview stats={stats} />
      )}

      {/* Main content tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="users">المستخدمين</TabsTrigger>
          <TabsTrigger value="content">المحتوى</TabsTrigger>
          <TabsTrigger value="analytics">التحليلات</TabsTrigger>
          <TabsTrigger value="security">الأمان</TabsTrigger>
          <TabsTrigger value="settings">الإعدادات</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SystemHealth />
            <SecurityEvents />
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <UsersManagement />
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">إدارة المحتوى قيد التطوير</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardContent className="p-8 text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">التحليلات المتقدمة قيد التطوير</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <SecurityEvents />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardContent className="p-8 text-center">
              <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">إعدادات النظام قيد التطوير</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminControlPanel;
