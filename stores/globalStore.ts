import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { io, Socket } from 'socket.io-client';

// ===========================================
// Type Definitions
// ===========================================

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'editor' | 'subscriber';
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: 'ar' | 'en';
  notifications: NotificationPreferences;
  content: ContentPreferences;
  privacy: PrivacyPreferences;
}

export interface NotificationPreferences {
  enabled: boolean;
  channels: {
    push: boolean;
    email: boolean;
    inApp: boolean;
  };
  types: {
    socialInteraction: boolean;
    contentRecommendation: boolean;
    authorUpdate: boolean;
    similarContent: boolean;
  };
  timing: {
    quietHours: {
      enabled: boolean;
      start: string; // "22:00"
      end: string;   // "08:00"
    };
    frequency: 'immediate' | 'hourly' | 'daily';
  };
}

export interface ContentPreferences {
  categories: string[];
  tags: string[];
  authors: string[];
  readingLevel: 'basic' | 'intermediate' | 'advanced';
  contentLength: 'short' | 'medium' | 'long' | 'all';
  autoplay: boolean;
}

export interface PrivacyPreferences {
  dataCollection: boolean;
  analytics: boolean;
  personalization: boolean;
  shareActivity: boolean;
}

export interface Notification {
  id: string;
  type: 'social_interaction' | 'content_recommendation' | 'author_update' | 'similar_content';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  timestamp: number;
  expiresAt?: number;
}

export interface Recommendation {
  id: string;
  type: 'article' | 'author' | 'category' | 'tag';
  title: string;
  description?: string;
  confidence: number;
  reason: string;
  data: any;
  timestamp: number;
}

export interface AnalyticsData {
  readingTime: number;
  articlesRead: number;
  interactionCount: number;
  categoriesExplored: string[];
  lastActive: number;
  engagementScore: number;
}

export interface ConnectionStatus {
  online: boolean;
  websocket: boolean;
  lastSync: number | null;
}

// ===========================================
// Store Interface
// ===========================================

export interface GlobalStore {
  // User & Authentication
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // UI State
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  currentPage: string;
  searchQuery: string;
  
  // Notifications
  notifications: Notification[];
  unreadCount: number;
  
  // Recommendations
  recommendations: Recommendation[];
  recommendationsLoading: boolean;
  
  // Analytics
  analytics: AnalyticsData;
  
  // Connection
  connection: ConnectionStatus;
  socket: Socket | null;
  
  // Theme & Appearance
  theme: 'light' | 'dark' | 'auto';
  direction: 'ltr' | 'rtl';
  
  // Error State
  error: string | null;
  
  // Actions
  setUser: (user: User | null) => void;
  updateUserPreferences: (preferences: Partial<UserPreferences>) => void;
  
  // UI Actions
  setSidebarOpen: (open: boolean) => void;
  setMobileMenuOpen: (open: boolean) => void;
  setCurrentPage: (page: string) => void;
  setSearchQuery: (query: string) => void;
  
  // Notification Actions
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  // Recommendation Actions
  fetchRecommendations: () => Promise<void>;
  addRecommendation: (recommendation: Omit<Recommendation, 'id' | 'timestamp'>) => void;
  clearRecommendations: () => void;
  
  // Analytics Actions
  updateAnalytics: (data: Partial<AnalyticsData>) => void;
  trackPageView: (page: string) => void;
  trackInteraction: (type: string, data?: any) => void;
  
  // Connection Actions
  initializeWebSocket: () => void;
  disconnectWebSocket: () => void;
  updateConnectionStatus: (status: Partial<ConnectionStatus>) => void;
  
  // Theme Actions
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  toggleTheme: () => void;
  
  // Error Actions
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Initialization
  initialize: () => Promise<void>;
  cleanup: () => void;
}

// ===========================================
// Utility Functions
// ===========================================

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth-token') || localStorage.getItem('authToken');
};

const apiCall = async (url: string, options: RequestInit = {}): Promise<any> => {
  const token = getAuthToken();
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
  
  return response.json();
};

// ===========================================
// Store Implementation
// ===========================================

