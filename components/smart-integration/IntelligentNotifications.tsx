'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  BellRing,
  Heart,
  MessageCircle,
  Share2,
  BookOpen,
  User,
  TrendingUp,
  Clock,
  CheckCheck,
  X,
  Settings,
  Filter,
  Archive,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useGlobalStore, useNotifications, Notification } from '@/stores/globalStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

// ===========================================
// Types
// ===========================================

interface NotificationSettings {
  sound: boolean;
  desktop: boolean;
  email: boolean;
  types: {
    social_interaction: boolean;
    content_recommendation: boolean;
    author_update: boolean;
    similar_content: boolean;
  };
}

// ===========================================
// Utility Functions
// ===========================================

const getNotificationIcon = (type: Notification['type']) => {
  const iconProps = { className: "w-4 h-4" };
  
  switch (type) {
    case 'social_interaction':
      return <Heart {...iconProps} className="text-red-500" />;
    case 'content_recommendation':
      return <TrendingUp {...iconProps} className="text-blue-500" />;
    case 'author_update':
      return <User {...iconProps} className="text-green-500" />;
    case 'similar_content':
      return <BookOpen {...iconProps} className="text-purple-500" />;
    default:
      return <Bell {...iconProps} className="text-gray-500" />;
  }
};

const getNotificationColor = (type: Notification['type']) => {
  switch (type) {
    case 'social_interaction':
      return 'border-l-red-500 bg-red-50 dark:bg-red-950/20';
    case 'content_recommendation':
      return 'border-l-blue-500 bg-blue-50 dark:bg-blue-950/20';
    case 'author_update':
      return 'border-l-green-500 bg-green-50 dark:bg-green-950/20';
    case 'similar_content':
      return 'border-l-purple-500 bg-purple-50 dark:bg-purple-950/20';
    default:
      return 'border-l-gray-500 bg-gray-50 dark:bg-gray-950/20';
  }
};

const getTypeLabel = (type: Notification['type']) => {
  switch (type) {
    case 'social_interaction':
      return 'تفاعل اجتماعي';
    case 'content_recommendation':
      return 'توصية محتوى';
    case 'author_update':
      return 'تحديث كاتب';
    case 'similar_content':
      return 'محتوى مشابه';
    default:
      return 'إشعار';
  }
};

const playNotificationSound = () => {
  if (typeof window !== 'undefined' && 'Audio' in window) {
    try {
      const audio = new Audio('/sounds/notification.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {
        // Ignore if sound fails to play
      });
    } catch (error) {
      // Ignore audio errors
    }
  }
};

const requestNotificationPermission = async () => {
  if ('Notification' in window && Notification.permission === 'default') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return Notification.permission === 'granted';
};

const showDesktopNotification = (notification: Notification) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    const desktopNotification = new Notification(notification.title, {
      body: notification.message,
      icon: '/icon-192x192.png',
      tag: notification.id,
      requireInteraction: false,
    });

    setTimeout(() => {
      desktopNotification.close();
    }, 5000);
  }
};

// ===========================================
// Components
// ===========================================

