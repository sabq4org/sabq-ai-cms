'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wifi,
  WifiOff,
  Circle,
  Bell,
  Eye,
  Users,
  MessageCircle,
  Heart,
  Share2,
  TrendingUp,
  Activity,
  Zap,
  Globe,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Info,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Volume2,
  VolumeX,
  Settings,
  Minimize2,
  Maximize2,
  X,
  Pin,
  PinOff,
  Filter,
  BarChart3,
  User,
  FileText,
  Calendar,
  Tag,
  MapPin,
  Smartphone,
  Monitor,
  Tablet,
  Navigation,
  Link2
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { useGlobalStore, useAuth, useConnection } from '@/stores/globalStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

// ===========================================
// Types
// ===========================================

interface RealTimeEvent {
  id: string;
  type: 'user_activity' | 'content_update' | 'engagement' | 'system' | 'notification';
  category: string;
  title: string;
  description: string;
  data: any;
  timestamp: string;
  user?: {
    id: string;
    name: string;
    avatar?: string;
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
  location?: string;
  device?: string;
  url?: string;
  read: boolean;
}

interface LiveStats {
  activeUsers: number;
  totalViews: number;
  currentEngagement: number;
  serverLoad: number;
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor';
  responseTime: number;
  errorRate: number;
  newUsers: number;
  topPages: Array<{
    url: string;
    title: string;
    views: number;
  }>;
  recentActions: Array<{
    type: string;
    count: number;
    trend: number;
  }>;
}

interface ConnectionStatus {
  connected: boolean;
  reconnecting: boolean;
  lastConnected?: string;
  disconnectReason?: string;
  latency: number;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
}

interface RealTimeSettings {
  enabled: boolean;
  sound: boolean;
  autoScroll: boolean;
  showNotifications: boolean;
  filterTypes: string[];
  updateInterval: number;
  maxEvents: number;
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  minimized: boolean;
  pinned: boolean;
}

// ===========================================
// Utility Functions
// ===========================================

const getEventIcon = (type: string, category: string) => {
  const iconProps = { className: "w-4 h-4" };
  
  switch (type) {
    case 'user_activity':
      switch (category) {
        case 'login':
          return <User {...iconProps} className="text-green-500" />;
        case 'view':
          return <Eye {...iconProps} className="text-blue-500" />;
        case 'comment':
          return <MessageCircle {...iconProps} className="text-purple-500" />;
        case 'like':
          return <Heart {...iconProps} className="text-red-500" />;
        case 'share':
          return <Share2 {...iconProps} className="text-blue-600" />;
        default:
          return <Activity {...iconProps} className="text-gray-500" />;
      }
    case 'content_update':
      return <FileText {...iconProps} className="text-orange-500" />;
    case 'engagement':
      return <TrendingUp {...iconProps} className="text-green-600" />;
    case 'system':
      return <Settings {...iconProps} className="text-gray-600" />;
    case 'notification':
      return <Bell {...iconProps} className="text-yellow-500" />;
    default:
      return <Circle {...iconProps} className="text-gray-400" />;
  }
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical':
      return 'text-red-600 bg-red-100';
    case 'high':
      return 'text-orange-600 bg-orange-100';
    case 'medium':
      return 'text-yellow-600 bg-yellow-100';
    case 'low':
      return 'text-blue-600 bg-blue-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

const getDeviceIcon = (device: string) => {
  const iconProps = { className: "w-3 h-3" };
  
  switch (device?.toLowerCase()) {
    case 'mobile':
      return <Smartphone {...iconProps} />;
    case 'tablet':
      return <Tablet {...iconProps} />;
    case 'desktop':
      return <Monitor {...iconProps} />;
    default:
      return <Globe {...iconProps} />;
  }
};

const getConnectionQualityColor = (quality: string) => {
  switch (quality) {
    case 'excellent':
      return 'text-green-500';
    case 'good':
      return 'text-blue-500';
    case 'fair':
      return 'text-yellow-500';
    case 'poor':
      return 'text-red-500';
    default:
      return 'text-gray-500';
  }
};

const formatRelativeTime = (timestamp: string): string => {
  const now = Date.now();
  const eventTime = new Date(timestamp).getTime();
  const diff = now - eventTime;
  
  if (diff < 60000) { // Less than 1 minute
    return 'الآن';
  } else if (diff < 3600000) { // Less than 1 hour
    const minutes = Math.floor(diff / 60000);
    return `منذ ${minutes} دقيقة`;
  } else if (diff < 86400000) { // Less than 1 day
    const hours = Math.floor(diff / 3600000);
    return `منذ ${hours} ساعة`;
  } else {
    return format(new Date(timestamp), 'dd/MM HH:mm', { locale: ar });
  }
};

// ===========================================
// Components
// ===========================================

const ConnectionIndicator = ({ status }: { status: ConnectionStatus }) => {
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        {status.connected ? (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <Wifi className={`w-4 h-4 ${getConnectionQualityColor(status.quality)}`} />
          </div>
        ) : (
          <div className="flex items-center gap-1">
            {status.reconnecting ? (
              <RefreshCw className="w-4 h-4 text-yellow-500 animate-spin" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-500" />
            )}
          </div>
        )}
      </div>
      
      <div className="text-xs">
        {status.connected ? (
          <div className="text-green-600">
            متصل ({status.latency}ms)
          </div>
        ) : status.reconnecting ? (
          <div className="text-yellow-600">
            جاري الاتصال...
          </div>
        ) : (
          <div className="text-red-600">
            غير متصل
          </div>
        )}
      </div>
    </div>
  );
};

const LiveStatsWidget = ({ stats }: { stats: LiveStats }) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="text-center">
        <div className="text-lg font-bold text-green-600">
          {stats.activeUsers.toLocaleString()}
        </div>
        <div className="text-xs text-gray-600">مستخدم نشط</div>
      </div>
      