export const useGlobalStore = create<GlobalStore>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // Initial State
        user: null,
        isAuthenticated: false,
        isLoading: false,
        
        sidebarOpen: true,
        mobileMenuOpen: false,
        currentPage: '/',
        searchQuery: '',
        
        notifications: [],
        unreadCount: 0,
        
        recommendations: [],
        recommendationsLoading: false,
        
        analytics: {
          readingTime: 0,
          articlesRead: 0,
          interactionCount: 0,
          categoriesExplored: [],
          lastActive: Date.now(),
          engagementScore: 0,
        },
        
        connection: {
          online: typeof window !== 'undefined' ? navigator.onLine : true,
          websocket: false,
          lastSync: null,
        },
        
        socket: null,
        theme: 'auto',
        direction: 'rtl',
        error: null,

        // User Actions
        setUser: (user) => {
          set({ 
            user, 
            isAuthenticated: !!user,
            direction: user?.preferences.language === 'en' ? 'ltr' : 'rtl'
          });
        },

        updateUserPreferences: (preferences) => {
          set((state) => ({
            user: state.user ? {
              ...state.user,
              preferences: { ...state.user.preferences, ...preferences }
            } : null
          }));
        },

        // UI Actions
        setSidebarOpen: (open) => set({ sidebarOpen: open }),
        setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
        setCurrentPage: (page) => {
          set({ currentPage: page });
          get().trackPageView(page);
        },
        setSearchQuery: (query) => set({ searchQuery: query }),

        // Notification Actions
        addNotification: (notification) => {
          const newNotification: Notification = {
            ...notification,
            id: generateId(),
            timestamp: Date.now(),
          };
          
          set((state) => ({
            notifications: [newNotification, ...state.notifications],
            unreadCount: state.unreadCount + 1,
          }));
        },

        markNotificationRead: (id) => {
          set((state) => ({
            notifications: state.notifications.map(n => 
              n.id === id ? { ...n, read: true } : n
            ),
            unreadCount: Math.max(0, state.unreadCount - 1),
          }));
        },

        markAllNotificationsRead: () => {
          set((state) => ({
            notifications: state.notifications.map(n => ({ ...n, read: true })),
            unreadCount: 0,
          }));
        },

        removeNotification: (id) => {
          set((state) => {
            const notification = state.notifications.find(n => n.id === id);
            return {
              notifications: state.notifications.filter(n => n.id !== id),
              unreadCount: notification && !notification.read ? 
                Math.max(0, state.unreadCount - 1) : state.unreadCount,
            };
          });
        },

        clearNotifications: () => {
          set({ notifications: [], unreadCount: 0 });
        },

        // Recommendation Actions
        fetchRecommendations: async () => {
          set({ recommendationsLoading: true });
          
          try {
            const data = await apiCall('/api/recommendations');
            set({ 
              recommendations: data.recommendations || [],
              recommendationsLoading: false 
            });
          } catch (error) {
            console.error('خطأ في جلب التوصيات:', error);
            set({ 
              error: 'فشل في جلب التوصيات',
              recommendationsLoading: false 
            });
          }
        },

        addRecommendation: (recommendation) => {
          const newRecommendation: Recommendation = {
            ...recommendation,
            id: generateId(),
            timestamp: Date.now(),
          };
          
          set((state) => ({
            recommendations: [newRecommendation, ...state.recommendations].slice(0, 20),
          }));
        },

        clearRecommendations: () => {
          set({ recommendations: [] });
        },

        // Analytics Actions
        updateAnalytics: (data) => {
          set((state) => ({
            analytics: { ...state.analytics, ...data, lastActive: Date.now() }
          }));
        },

        trackPageView: (page) => {
          // Track page view in analytics
          if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('config', 'GA_MEASUREMENT_ID', {
              page_path: page,
            });
          }
          
          get().updateAnalytics({ lastActive: Date.now() });
        },

        trackInteraction: (type, data) => {
          const { analytics } = get();
          get().updateAnalytics({
            interactionCount: analytics.interactionCount + 1,
          });
          
          // Send to analytics API
          if (typeof window !== 'undefined') {
            try {
              apiCall('/api/analytics/interaction', {
                method: 'POST',
                body: JSON.stringify({ type, data, timestamp: Date.now() }),
              }).catch(console.error);
            } catch (error) {
              console.error('خطأ في تتبع التفاعل:', error);
            }
          }
        },

        // Connection Actions
        initializeWebSocket: () => {
          if (typeof window === 'undefined' || get().socket) return;
          
          try {
            const socket = io(process.env.NEXT_PUBLIC_WEBSOCKET_URL || '', {
              auth: {
                token: getAuthToken(),
              },
            });

            socket.on('connect', () => {
              set((state) => ({
                socket,
                connection: { ...state.connection, websocket: true },
              }));
            });

            socket.on('disconnect', () => {
              set((state) => ({
                connection: { ...state.connection, websocket: false },
              }));
            });

            socket.on('notification', (notification) => {
              get().addNotification(notification);
            });

            socket.on('recommendation', (recommendation) => {
              get().addRecommendation(recommendation);
            });

            set({ socket });
          } catch (error) {
            console.error('خطأ في تهيئة WebSocket:', error);
          }
        },

        disconnectWebSocket: () => {
          const { socket } = get();
          if (socket) {
            socket.disconnect();
            set({ 
              socket: null,
              connection: { ...get().connection, websocket: false },
            });
          }
        },

        updateConnectionStatus: (status) => {
          set((state) => ({
            connection: { ...state.connection, ...status }
          }));
        },

        // Theme Actions
        setTheme: (theme) => {
          set({ theme });
          if (typeof window !== 'undefined') {
            if (theme === 'dark') {
              document.documentElement.classList.add('dark');
            } else if (theme === 'light') {
              document.documentElement.classList.remove('dark');
            } else {
              // Auto mode
              const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
              if (prefersDark) {
                document.documentElement.classList.add('dark');
              } else {
                document.documentElement.classList.remove('dark');
              }
            }
          }
        },

        toggleTheme: () => {
          const { theme } = get();
          const newTheme = theme === 'light' ? 'dark' : 'light';
          get().setTheme(newTheme);
        },

        // Error Actions
        setError: (error) => set({ error }),
        clearError: () => set({ error: null }),

        // Initialization
        initialize: async () => {
          // اجعل initialize آمن للتكرار (idempotent)
          const { isLoading, initializedFlag } = get() as any;
          if (initializedFlag) return; // تم التهيئة مسبقًا
          set({ isLoading: true, initializedFlag: true } as any);
          
          try {
            // Initialize connection status
            if (typeof window !== 'undefined') {
              get().updateConnectionStatus({ online: navigator.onLine });
              
              // Add online/offline listeners
              window.addEventListener('online', () => {
                get().updateConnectionStatus({ online: true });
              });
              
              window.addEventListener('offline', () => {
                get().updateConnectionStatus({ online: false });
              });
            }

            // Load user data if authenticated
            const token = getAuthToken();
            if (token) {
              try {
                const userData = await apiCall('/api/auth/me');
                get().setUser(userData.user);
              } catch (error) {
                console.error('خطأ في جلب بيانات المستخدم:', error);
              }
            }

            // Initialize WebSocket
            get().initializeWebSocket();

            // Fetch recommendations
            await get().fetchRecommendations();

            set({ isLoading: false });
          } catch (error) {
            console.error('خطأ في تهيئة التطبيق:', error);
            set({ 
              error: 'خطأ في تهيئة التطبيق',
              isLoading: false,
              initializedFlag: false as any
            });
          }
        },

        cleanup: () => {
          get().disconnectWebSocket();
          set({
            notifications: [],
            recommendations: [],
            error: null,
          });
        },
      }),
      {
        name: 'sabq-global-store',
        partialize: (state) => ({
          user: state.user,
          theme: state.theme,
          direction: state.direction,
          sidebarOpen: state.sidebarOpen,
          analytics: state.analytics,
        }),
        version: 1,
      }
    )
  )
);