const NotificationItem = ({ 
  notification, 
  onRead, 
  onRemove 
}: { 
  notification: Notification;
  onRead: (id: string) => void;
  onRemove: (id: string) => void;
}) => {
  const { trackInteraction } = useGlobalStore();
  
  const handleClick = () => {
    if (!notification.read) {
      onRead(notification.id);
    }
    
    trackInteraction('notification_click', {
      notificationId: notification.id,
      type: notification.type
    });

    // Handle navigation based on notification data
    if (notification.data?.url) {
      window.location.href = notification.data.url;
    }
  };

  const timeAgo = formatDistanceToNow(notification.timestamp, {
    addSuffix: true,
    locale: ar
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10, height: 0 }}
      transition={{ duration: 0.2 }}
      className={`relative border-l-4 ${getNotificationColor(notification.type)} p-3 rounded-lg cursor-pointer group transition-all duration-200 hover:shadow-md ${
        !notification.read ? 'ring-1 ring-blue-200 dark:ring-blue-800' : ''
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">
          {getNotificationIcon(notification.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className={`text-sm font-medium ${
              !notification.read ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'
            } line-clamp-2`}>
              {notification.title}
            </h4>
            
            <div className="flex items-center gap-1 flex-shrink-0">
              {!notification.read && (
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(notification.id);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-6 w-6 p-0 text-gray-400 hover:text-red-500"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
          
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
            {notification.message}
          </p>
          
          <div className="flex items-center justify-between mt-2">
            <Badge variant="outline" className="text-xs">
              {getTypeLabel(notification.type)}
            </Badge>
            
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <Clock className="w-3 h-3" />
              <span>{timeAgo}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const NotificationSettings = ({ 
  settings, 
  onSettingsChange 
}: { 
  settings: NotificationSettings;
  onSettingsChange: (settings: NotificationSettings) => void;
}) => {
  const updateSettings = (path: string, value: boolean) => {
    const newSettings = { ...settings };
    if (path.includes('.')) {
      const [parent, child] = path.split('.');
      (newSettings as any)[parent][child] = value;
    } else {
      (newSettings as any)[path] = value;
    }
    onSettingsChange(newSettings);
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-sm">إعدادات الإشعارات</h3>
      
      {/* General Settings */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-gray-500" />
            <span className="text-sm">الصوت</span>
          </div>
          <Switch
            checked={settings.sound}
            onCheckedChange={(checked) => updateSettings('sound', checked)}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-gray-500" />
            <span className="text-sm">إشعارات سطح المكتب</span>
          </div>
          <Switch
            checked={settings.desktop}
            onCheckedChange={(checked) => updateSettings('desktop', checked)}
          />
        </div>
      </div>
      
      <Separator />
      
      {/* Notification Types */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">أنواع الإشعارات</h4>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-red-500" />
            <span className="text-sm">التفاعل الاجتماعي</span>
          </div>
          <Switch
            checked={settings.types.social_interaction}
            onCheckedChange={(checked) => updateSettings('types.social_interaction', checked)}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            <span className="text-sm">توصيات المحتوى</span>
          </div>
          <Switch
            checked={settings.types.content_recommendation}
            onCheckedChange={(checked) => updateSettings('types.content_recommendation', checked)}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-green-500" />
            <span className="text-sm">تحديثات الكُتاب</span>
          </div>
          <Switch
            checked={settings.types.author_update}
            onCheckedChange={(checked) => updateSettings('types.author_update', checked)}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-purple-500" />
            <span className="text-sm">المحتوى المشابه</span>
          </div>
          <Switch
            checked={settings.types.similar_content}
            onCheckedChange={(checked) => updateSettings('types.similar_content', checked)}
          />
        </div>
      </div>
    </div>
  );
};

// ===========================================
// Main Component
// ===========================================

export const IntelligentNotifications: React.FC = () => {
  const { user, trackInteraction } = useGlobalStore();
  const {
    notifications,
    unreadCount,
    markNotificationRead,
    markAllNotificationsRead,
    removeNotification,
    clearNotifications,
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | Notification['type']>('all');
  const [settings, setSettings] = useState<NotificationSettings>({
    sound: true,
    desktop: true,
    email: true,
    types: {
      social_interaction: true,
      content_recommendation: true,
      author_update: true,
      similar_content: true,
    },
  });

  const prevUnreadCount = useRef(unreadCount);

  // Handle new notifications
  useEffect(() => {
    if (unreadCount > prevUnreadCount.current && unreadCount > 0) {
      if (settings.sound) {
        playNotificationSound();
      }
      
      const latestNotification = notifications.find(n => !n.read);
      if (latestNotification && settings.desktop) {
        showDesktopNotification(latestNotification);
      }
    }
    prevUnreadCount.current = unreadCount;
  }, [unreadCount, notifications, settings.sound, settings.desktop]);

  // Request desktop notification permission
  useEffect(() => {
    if (settings.desktop) {
      requestNotificationPermission();
    }
  }, [settings.desktop]);

  // Filter notifications
  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => n.type === filter);

  // Group notifications by read status
  const unreadNotifications = filteredNotifications.filter(n => !n.read);
  const readNotifications = filteredNotifications.filter(n => n.read);

  const handleMarkAllAsRead = () => {
    markAllNotificationsRead();
    trackInteraction('mark_all_notifications_read');
  };

  const handleClearAll = () => {
    clearNotifications();
    trackInteraction('clear_all_notifications');
  };

  const filterOptions = [
    { key: 'all', label: 'الكل', icon: Bell },
    { key: 'social_interaction', label: 'تفاعل', icon: Heart },
    { key: 'content_recommendation', label: 'توصيات', icon: TrendingUp },
    { key: 'author_update', label: 'كُتاب', icon: User },
    { key: 'similar_content', label: 'مشابه', icon: BookOpen },
  ] as const;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative h-10 w-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          onClick={() => {
            setIsOpen(!isOpen);
            trackInteraction('open_notifications');
          }}
        >
          <motion.div
            animate={unreadCount > 0 ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.3, repeat: unreadCount > 0 ? Infinity : 0, repeatDelay: 2 }}
          >
            {unreadCount > 0 ? (
              <BellRing className="w-5 h-5" />
            ) : (
              <Bell className="w-5 h-5" />
            )}
          </motion.div>
          
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 flex items-center justify-center"
              >
                <span className="text-xs font-bold text-white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-80 p-0 shadow-lg border-0 bg-white dark:bg-gray-900"
        align="end"
        sideOffset={8}
      >
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="w-5 h-5" />
                الإشعارات
                {unreadCount > 0 && (
                  <Badge variant="destructive">{unreadCount}</Badge>
                )}
              </CardTitle>
              
              <div className="flex items-center gap-1">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80" align="end">
                    <NotificationSettings
                      settings={settings}
                      onSettingsChange={setSettings}
                    />
                  </PopoverContent>
                </Popover>
                
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                    className="h-8 w-8 p-0"
                    title="تحديد الكل كمقروء"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
            
            {/* Filter tabs */}
            <Tabs value={filter} onValueChange={(value) => setFilter(value as any)} className="w-full">
              <TabsList className="grid w-full grid-cols-5 h-8">
                {filterOptions.map(({ key, label, icon: Icon }) => (
                  <TabsTrigger
                    key={key}
                    value={key}
                    className="text-xs p-1 flex items-center gap-1"
                  >
                    <Icon className="w-3 h-3" />
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </CardHeader>
          
          <CardContent className="p-0">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-8 px-4">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">لا توجد إشعارات</p>
              </div>
            ) : (
              <ScrollArea className="h-96">
                <div className="p-4 space-y-3">
                  {/* Unread notifications */}
                  {unreadNotifications.length > 0 && (
                    <>
                      <div className="flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        جديد
                      </div>
                      {unreadNotifications.map((notification) => (
                        <NotificationItem
                          key={notification.id}
                          notification={notification}
                          onRead={markNotificationRead}
                          onRemove={removeNotification}
                        />
                      ))}
                    </>
                  )}
                  
                  {/* Read notifications */}
                  {readNotifications.length > 0 && (
                    <>
                      {unreadNotifications.length > 0 && (
                        <Separator className="my-3" />
                      )}
                      <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                        مقروء
                      </div>
                      {readNotifications.map((notification) => (
                        <NotificationItem
                          key={notification.id}
                          notification={notification}
                          onRead={markNotificationRead}
                          onRemove={removeNotification}
                        />
                      ))}
                    </>
                  )}
                </div>
              </ScrollArea>
            )}
            
            {/* Footer */}
            {filteredNotifications.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-700 p-3">
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearAll}
                    className="text-xs text-gray-500 hover:text-red-600"
                  >
                    <Archive className="w-3 h-3 mr-1" />
                    مسح الكل
                  </Button>
                  
                  <Link href="/notifications">
                    <Button variant="ghost" size="sm" className="text-xs">
                      عرض الكل
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};

export default IntelligentNotifications;
