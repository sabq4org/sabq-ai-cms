import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';
import { IntelligentNotifications } from '@/components/smart-integration/IntelligentNotifications';
import { useGlobalStore } from '@/stores/globalStore';

// Mock the global store
jest.mock('@/stores/globalStore', () => ({
  useGlobalStore: jest.fn(),
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Mock Socket.io client
const mockSocket = {
  on: jest.fn(),
  off: jest.fn(),
  emit: jest.fn(),
  connected: true,
};

jest.mock('socket.io-client', () => ({
  io: jest.fn(() => mockSocket),
}));

// Mock Audio
global.Audio = jest.fn().mockImplementation(() => ({
  play: jest.fn().mockResolvedValue(undefined),
  pause: jest.fn(),
  load: jest.fn(),
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

describe('IntelligentNotifications Component', () => {
  const mockUser = {
    id: 'user-1',
    name: 'محمد أحمد',
    email: 'mohamed@test.com',
    role: 'subscriber' as const,
  };

  const mockNotifications = [
    {
      id: 'notif-1',
      type: 'social_interaction' as const,
      title: 'تفاعل جديد',
      message: 'أحمد علي أضاف تعليق على مقال "التكنولوجيا الحديثة"',
      timestamp: '2024-08-16T10:00:00Z',
      isRead: false,
      priority: 'high' as const,
      metadata: {
        articleId: 'article-1',
        authorId: 'author-1',
        actionType: 'comment',
      },
    },
    {
      id: 'notif-2',
      type: 'content_recommendation' as const,
      title: 'توصية محتوى',
      message: 'مقال جديد قد يهمك: "مستقبل الذكاء الاصطناعي"',
      timestamp: '2024-08-16T09:30:00Z',
      isRead: false,
      priority: 'medium' as const,
      metadata: {
        articleId: 'article-2',
        category: 'technology',
        confidenceScore: 0.89,
      },
    },
    {
      id: 'notif-3',
      type: 'author_update' as const,
      title: 'كاتب تتابعه',
      message: 'د. سارة أحمد نشرت مقالاً جديداً',
      timestamp: '2024-08-16T08:15:00Z',
      isRead: true,
      priority: 'low' as const,
      metadata: {
        authorId: 'author-2',
        articleId: 'article-3',
      },
    },
  ];

  const mockSettings = {
    enabled: true,
    soundEnabled: true,
    showPreviews: true,
    quietHours: {
      enabled: true,
      start: '22:00',
      end: '08:00',
    },
    types: {
      social_interaction: true,
      content_recommendation: true,
      author_update: true,
      similar_content: false,
    },
  };

  const mockUpdateNotificationSettings = jest.fn();
  const mockMarkAsRead = jest.fn();
  const mockMarkAllAsRead = jest.fn();
  const mockTrackInteraction = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    global.fetch = jest.fn();
    
    (useGlobalStore as jest.Mock).mockReturnValue({
      user: mockUser,
      notificationSettings: mockSettings,
      updateNotificationSettings: mockUpdateNotificationSettings,
      markNotificationAsRead: mockMarkAsRead,
      markAllNotificationsAsRead: mockMarkAllAsRead,
      trackInteraction: mockTrackInteraction,
    });

    // Mock Notification API permissions
    Object.defineProperty(Notification, 'permission', {
      value: 'granted',
      writable: true,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const renderWithProviders = (component: React.ReactElement) => {
    const queryClient = createTestQueryClient();
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    );
  };

  describe('Component Rendering', () => {
    it('يعرض أيقونة الإشعارات في الهيدر', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ notifications: mockNotifications }),
      });

      renderWithProviders(<IntelligentNotifications />);

      expect(screen.getByRole('button', { name: /إشعارات/ })).toBeInTheDocument();
      expect(screen.getByTestId('notifications-icon')).toBeInTheDocument();
    });

    it('يعرض عدد الإشعارات غير المقروءة', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ notifications: mockNotifications }),
      });

      renderWithProviders(<IntelligentNotifications />);

      await waitFor(() => {
        expect(screen.getByText('2')).toBeInTheDocument(); // 2 unread notifications
      });

      const badge = screen.getByTestId('unread-count');
      expect(badge).toHaveTextContent('2');
    });

    it('يخفي شارة العدد عندما لا توجد إشعارات غير مقروءة', async () => {
      const readNotifications = mockNotifications.map(n => ({ ...n, isRead: true }));
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ notifications: readNotifications }),
      });

      renderWithProviders(<IntelligentNotifications />);

      await waitFor(() => {
        expect(screen.queryByTestId('unread-count')).not.toBeInTheDocument();
      });
    });
  });

  describe('Notifications Panel', () => {
    beforeEach(() => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ notifications: mockNotifications }),
      });
    });

    it('يفتح ويغلق قائمة الإشعارات', async () => {
      const user = userEvent.setup();
      renderWithProviders(<IntelligentNotifications />);

      const notificationsButton = screen.getByRole('button', { name: /إشعارات/ });
      
      // Panel should be closed initially
      expect(screen.queryByTestId('notifications-panel')).not.toBeInTheDocument();

      // Open panel
      await user.click(notificationsButton);
      expect(screen.getByTestId('notifications-panel')).toBeInTheDocument();

      // Close panel by clicking outside
      await user.click(document.body);
      await waitFor(() => {
        expect(screen.queryByTestId('notifications-panel')).not.toBeInTheDocument();
      });
    });

    it('يعرض جميع الإشعارات في القائمة', async () => {
      const user = userEvent.setup();
      renderWithProviders(<IntelligentNotifications />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /إشعارات/ })).toBeInTheDocument();
      });

      const notificationsButton = screen.getByRole('button', { name: /إشعارات/ });
      await user.click(notificationsButton);

      await waitFor(() => {
        expect(screen.getByText('تفاعل جديد')).toBeInTheDocument();
        expect(screen.getByText('توصية محتوى')).toBeInTheDocument();
        expect(screen.getByText('كاتب تتابعه')).toBeInTheDocument();
      });

      // Check messages
      expect(screen.getByText('أحمد علي أضاف تعليق على مقال "التكنولوجيا الحديثة"')).toBeInTheDocument();
      expect(screen.getByText('مقال جديد قد يهمك: "مستقبل الذكاء الاصطناعي"')).toBeInTheDocument();
      expect(screen.getByText('د. سارة أحمد نشرت مقالاً جديداً')).toBeInTheDocument();
    });

    it('يميز بين الإشعارات المقروءة وغير المقروءة', async () => {
      const user = userEvent.setup();
      renderWithProviders(<IntelligentNotifications />);

      const notificationsButton = screen.getByRole('button', { name: /إشعارات/ });
      await user.click(notificationsButton);

      await waitFor(() => {
        const unreadNotification = screen.getByText('تفاعل جديد').closest('div');
        const readNotification = screen.getByText('كاتب تتابعه').closest('div');

        expect(unreadNotification).toHaveClass('bg-blue-50'); // unread styling
        expect(readNotification).not.toHaveClass('bg-blue-50'); // read styling
      });
    });
  });

  describe('Notification Interactions', () => {
    beforeEach(() => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ notifications: mockNotifications }),
      });
    });

    it('يمكن النقر على الإشعار لفتح المحتوى', async () => {
      const user = userEvent.setup();
      renderWithProviders(<IntelligentNotifications />);

      const notificationsButton = screen.getByRole('button', { name: /إشعارات/ });
      await user.click(notificationsButton);

      await waitFor(() => {
        expect(screen.getByText('تفاعل جديد')).toBeInTheDocument();
      });

      const firstNotification = screen.getByText('تفاعل جديد').closest('button');
      await user.click(firstNotification!);

      expect(mockTrackInteraction).toHaveBeenCalledWith('notification_click', {
        notificationId: 'notif-1',
        type: 'social_interaction',
      });
    });

    it('يمكن تمييز إشعار واحد كمقروء', async () => {
      const user = userEvent.setup();
      renderWithProviders(<IntelligentNotifications />);

      const notificationsButton = screen.getByRole('button', { name: /إشعارات/ });
      await user.click(notificationsButton);

      await waitFor(() => {
        expect(screen.getByTestId('mark-as-read-notif-1')).toBeInTheDocument();
      });

      const markAsReadButton = screen.getByTestId('mark-as-read-notif-1');
      await user.click(markAsReadButton);

      expect(mockMarkAsRead).toHaveBeenCalledWith('notif-1');
    });

    it('يمكن تمييز جميع الإشعارات كمقروءة', async () => {
      const user = userEvent.setup();
      renderWithProviders(<IntelligentNotifications />);

      const notificationsButton = screen.getByRole('button', { name: /إشعارات/ });
      await user.click(notificationsButton);

      await waitFor(() => {
        expect(screen.getByText('تمييز الكل كمقروء')).toBeInTheDocument();
      });

      const markAllButton = screen.getByText('تمييز الكل كمقروء');
      await user.click(markAllButton);

      expect(mockMarkAllAsRead).toHaveBeenCalled();
    });

    it('يمكن فلترة الإشعارات حسب النوع', async () => {
      const user = userEvent.setup();
      renderWithProviders(<IntelligentNotifications />);

      const notificationsButton = screen.getByRole('button', { name: /إشعارات/ });
      await user.click(notificationsButton);

      await waitFor(() => {
        expect(screen.getByText('تفاعل اجتماعي')).toBeInTheDocument();
      });

      // Filter by social interactions
      const socialFilter = screen.getByText('تفاعل اجتماعي');
      await user.click(socialFilter);

      // Should show only social interaction notifications
      expect(screen.getByText('تفاعل جديد')).toBeInTheDocument();
      expect(screen.queryByText('توصية محتوى')).not.toBeInTheDocument();
    });
  });

  describe('Real-time Updates', () => {
    it('يستقبل إشعارات جديدة عبر WebSocket', async () => {
      renderWithProviders(<IntelligentNotifications />);

      // Simulate receiving a new notification via socket
      const socketCallback = mockSocket.on.mock.calls.find(
        call => call[0] === 'new_notification'
      )?.[1];

      const newNotification = {
        id: 'notif-4',
        type: 'similar_content',
        title: 'محتوى مشابه',
        message: 'وجدنا مقالات قد تهمك بناءً على قراءاتك الأخيرة',
        timestamp: new Date().toISOString(),
        isRead: false,
        priority: 'medium',
      };

      if (socketCallback) {
        socketCallback(newNotification);
      }

      // Should update the notification count
      await waitFor(() => {
        expect(screen.getByText('3')).toBeInTheDocument(); // Updated count
      });
    });

    it('يشغل صوت للإشعارات الجديدة', async () => {
      const mockPlay = jest.fn().mockResolvedValue(undefined);
      (global.Audio as jest.Mock).mockReturnValue({ play: mockPlay });

      renderWithProviders(<IntelligentNotifications />);

      const socketCallback = mockSocket.on.mock.calls.find(
        call => call[0] === 'new_notification'
      )?.[1];

      if (socketCallback) {
        socketCallback({
          id: 'notif-4',
          type: 'content_recommendation',
          priority: 'high',
        });
      }

      await waitFor(() => {
        expect(mockPlay).toHaveBeenCalled();
      });
    });
  });

  describe('Settings Panel', () => {
    it('يفتح إعدادات الإشعارات', async () => {
      const user = userEvent.setup();
      renderWithProviders(<IntelligentNotifications />);

      const notificationsButton = screen.getByRole('button', { name: /إشعارات/ });
      await user.click(notificationsButton);

      await waitFor(() => {
        expect(screen.getByTestId('notification-settings')).toBeInTheDocument();
      });

      const settingsButton = screen.getByTestId('notification-settings');
      await user.click(settingsButton);

      expect(screen.getByText('إعدادات الإشعارات')).toBeInTheDocument();
    });

    it('يمكن تغيير إعدادات الإشعارات', async () => {
      const user = userEvent.setup();
      renderWithProviders(<IntelligentNotifications />);

      const notificationsButton = screen.getByRole('button', { name: /إشعارات/ });
      await user.click(notificationsButton);

      const settingsButton = screen.getByTestId('notification-settings');
      await user.click(settingsButton);

      // Toggle sound setting
      const soundToggle = screen.getByRole('switch', { name: /تشغيل الصوت/ });
      await user.click(soundToggle);

      expect(mockUpdateNotificationSettings).toHaveBeenCalledWith({
        ...mockSettings,
        soundEnabled: false,
      });
    });

    it('يمكن تعديل ساعات الهدوء', async () => {
      const user = userEvent.setup();
      renderWithProviders(<IntelligentNotifications />);

      const notificationsButton = screen.getByRole('button', { name: /إشعارات/ });
      await user.click(notificationsButton);

      const settingsButton = screen.getByTestId('notification-settings');
      await user.click(settingsButton);

      // Change quiet hours start time
      const startTimeInput = screen.getByLabelText('من');
      await user.clear(startTimeInput);
      await user.type(startTimeInput, '23:00');

      expect(mockUpdateNotificationSettings).toHaveBeenCalledWith({
        ...mockSettings,
        quietHours: {
          ...mockSettings.quietHours,
          start: '23:00',
        },
      });
    });
  });

  describe('Browser Notifications', () => {
    it('يطلب إذن الإشعارات عند التفعيل', async () => {
      const requestPermission = jest.fn().mockResolvedValue('granted');
      Object.defineProperty(Notification, 'requestPermission', {
        value: requestPermission,
      });

      const user = userEvent.setup();
      renderWithProviders(<IntelligentNotifications />);

      const notificationsButton = screen.getByRole('button', { name: /إشعارات/ });
      await user.click(notificationsButton);

      const settingsButton = screen.getByTestId('notification-settings');
      await user.click(settingsButton);

      const enableButton = screen.getByText('تفعيل إشعارات المتصفح');
      await user.click(enableButton);

      expect(requestPermission).toHaveBeenCalled();
    });

    it('يعرض إشعار المتصفح للإشعارات عالية الأولوية', async () => {
      const NotificationConstructor = jest.fn();
      global.Notification = NotificationConstructor as any;

      renderWithProviders(<IntelligentNotifications />);

      const socketCallback = mockSocket.on.mock.calls.find(
        call => call[0] === 'new_notification'
      )?.[1];

      const highPriorityNotification = {
        id: 'notif-urgent',
        type: 'social_interaction',
        title: 'تفاعل عاجل',
        message: 'رد مهم على تعليقك',
        priority: 'high',
        timestamp: new Date().toISOString(),
        isRead: false,
      };

      if (socketCallback) {
        socketCallback(highPriorityNotification);
      }

      await waitFor(() => {
        expect(NotificationConstructor).toHaveBeenCalledWith(
          'تفاعل عاجل',
          expect.objectContaining({
            body: 'رد مهم على تعليقك',
            icon: expect.any(String),
          })
        );
      });
    });
  });

  describe('Empty State', () => {
    it('يعرض رسالة عندما لا توجد إشعارات', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ notifications: [] }),
      });

      const user = userEvent.setup();
      renderWithProviders(<IntelligentNotifications />);

      const notificationsButton = screen.getByRole('button', { name: /إشعارات/ });
      await user.click(notificationsButton);

      await waitFor(() => {
        expect(screen.getByText('لا توجد إشعارات')).toBeInTheDocument();
        expect(screen.getByText('ستظهر إشعاراتك هنا عند توفرها')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('يتعامل مع فشل تحميل الإشعارات', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const user = userEvent.setup();
      renderWithProviders(<IntelligentNotifications />);

      const notificationsButton = screen.getByRole('button', { name: /إشعارات/ });
      await user.click(notificationsButton);

      await waitFor(() => {
        expect(screen.getByText('خطأ في تحميل الإشعارات')).toBeInTheDocument();
        expect(screen.getByText('المحاولة مرة أخرى')).toBeInTheDocument();
      });
    });

    it('يتعامل مع انقطاع اتصال WebSocket', async () => {
      renderWithProviders(<IntelligentNotifications />);

      // Simulate socket disconnection
      const disconnectCallback = mockSocket.on.mock.calls.find(
        call => call[0] === 'disconnect'
      )?.[1];

      if (disconnectCallback) {
        disconnectCallback();
      }

      await waitFor(() => {
        expect(screen.getByTestId('connection-status')).toHaveClass('offline');
      });
    });
  });

  describe('Performance', () => {
    it('يحدد عدد الإشعارات المعروضة للأداء', async () => {
      const manyNotifications = Array.from({ length: 100 }, (_, i) => ({
        ...mockNotifications[0],
        id: `notif-${i}`,
        title: `إشعار ${i}`,
      }));

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ notifications: manyNotifications }),
      });

      const user = userEvent.setup();
      renderWithProviders(<IntelligentNotifications />);

      const notificationsButton = screen.getByRole('button', { name: /إشعارات/ });
      await user.click(notificationsButton);

      await waitFor(() => {
        // Should only render first 50 notifications
        const renderedNotifications = screen.getAllByTestId(/notification-item/);
        expect(renderedNotifications).toHaveLength(50);
      });

      // Should show "load more" button
      expect(screen.getByText('تحميل المزيد')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('يدعم التنقل بلوحة المفاتيح', async () => {
      const user = userEvent.setup();
      renderWithProviders(<IntelligentNotifications />);

      const notificationsButton = screen.getByRole('button', { name: /إشعارات/ });
      
      // Tab to notifications button
      await user.tab();
      expect(notificationsButton).toHaveFocus();

      // Open with Enter
      await user.keyboard('{Enter}');
      expect(screen.getByTestId('notifications-panel')).toBeInTheDocument();

      // Tab through notifications
      await user.tab();
      expect(screen.getByText('تمييز الكل كمقروء')).toHaveFocus();
    });

    it('يحتوي على تسميات ARIA مناسبة', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ notifications: mockNotifications }),
      });

      renderWithProviders(<IntelligentNotifications />);

      const notificationsButton = screen.getByRole('button', { name: /إشعارات/ });
      expect(notificationsButton).toHaveAttribute('aria-label', 'إشعارات، 2 غير مقروء');
    });

    it('يعلن عن الإشعارات الجديدة للقارئات الصوتية', async () => {
      renderWithProviders(<IntelligentNotifications />);

      // Check aria-live region exists
      expect(screen.getByTestId('notifications-announcer')).toHaveAttribute('aria-live', 'polite');
    });
  });
});