// ===========================================
// Helper Hooks
// ===========================================

export const useAuth = () => {
  const { user, isAuthenticated, setUser } = useGlobalStore();
  return { user, isAuthenticated, setUser };
};

export const useNotifications = () => {
  const {
    notifications,
    unreadCount,
    addNotification,
    markNotificationRead,
    markAllNotificationsRead,
    removeNotification,
    clearNotifications,
  } = useGlobalStore();
  
  return {
    notifications,
    unreadCount,
    addNotification,
    markNotificationRead,
    markAllNotificationsRead,
    removeNotification,
    clearNotifications,
  };
};

export const useRecommendations = () => {
  const {
    recommendations,
    recommendationsLoading,
    fetchRecommendations,
    addRecommendation,
    clearRecommendations,
  } = useGlobalStore();
  
  return {
    recommendations,
    loading: recommendationsLoading,
    fetchRecommendations,
    addRecommendation,
    clearRecommendations,
  };
};

export const useTheme = () => {
  const { theme, setTheme, toggleTheme } = useGlobalStore();
  return { theme, setTheme, toggleTheme };
};

export const useAnalytics = () => {
  const { analytics, updateAnalytics, trackPageView, trackInteraction } = useGlobalStore();
  return { analytics, updateAnalytics, trackPageView, trackInteraction };
};

export const useConnection = () => {
  const { connection, socket } = useGlobalStore();
  return { connection, socket };
};

// ===========================================
// Initialization
// ===========================================

if (typeof window !== 'undefined') {
  // Initialize store when the app loads
  window.addEventListener('load', () => {
    useGlobalStore.getState().initialize();
  });
  
  // Cleanup on beforeunload
  window.addEventListener('beforeunload', () => {
    useGlobalStore.getState().cleanup();
  });
}
