'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  IconButton,
  Badge,
  Popover,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Divider,
  Button,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  NotificationsActive,
  NotificationsNone,
  FiberManualRecord,
  CheckCircle,
  Article,
  Person,
  TrendingUp,
  Announcement,
  ThumbUp
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { useBehaviorTracking } from '../../hooks/useBehaviorTracking';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  icon?: React.ReactNode;
  timestamp: Date;
  read: boolean;
  contentId?: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

const notificationIcons: Record<string, React.ReactNode> = {
  SOCIAL_INTERACTION: <ThumbUp />,
  CONTENT_RECOMMENDATION: <Article />,
  AUTHOR_UPDATE: <Person />,
  SIMILAR_CONTENT: <TrendingUp />,
  BREAKING_NEWS: <Announcement />,
  SYSTEM_ANNOUNCEMENT: <NotificationsIcon />
};

export default function RealTimeNotifications() {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const router = useRouter();
  const { trackCustomEvent } = useBehaviorTracking();

  // الاتصال بـ WebSocket
  useEffect(() => {
    connectToNotificationService();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const connectToNotificationService = () => {
    // في تطبيق حقيقي، استخدم عنوان WebSocket الفعلي
    const socket = io(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001', {
      transports: ['websocket'],
      auth: {
        token: localStorage.getItem('authToken')
      }
    });

    socket.on('connect', () => {
      console.log('متصل بخدمة الإشعارات');
      setConnected(true);
      loadInitialNotifications();
    });

    socket.on('disconnect', () => {
      console.log('انقطع الاتصال بخدمة الإشعارات');
      setConnected(false);
    });

    socket.on('notification', (notification: any) => {
      handleNewNotification(notification);
    });

    socketRef.current = socket;
  };

  const loadInitialNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/notifications/user/current-user?limit=20&status=unread');
      const data = await response.json();
      
      if (data.success) {
        const formattedNotifications = data.data.notifications.map(formatNotification);
        setNotifications(formattedNotifications);
        updateUnreadCount(formattedNotifications);
      }
    } catch (error) {
      console.error('خطأ في جلب الإشعارات:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNotification = (rawNotification: any): Notification => {
    return {
      id: rawNotification.id,
      type: rawNotification.type,
      title: rawNotification.title,
      message: rawNotification.message,
      icon: notificationIcons[rawNotification.type] || <NotificationsIcon />,
      timestamp: new Date(rawNotification.createdAt),
      read: rawNotification.status === 'READ',
      contentId: rawNotification.contentId,
      actionUrl: rawNotification.metadata?.actionUrl,
      metadata: rawNotification.metadata
    };
  };

  const handleNewNotification = (notification: any) => {
    const formatted = formatNotification(notification);
    
    setNotifications(prev => [formatted, ...prev]);
    updateUnreadCount([formatted, ...notifications]);
    
    // عرض إشعار المتصفح
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(formatted.title, {
        body: formatted.message,
        icon: '/icon-192x192.png',
        badge: '/icon-96x96.png',
        tag: formatted.id,
        renotify: true
      });
    }

    // تشغيل صوت
    playNotificationSound();
    
    // تتبع استلام الإشعار
    trackCustomEvent('notification_received', {
      notificationId: formatted.id,
      type: formatted.type
    });
  };

  const updateUnreadCount = (notificationsList: Notification[]) => {
    const count = notificationsList.filter(n => !n.read).length;
    setUnreadCount(count);
  };

  const playNotificationSound = () => {
    const audio = new Audio('/sounds/notification.mp3');
    audio.play().catch(e => console.log('لا يمكن تشغيل الصوت:', e));
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    trackCustomEvent('notification_bell_clicked');
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = async (notification: Notification) => {
    // وضع علامة مقروءة
    await markAsRead(notification.id);
    
    // تتبع النقرة
    trackCustomEvent('notification_clicked', {
      notificationId: notification.id,
      type: notification.type
    });
    
    // التنقل إلى الرابط المستهدف
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    } else if (notification.contentId) {
      router.push(`/article/${notification.contentId}`);
    }
    
    handleClose();
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'READ', readAt: new Date() })
      });
      
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      updateUnreadCount(notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
    } catch (error) {
      console.error('خطأ في تحديث حالة الإشعار:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications/mark-all-read', {
        method: 'POST'
      });
      
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      
      trackCustomEvent('all_notifications_marked_read');
    } catch (error) {
      console.error('خطأ في تحديث الإشعارات:', error);
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        trackCustomEvent('notification_permission_granted');
      }
    }
  };

  // طلب إذن الإشعارات عند التحميل
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  const open = Boolean(anchorEl);
  const id = open ? 'notifications-popover' : undefined;

  return (
    <>
      <IconButton
        aria-describedby={id}
        onClick={handleClick}
        color="inherit"
        sx={{ position: 'relative' }}
      >
        <Badge 
          badgeContent={unreadCount} 
          color="error"
          invisible={unreadCount === 0}
          max={99}
        >
          {unreadCount > 0 ? <NotificationsActive /> : <NotificationsNone />}
        </Badge>
        {connected && (
          <FiberManualRecord 
            sx={{ 
              position: 'absolute', 
              bottom: 0, 
              right: 0, 
              fontSize: 12,
              color: 'success.main'
            }} 
          />
        )}
      </IconButton>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            width: 400,
            maxHeight: 600
          }
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">الإشعارات</Typography>
          {unreadCount > 0 && (
            <Button size="small" onClick={markAllAsRead}>
              تحديد الكل كمقروء
            </Button>
          )}
        </Box>
        
        <Divider />
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <NotificationsNone sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography color="text.secondary">
              لا توجد إشعارات جديدة
            </Typography>
          </Box>
        ) : (
          <List sx={{ maxHeight: 500, overflow: 'auto' }}>
            {notifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                <ListItem
                  button
                  onClick={() => handleNotificationClick(notification)}
                  sx={{
                    backgroundColor: notification.read ? 'transparent' : 'action.hover',
                    '&:hover': {
                      backgroundColor: 'action.selected'
                    }
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: notification.read ? 'grey.300' : 'primary.main' }}>
                      {notification.icon}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle2" noWrap>
                          {notification.title}
                        </Typography>
                        {!notification.read && (
                          <FiberManualRecord sx={{ fontSize: 8, color: 'primary.main' }} />
                        )}
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}
                        >
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDistanceToNow(notification.timestamp, { 
                            addSuffix: true,
                            locale: ar 
                          })}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                {index < notifications.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))}
          </List>
        )}
        
        <Divider />
        
        <Box sx={{ p: 1, textAlign: 'center' }}>
          <Button 
            fullWidth 
            size="small"
            onClick={() => {
              router.push('/notifications');
              handleClose();
            }}
          >
            عرض جميع الإشعارات
          </Button>
        </Box>
      </Popover>
    </>
  );
}