      <div className="text-center">
        <div className="text-lg font-bold text-blue-600">
          {stats.totalViews.toLocaleString()}
        </div>
        <div className="text-xs text-gray-600">مشاهدة</div>
      </div>
      
      <div className="text-center">
        <div className="text-lg font-bold text-purple-600">
          {stats.currentEngagement.toFixed(1)}%
        </div>
        <div className="text-xs text-gray-600">تفاعل</div>
      </div>
      
      <div className="text-center">
        <div className="text-lg font-bold text-orange-600">
          {stats.responseTime}ms
        </div>
        <div className="text-xs text-gray-600">استجابة</div>
      </div>
    </div>
  );
};

const EventItem = ({ 
  event, 
  onMarkRead, 
  compact = false 
}: { 
  event: RealTimeEvent;
  onMarkRead?: (id: string) => void;
  compact?: boolean;
}) => {
  const handleClick = () => {
    if (!event.read && onMarkRead) {
      onMarkRead(event.id);
    }
    
    if (event.url) {
      window.open(event.url, '_blank');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className={`p-3 border-l-4 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
        event.read ? 'bg-white opacity-75' : 'bg-blue-50 border-l-blue-500'
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">
          {getEventIcon(event.type, event.category)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h4 className={`text-sm font-medium ${
                event.read ? 'text-gray-600' : 'text-gray-900'
              } line-clamp-1`}>
                {event.title}
              </h4>
              
              {!compact && (
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                  {event.description}
                </p>
              )}
            </div>
            
            {!event.read && (
              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
            )}
          </div>
          
          <div className="flex items-center gap-3 mt-2">
            <Badge variant="outline" className={`text-xs ${getSeverityColor(event.severity)}`}>
              {event.severity === 'critical' ? 'حرج' :
               event.severity === 'high' ? 'عالي' :
               event.severity === 'medium' ? 'متوسط' : 'منخفض'}
            </Badge>
            
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              {formatRelativeTime(event.timestamp)}
            </div>
            
            {event.user && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Avatar className="w-4 h-4">
                  <AvatarImage src={event.user.avatar} />
                  <AvatarFallback className="text-xs">
                    {event.user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {event.user.name}
              </div>
            )}
            
            {event.device && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                {getDeviceIcon(event.device)}
              </div>
            )}
            
            {event.location && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <MapPin className="w-3 h-3" />
                {event.location}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const RealTimeFilters = ({ 
  filterTypes, 
  onFilterChange,
  availableTypes 
}: { 
  filterTypes: string[];
  onFilterChange: (types: string[]) => void;
  availableTypes: Array<{ key: string; label: string; }>;
}) => {
  const toggleFilter = (type: string) => {
    if (filterTypes.includes(type)) {
      onFilterChange(filterTypes.filter(t => t !== type));
    } else {
      onFilterChange([...filterTypes, type]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">فلتر الأحداث</div>
      <div className="space-y-1">
        {availableTypes.map((type) => (
          <div key={type.key} className="flex items-center space-x-2 space-x-reverse">
            <input
              type="checkbox"
              id={type.key}
              checked={filterTypes.includes(type.key)}
              onChange={() => toggleFilter(type.key)}
              className="rounded"
            />
            <label htmlFor={type.key} className="text-sm">
              {type.label}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

// ===========================================
// Main Component
// ===========================================

export const RealTimeUpdates: React.FC = () => {
  const { user, trackInteraction } = useGlobalStore();
  const { connection } = useConnection();
  
  const [socket, setSocket] = useState<Socket | null>(null);
  const [events, setEvents] = useState<RealTimeEvent[]>([]);
  const [liveStats, setLiveStats] = useState<LiveStats | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    connected: false,
    reconnecting: false,
    latency: 0,
    quality: 'poor',
  });
  
  const [settings, setSettings] = useState<RealTimeSettings>({
    enabled: true,
    sound: true,
    autoScroll: true,
    showNotifications: true,
    filterTypes: ['user_activity', 'content_update', 'engagement'],
    updateInterval: 1000,
    maxEvents: 50,
    position: 'bottom-right',
    minimized: false,
    pinned: false,
  });

  const [activeTab, setActiveTab] = useState('events');
  const eventsRef = useRef<HTMLDivElement>(null);
  const soundRef = useRef<HTMLAudioElement>(null);

  // Initialize socket connection
  useEffect(() => {
    if (!user || !settings.enabled) return;

    const newSocket = io(process.env.NEXT_PUBLIC_WEBSOCKET_URL || '', {
      auth: {
        token: localStorage.getItem('auth-token'),
        userId: user.id,
      },
      transports: ['websocket', 'polling'],
    });

    // Connection events
    newSocket.on('connect', () => {
      setConnectionStatus(prev => ({
        ...prev,
        connected: true,
        reconnecting: false,
        lastConnected: new Date().toISOString(),
      }));
      
      trackInteraction('realtime_connected');
    });

    newSocket.on('disconnect', (reason) => {
      setConnectionStatus(prev => ({
        ...prev,
        connected: false,
        disconnectReason: reason,
      }));
    });

    newSocket.on('reconnect_attempt', () => {
      setConnectionStatus(prev => ({
        ...prev,
        reconnecting: true,
      }));
    });

    // Data events
    newSocket.on('real_time_event', (event: RealTimeEvent) => {
      if (settings.filterTypes.includes(event.type)) {
        setEvents(prev => {
          const newEvents = [event, ...prev].slice(0, settings.maxEvents);
          return newEvents;
        });

        // Play notification sound
        if (settings.sound && soundRef.current) {
          soundRef.current.play().catch(() => {});
        }

        // Show browser notification
        if (settings.showNotifications && event.severity === 'high' || event.severity === 'critical') {
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(event.title, {
              body: event.description,
              icon: '/icon-192x192.png',
              tag: event.id,
            });
          }
        }
      }
    });

    newSocket.on('live_stats', (stats: LiveStats) => {
      setLiveStats(stats);
    });

    newSocket.on('connection_quality', (quality: any) => {
      setConnectionStatus(prev => ({
        ...prev,
        latency: quality.latency,
        quality: quality.quality,
      }));
    });

    // Ping to measure latency
    const pingInterval = setInterval(() => {
      const start = Date.now();
      newSocket.emit('ping', start, (response: number) => {
        const latency = Date.now() - response;
        setConnectionStatus(prev => ({
          ...prev,
          latency,
          quality: latency < 100 ? 'excellent' : 
                   latency < 200 ? 'good' : 
                   latency < 500 ? 'fair' : 'poor',
        }));
      });
    }, 5000);

    setSocket(newSocket);

    return () => {
      clearInterval(pingInterval);
      newSocket.close();
    };
  }, [user, settings.enabled, settings.filterTypes, settings.sound, settings.showNotifications]);

  // Auto-scroll to latest events
  useEffect(() => {
    if (settings.autoScroll && eventsRef.current) {
      eventsRef.current.scrollTop = 0;
    }
  }, [events, settings.autoScroll]);

  // Request notification permission
  useEffect(() => {
    if (settings.showNotifications && 'Notification' in window) {
      Notification.requestPermission();
    }
  }, [settings.showNotifications]);

  const handleMarkRead = (eventId: string) => {
    setEvents(prev => 
      prev.map(event => 
        event.id === eventId ? { ...event, read: true } : event
      )
    );
  };

  const handleMarkAllRead = () => {
    setEvents(prev => prev.map(event => ({ ...event, read: true })));
  };

  const handleClearEvents = () => {
    setEvents([]);
  };

  const updateSettings = (newSettings: Partial<RealTimeSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const unreadCount = events.filter(event => !event.read).length;

  const availableEventTypes = [
    { key: 'user_activity', label: 'نشاط المستخدمين' },
    { key: 'content_update', label: 'تحديثات المحتوى' },
    { key: 'engagement', label: 'التفاعل' },
    { key: 'system', label: 'النظام' },
    { key: 'notification', label: 'الإشعارات' },
  ];

  if (!user) {
    return null;
  }

  return (
    <>
      {/* Hidden audio element for notifications */}
      <audio
        ref={soundRef}
        src="/sounds/notification.mp3"
        preload="auto"
      />

      {/* Main real-time widget */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`fixed z-50 ${
          settings.position === 'bottom-right' ? 'bottom-4 right-4' :
          settings.position === 'bottom-left' ? 'bottom-4 left-4' :
          settings.position === 'top-right' ? 'top-4 right-4' :
          'top-4 left-4'
        } ${settings.minimized ? 'w-16 h-16' : 'w-96 h-[32rem]'}`}
      >
        <Card className="h-full shadow-xl border-2">
          {/* Header */}
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Activity className="w-4 h-4" />
                  {!settings.minimized && (
                    <CardTitle className="text-sm">التحديثات المباشرة</CardTitle>
                  )}
                </div>
                
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-1">
                <ConnectionIndicator status={connectionStatus} />
                
                {!settings.minimized && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => updateSettings({ pinned: !settings.pinned })}
                    >
                      {settings.pinned ? (
                        <PinOff className="w-3 h-3" />
                      ) : (
                        <Pin className="w-3 h-3" />
                      )}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => updateSettings({ sound: !settings.sound })}
                    >
                      {settings.sound ? (
                        <Volume2 className="w-3 h-3" />
                      ) : (
                        <VolumeX className="w-3 h-3" />
                      )}
                    </Button>
                  </>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => updateSettings({ minimized: !settings.minimized })}
                >
                  {settings.minimized ? (
                    <Maximize2 className="w-3 h-3" />
                  ) : (
                    <Minimize2 className="w-3 h-3" />
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>

          {!settings.minimized && (
            <CardContent className="p-0 h-full">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                <TabsList className="grid w-full grid-cols-3 mx-4">
                  <TabsTrigger value="events" className="text-xs">
                    الأحداث
                    {unreadCount > 0 && (
                      <Badge variant="destructive" className="ml-1 text-xs">
                        {unreadCount}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="stats" className="text-xs">إحصائيات</TabsTrigger>
                  <TabsTrigger value="settings" className="text-xs">إعدادات</TabsTrigger>
                </TabsList>

                <TabsContent value="events" className="flex-1 m-0 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm font-medium">
                      آخر الأحداث ({events.length})
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {unreadCount > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleMarkAllRead}
                          className="text-xs h-6"
                        >
                          تحديد الكل كمقروء
                        </Button>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearEvents}
                        className="text-xs h-6"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  <ScrollArea ref={eventsRef} className="h-80">
                    <div className="space-y-2">
                      <AnimatePresence>
                        {events.length === 0 ? (
                          <div className="text-center text-gray-500 text-sm py-8">
                            لا توجد أحداث حالياً
                          </div>
                        ) : (
                          events.map((event) => (
                            <EventItem
                              key={event.id}
                              event={event}
                              onMarkRead={handleMarkRead}
                              compact
                            />
                          ))
                        )}
                      </AnimatePresence>
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="stats" className="flex-1 m-0 p-4">
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm font-medium mb-3">الإحصائيات المباشرة</div>
                      {liveStats ? (
                        <LiveStatsWidget stats={liveStats} />
                      ) : (
                        <div className="text-center text-gray-500 text-sm py-4">
                          جاري تحميل الإحصائيات...
                        </div>
                      )}
                    </div>

                    <Separator />

                    <div>
                      <div className="text-sm font-medium mb-3">جودة الاتصال</div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>زمن الاستجابة</span>
                          <span className={getConnectionQualityColor(connectionStatus.quality)}>
                            {connectionStatus.latency}ms
                          </span>
                        </div>
                        
                        <Progress 
                          value={Math.max(0, 100 - (connectionStatus.latency / 10))} 
                          className="h-2"
                        />
                        
                        <div className="text-xs text-gray-500">
                          {connectionStatus.quality === 'excellent' ? 'ممتاز' :
                           connectionStatus.quality === 'good' ? 'جيد' :
                           connectionStatus.quality === 'fair' ? 'مقبول' : 'ضعيف'}
                        </div>
                      </div>
                    </div>

                    {liveStats?.topPages && (
                      <>
                        <Separator />
                        
                        <div>
                          <div className="text-sm font-medium mb-3">الصفحات الأكثر زيارة</div>
                          <div className="space-y-2">
                            {liveStats.topPages.slice(0, 3).map((page, index) => (
                              <div key={page.url} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                  <div className="w-5 h-5 bg-blue-100 rounded flex items-center justify-center text-xs font-bold text-blue-600">
                                    {index + 1}
                                  </div>
                                  <span className="truncate">{page.title}</span>
                                </div>
                                <Badge variant="secondary" className="text-xs">
                                  {page.views}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="settings" className="flex-1 m-0 p-4">
                  <ScrollArea className="h-80">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">تفعيل التحديثات</span>
                        <Switch
                          checked={settings.enabled}
                          onCheckedChange={(checked) => updateSettings({ enabled: checked })}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm">صوت الإشعارات</span>
                        <Switch
                          checked={settings.sound}
                          onCheckedChange={(checked) => updateSettings({ sound: checked })}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm">التمرير التلقائي</span>
                        <Switch
                          checked={settings.autoScroll}
                          onCheckedChange={(checked) => updateSettings({ autoScroll: checked })}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm">إشعارات المتصفح</span>
                        <Switch
                          checked={settings.showNotifications}
                          onCheckedChange={(checked) => updateSettings({ showNotifications: checked })}
                        />
                      </div>

                      <Separator />

                      <div>
                        <span className="text-sm font-medium">الحد الأقصى للأحداث</span>
                        <Select
                          value={settings.maxEvents.toString()}
                          onValueChange={(value) => updateSettings({ maxEvents: parseInt(value) })}
                        >
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="25">25</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                            <SelectItem value="200">200</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <span className="text-sm font-medium">موضع الوجهة</span>
                        <Select
                          value={settings.position}
                          onValueChange={(value) => updateSettings({ position: value as any })}
                        >
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bottom-right">أسفل يمين</SelectItem>
                            <SelectItem value="bottom-left">أسفل يسار</SelectItem>
                            <SelectItem value="top-right">أعلى يمين</SelectItem>
                            <SelectItem value="top-left">أعلى يسار</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Separator />

                      <RealTimeFilters
                        filterTypes={settings.filterTypes}
                        onFilterChange={(types) => updateSettings({ filterTypes: types })}
                        availableTypes={availableEventTypes}
                      />
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </CardContent>
          )}
        </Card>
      </motion.div>
    </>
  );
};

export default RealTimeUpdates;
