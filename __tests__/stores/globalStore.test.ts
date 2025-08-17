import { renderHook, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useGlobalStore } from '@/stores/globalStore';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock fetch for API calls
global.fetch = jest.fn();

describe('GlobalStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    
    // Reset store to initial state
    useGlobalStore.setState({
      user: null,
      isAuthenticated: false,
      theme: 'light',
      language: 'ar',
      isRTL: true,
      notifications: {
        enabled: true,
        soundEnabled: true,
        showPreviews: true,
        quietHours: {
          enabled: false,
          start: '22:00',
          end: '08:00',
        },
        types: {
          social_interaction: true,
          content_recommendation: true,
          author_update: true,
          similar_content: true,
        },
      },
      realTime: {
        isConnected: false,
        reconnectAttempts: 0,
        lastHeartbeat: null,
      },
      ui: {
        sidebarCollapsed: false,
        loading: false,
        errors: [],
      },
    });
  });

  describe('User Authentication', () => {
    it('should initialize with no authenticated user', () => {
      const { result } = renderHook(() => useGlobalStore());
      
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should set user and authentication state correctly', () => {
      const { result } = renderHook(() => useGlobalStore());
      
      const mockUser = {
        id: 'user-1',
        name: 'محمد أحمد',
        email: 'mohamed@test.com',
        role: 'subscriber' as const,
        avatar: '/avatars/user1.jpg',
        preferences: {
          theme: 'dark',
          language: 'ar',
          notifications: true,
        },
      };

      act(() => {
        result.current.setUser(mockUser);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should clear user data on logout', () => {
      const { result } = renderHook(() => useGlobalStore());
      
      // First set a user
      const mockUser = {
        id: 'user-1',
        name: 'محمد أحمد',
        email: 'mohamed@test.com',
        role: 'subscriber' as const,
      };

      act(() => {
        result.current.setUser(mockUser);
      });

      expect(result.current.isAuthenticated).toBe(true);

      // Then logout
      act(() => {
        result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should update user preferences', () => {
      const { result } = renderHook(() => useGlobalStore());
      
      const mockUser = {
        id: 'user-1',
        name: 'محمد أحمد',
        email: 'mohamed@test.com',
        role: 'subscriber' as const,
        preferences: {
          theme: 'light',
          language: 'ar',
          notifications: true,
        },
      };

      act(() => {
        result.current.setUser(mockUser);
      });

      const newPreferences = {
        theme: 'dark',
        language: 'en',
        notifications: false,
      };

      act(() => {
        result.current.updateUserPreferences(newPreferences);
      });

      expect(result.current.user?.preferences).toEqual(newPreferences);
    });
  });

  describe('Theme Management', () => {
    it('should toggle theme between light and dark', () => {
      const { result } = renderHook(() => useGlobalStore());
      
      expect(result.current.theme).toBe('light');

      act(() => {
        result.current.toggleTheme();
      });

      expect(result.current.theme).toBe('dark');

      act(() => {
        result.current.toggleTheme();
      });

      expect(result.current.theme).toBe('light');
    });

    it('should set specific theme', () => {
      const { result } = renderHook(() => useGlobalStore());
      
      act(() => {
        result.current.setTheme('dark');
      });

      expect(result.current.theme).toBe('dark');
    });

    it('should persist theme to localStorage', () => {
      const { result } = renderHook(() => useGlobalStore());
      
      act(() => {
        result.current.setTheme('dark');
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');
    });

    it('should load theme from localStorage on init', () => {
      localStorageMock.getItem.mockReturnValue('dark');
      
      const { result } = renderHook(() => useGlobalStore());
      
      act(() => {
        result.current.loadThemeFromStorage();
      });

      expect(result.current.theme).toBe('dark');
    });
  });

  describe('Language and RTL Support', () => {
    it('should set language and update RTL accordingly', () => {
      const { result } = renderHook(() => useGlobalStore());
      
      expect(result.current.language).toBe('ar');
      expect(result.current.isRTL).toBe(true);

      act(() => {
        result.current.setLanguage('en');
      });

      expect(result.current.language).toBe('en');
      expect(result.current.isRTL).toBe(false);

      act(() => {
        result.current.setLanguage('ar');
      });

      expect(result.current.language).toBe('ar');
      expect(result.current.isRTL).toBe(true);
    });

    it('should persist language to localStorage', () => {
      const { result } = renderHook(() => useGlobalStore());
      
      act(() => {
        result.current.setLanguage('en');
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith('language', 'en');
    });
  });

  describe('Notification Settings', () => {
    it('should update notification settings', () => {
      const { result } = renderHook(() => useGlobalStore());
      
      const newSettings = {
        enabled: false,
        soundEnabled: false,
        showPreviews: false,
        quietHours: {
          enabled: true,
          start: '23:00',
          end: '07:00',
        },
        types: {
          social_interaction: false,
          content_recommendation: true,
          author_update: true,
          similar_content: false,
        },
      };

      act(() => {
        result.current.updateNotificationSettings(newSettings);
      });

      expect(result.current.notifications).toEqual(newSettings);
    });

    it('should persist notification settings to localStorage', () => {
      const { result } = renderHook(() => useGlobalStore());
      
      const newSettings = {
        enabled: false,
        soundEnabled: false,
        showPreviews: false,
        quietHours: {
          enabled: true,
          start: '23:00',
          end: '07:00',
        },
        types: {
          social_interaction: false,
          content_recommendation: true,
          author_update: true,
          similar_content: false,
        },
      };

      act(() => {
        result.current.updateNotificationSettings(newSettings);
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'notificationSettings',
        JSON.stringify(newSettings)
      );
    });

    it('should mark notification as read', () => {
      const { result } = renderHook(() => useGlobalStore());
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      act(() => {
        result.current.markNotificationAsRead('notif-1');
      });

      expect(global.fetch).toHaveBeenCalledWith('/api/notifications/notif-1/read', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });
    });

    it('should mark all notifications as read', () => {
      const { result } = renderHook(() => useGlobalStore());
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      act(() => {
        result.current.markAllNotificationsAsRead();
      });

      expect(global.fetch).toHaveBeenCalledWith('/api/notifications/read-all', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });
    });
  });

  describe('Real-time Connection', () => {
    it('should update connection status', () => {
      const { result } = renderHook(() => useGlobalStore());
      
      expect(result.current.realTime.isConnected).toBe(false);

      act(() => {
        result.current.setConnectionStatus(true);
      });

      expect(result.current.realTime.isConnected).toBe(true);
      expect(result.current.realTime.reconnectAttempts).toBe(0);
    });

    it('should increment reconnect attempts on disconnect', () => {
      const { result } = renderHook(() => useGlobalStore());
      
      // Set connected first
      act(() => {
        result.current.setConnectionStatus(true);
      });

      // Then disconnect
      act(() => {
        result.current.setConnectionStatus(false);
      });

      expect(result.current.realTime.isConnected).toBe(false);
      expect(result.current.realTime.reconnectAttempts).toBe(1);
    });

    it('should update heartbeat timestamp', () => {
      const { result } = renderHook(() => useGlobalStore());
      
      const timestamp = new Date().toISOString();

      act(() => {
        result.current.updateHeartbeat(timestamp);
      });

      expect(result.current.realTime.lastHeartbeat).toBe(timestamp);
    });
  });

  describe('UI State Management', () => {
    it('should toggle sidebar collapse state', () => {
      const { result } = renderHook(() => useGlobalStore());
      
      expect(result.current.ui.sidebarCollapsed).toBe(false);

      act(() => {
        result.current.toggleSidebar();
      });

      expect(result.current.ui.sidebarCollapsed).toBe(true);

      act(() => {
        result.current.toggleSidebar();
      });

      expect(result.current.ui.sidebarCollapsed).toBe(false);
    });

    it('should set loading state', () => {
      const { result } = renderHook(() => useGlobalStore());
      
      expect(result.current.ui.loading).toBe(false);

      act(() => {
        result.current.setLoading(true);
      });

      expect(result.current.ui.loading).toBe(true);
    });

    it('should add and clear errors', () => {
      const { result } = renderHook(() => useGlobalStore());
      
      const error = {
        id: 'error-1',
        message: 'Test error message',
        type: 'error' as const,
        timestamp: new Date().toISOString(),
      };

      act(() => {
        result.current.addError(error);
      });

      expect(result.current.ui.errors).toContain(error);

      act(() => {
        result.current.clearError('error-1');
      });

      expect(result.current.ui.errors).not.toContain(error);
    });

    it('should clear all errors', () => {
      const { result } = renderHook(() => useGlobalStore());
      
      const errors = [
        {
          id: 'error-1',
          message: 'Error 1',
          type: 'error' as const,
          timestamp: new Date().toISOString(),
        },
        {
          id: 'error-2',
          message: 'Error 2',
          type: 'warning' as const,
          timestamp: new Date().toISOString(),
        },
      ];

      act(() => {
        errors.forEach(error => result.current.addError(error));
      });

      expect(result.current.ui.errors).toHaveLength(2);

      act(() => {
        result.current.clearAllErrors();
      });

      expect(result.current.ui.errors).toHaveLength(0);
    });
  });

  describe('Interaction Tracking', () => {
    it('should track user interactions', () => {
      const { result } = renderHook(() => useGlobalStore());
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const eventData = {
        articleId: 'article-1',
        type: 'like',
      };

      act(() => {
        result.current.trackInteraction('article_like', eventData);
      });

      expect(global.fetch).toHaveBeenCalledWith('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'article_like',
          data: eventData,
          timestamp: expect.any(String),
        }),
      });
    });

    it('should handle tracking errors gracefully', async () => {
      const { result } = renderHook(() => useGlobalStore());
      
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const eventData = {
        articleId: 'article-1',
        type: 'like',
      };

      await act(async () => {
        await result.current.trackInteraction('article_like', eventData);
      });

      // Should not throw error
      expect(result.current.ui.errors).toHaveLength(0);
    });
  });

  describe('Persistence', () => {
    it('should save state to localStorage on important changes', () => {
      const { result } = renderHook(() => useGlobalStore());
      
      act(() => {
        result.current.setTheme('dark');
        result.current.setLanguage('en');
        result.current.toggleSidebar();
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('language', 'en');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('sidebarCollapsed', 'true');
    });

    it('should load state from localStorage on initialization', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        switch (key) {
          case 'theme': return 'dark';
          case 'language': return 'en';
          case 'sidebarCollapsed': return 'true';
          case 'notificationSettings': return JSON.stringify({
            enabled: false,
            soundEnabled: false,
            showPreviews: true,
            quietHours: { enabled: true, start: '23:00', end: '07:00' },
            types: {
              social_interaction: false,
              content_recommendation: true,
              author_update: true,
              similar_content: false,
            },
          });
          default: return null;
        }
      });

      const { result } = renderHook(() => useGlobalStore());
      
      act(() => {
        result.current.loadPersistedState();
      });

      expect(result.current.theme).toBe('dark');
      expect(result.current.language).toBe('en');
      expect(result.current.isRTL).toBe(false);
      expect(result.current.ui.sidebarCollapsed).toBe(true);
      expect(result.current.notifications.enabled).toBe(false);
    });
  });

  describe('Store Subscription', () => {
    it('should notify subscribers on state changes', () => {
      const { result } = renderHook(() => useGlobalStore());
      const subscriber = jest.fn();
      
      // Subscribe to store changes
      const unsubscribe = useGlobalStore.subscribe(subscriber);

      act(() => {
        result.current.setTheme('dark');
      });

      expect(subscriber).toHaveBeenCalled();
      
      unsubscribe();
    });

    it('should allow selective subscription to specific state slices', () => {
      const { result } = renderHook(() => useGlobalStore((state) => state.theme));
      
      expect(result.current).toBe('light');

      act(() => {
        useGlobalStore.getState().setTheme('dark');
      });

      expect(result.current).toBe('dark');
    });
  });

  describe('Error Recovery', () => {
    it('should handle localStorage errors gracefully', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      const { result } = renderHook(() => useGlobalStore());
      
      // Should not throw error
      act(() => {
        result.current.setTheme('dark');
      });

      expect(result.current.theme).toBe('dark');
    });

    it('should handle invalid JSON in localStorage', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'notificationSettings') {
          return 'invalid json';
        }
        return null;
      });

      const { result } = renderHook(() => useGlobalStore());
      
      // Should not throw error and use default settings
      act(() => {
        result.current.loadPersistedState();
      });

      expect(result.current.notifications.enabled).toBe(true); // default value
    });
  });
});
