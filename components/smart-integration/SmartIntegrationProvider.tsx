'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useGlobalStore, useAuth } from '@/stores/globalStore';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from 'next-themes';

// Import all smart components
import { SmartRecommendations } from './SmartRecommendations';
import { IntelligentNotifications } from './IntelligentNotifications';
import { UserProfileDashboard } from './UserProfileDashboard';
import { PersonalizationSettings } from './PersonalizationSettings';
import { AdminControlPanel } from './AdminControlPanel';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { ContentManagement } from './ContentManagement';
import { RealTimeUpdates } from './RealTimeUpdates';

// ===========================================
// Context and Types
// ===========================================

interface SmartIntegrationContextType {
  isInitialized: boolean;
  componentsLoaded: boolean;
  enableRealTime: boolean;
  theme: 'light' | 'dark' | 'auto';
  direction: 'ltr' | 'rtl';
  performance: {
    loadTime: number;
    renderTime: number;
    memoryUsage: number;
  };
}

const SmartIntegrationContext = createContext<SmartIntegrationContextType | null>(null);

export const useSmartIntegration = () => {
  const context = useContext(SmartIntegrationContext);
  if (!context) {
    throw new Error('useSmartIntegration must be used within SmartIntegrationProvider');
  }
  return context;
};

// ===========================================
// Performance Monitor
// ===========================================

const PerformanceMonitor: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [performance, setPerformance] = useState({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
  });

  useEffect(() => {
    const startTime = performance.now();

    // Monitor initial load
    const handleLoad = () => {
      const loadTime = performance.now() - startTime;
      setPerformance(prev => ({ ...prev, loadTime }));
    };

    // Monitor memory usage
    const monitorMemory = () => {
      if ('memory' in performance) {
        const memoryInfo = (performance as any).memory;
        setPerformance(prev => ({
          ...prev,
          memoryUsage: memoryInfo.usedJSHeapSize / (1024 * 1024), // Convert to MB
        }));
      }
    };

    // Monitor render time
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const renderTime = entries.reduce((acc, entry) => acc + entry.duration, 0);
      setPerformance(prev => ({ ...prev, renderTime }));
    });

    if (typeof window !== 'undefined') {
      window.addEventListener('load', handleLoad);
      observer.observe({ entryTypes: ['measure'] });
      
      const memoryInterval = setInterval(monitorMemory, 5000);
      
      return () => {
        window.removeEventListener('load', handleLoad);
        observer.disconnect();
        clearInterval(memoryInterval);
      };
    }
  }, []);

  return <>{children}</>;
};

// ===========================================
// Smart Components Registry
// ===========================================

export const SmartComponentsRegistry = {
  SmartRecommendations,
  IntelligentNotifications,
  UserProfileDashboard,
  PersonalizationSettings,
  AdminControlPanel,
  AnalyticsDashboard,
  ContentManagement,
  RealTimeUpdates,
};

// ===========================================
// Integration Wrapper Components
// ===========================================

interface SmartPageWrapperProps {
  children: React.ReactNode;
  enableRecommendations?: boolean;
  enableNotifications?: boolean;
  enableRealTime?: boolean;
  showAnalytics?: boolean;
  pageType?: 'home' | 'article' | 'profile' | 'admin' | 'content';
}

export const SmartPageWrapper: React.FC<SmartPageWrapperProps> = ({
  children,
  enableRecommendations = true,
  enableNotifications = true,
  enableRealTime = true,
  showAnalytics = false,
  pageType = 'home',
}) => {
  const { user, theme, direction } = useGlobalStore();
  const [componentsLoaded, setComponentsLoaded] = useState(false);

  useEffect(() => {
    // Initialize components based on page type
    const timer = setTimeout(() => {
      setComponentsLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, [pageType]);

  return (
    <div className={`smart-page-wrapper ${direction} ${theme}`}>
      {/* Main Content */}
      <div className="relative">
        {children}
        
        {/* Smart Recommendations for home/article pages */}
        {enableRecommendations && componentsLoaded && (pageType === 'home' || pageType === 'article') && (
          <div className="mt-8">
            <SmartRecommendations />
          </div>
        )}
        
        {/* Analytics for admin pages */}
        {showAnalytics && componentsLoaded && pageType === 'admin' && (
          <div className="mt-8">
            <AnalyticsDashboard />
          </div>
        )}
      </div>

      {/* Floating Components */}
      {enableNotifications && componentsLoaded && user && (
        <div className="fixed top-4 right-4 z-50">
          <IntelligentNotifications />
        </div>
      )}

      {/* Real-time Updates */}
      {enableRealTime && componentsLoaded && user && (
        <RealTimeUpdates />
      )}
    </div>
  );
};

// ===========================================
// Admin Page Wrapper
// ===========================================

export const AdminPageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">غير مصرح</h2>
          <p className="text-gray-500">تحتاج إلى صلاحيات إدارية للوصول إلى هذه الصفحة</p>
        </div>
      </div>
    );
  }

  return (
    <SmartPageWrapper pageType="admin" showAnalytics>
      <div className="space-y-6">
        <AdminControlPanel />
        {children}
      </div>
    </SmartPageWrapper>
  );
};

// ===========================================
// Content Management Wrapper
// ===========================================

export const ContentManagementWrapper: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  if (!user || (user.role !== 'admin' && user.role !== 'editor')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">غير مصرح</h2>
          <p className="text-gray-500">تحتاج إلى صلاحيات تحرير للوصول إلى إدارة المحتوى</p>
        </div>
      </div>
    );
  }

  return (
    <SmartPageWrapper pageType="content">
      <ContentManagement />
      {children}
    </SmartPageWrapper>
  );
};

// ===========================================
// Profile Page Wrapper
// ===========================================

export const ProfilePageWrapper: React.FC<{ 
  children?: React.ReactNode;
  userId?: string;
}> = ({ children, userId }) => {
  return (
    <SmartPageWrapper pageType="profile">
      <div className="space-y-6">
        <UserProfileDashboard userId={userId} />
        {children}
      </div>
    </SmartPageWrapper>
  );
};

// ===========================================
// Settings Page Wrapper
// ===========================================

export const SettingsPageWrapper: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <SmartPageWrapper enableRecommendations={false}>
      <div className="space-y-6">
        <PersonalizationSettings />
        {children}
      </div>
    </SmartPageWrapper>
  );
};

// ===========================================
// Error Boundary for Smart Components
// ===========================================

interface SmartErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

class SmartErrorBoundary extends React.Component<
  { children: React.ReactNode },
  SmartErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): SmartErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Smart Integration Error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-lg font-semibold text-red-800 mb-2">
            خطأ في النظام الذكي
          </h2>
          <p className="text-red-600 mb-4">
            حدث خطأ في تحميل المكونات الذكية. يرجى إعادة تحميل الصفحة.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            إعادة تحميل
          </button>
          
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-red-700">
                تفاصيل الخطأ (Development Only)
              </summary>
              <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-auto">
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

// ===========================================
// Main Provider Component
// ===========================================

interface SmartIntegrationProviderProps {
  children: React.ReactNode;
  queryClient?: QueryClient;
}

export const SmartIntegrationProvider: React.FC<SmartIntegrationProviderProps> = ({
  children,
  queryClient: providedQueryClient,
}) => {
  const [queryClient] = useState(() => 
    providedQueryClient || new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 5 * 60 * 1000, // 5 minutes
          gcTime: 10 * 60 * 1000, // 10 minutes
          retry: 3,
          refetchOnWindowFocus: true,
        },
        mutations: {
          retry: 1,
        },
      },
    })
  );

  const { initialize, theme, direction } = useGlobalStore();
  const [isInitialized, setIsInitialized] = useState(false);
  const [componentsLoaded, setComponentsLoaded] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await initialize();
        setIsInitialized(true);
        
        // Load components after initialization
        setTimeout(() => {
          setComponentsLoaded(true);
        }, 500);
      } catch (error) {
        console.error('Smart Integration initialization failed:', error);
      }
    };

    initializeApp();
  }, [initialize]);

  const contextValue: SmartIntegrationContextType = {
    isInitialized,
    componentsLoaded,
    enableRealTime: true,
    theme,
    direction,
    performance: {
      loadTime: 0,
      renderTime: 0,
      memoryUsage: 0,
    },
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="auto">
        <SmartIntegrationContext.Provider value={contextValue}>
          <SmartErrorBoundary>
            <PerformanceMonitor>
              <div className={`smart-integration-root ${direction}`}>
                {children}
                
                {/* Development Tools */}
                {process.env.NODE_ENV === 'development' && (
                  <ReactQueryDevtools initialIsOpen={false} />
                )}
                
                {/* Toast Notifications */}
                <Toaster
                  position="top-center"
                  reverseOrder={false}
                  gutter={8}
                  containerClassName=""
                  containerStyle={{}}
                  toastOptions={{
                    className: '',
                    duration: 4000,
                    style: {
                      background: '#363636',
                      color: '#fff',
                      fontFamily: 'Cairo, sans-serif',
                      direction: direction,
                    },
                    success: {
                      duration: 3000,
                      iconTheme: {
                        primary: '#10B981',
                        secondary: '#fff',
                      },
                    },
                    error: {
                      duration: 5000,
                      iconTheme: {
                        primary: '#EF4444',
                        secondary: '#fff',
                      },
                    },
                  }}
                />
              </div>
            </PerformanceMonitor>
          </SmartErrorBoundary>
        </SmartIntegrationContext.Provider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

// ===========================================
// Export all components and utilities
// ===========================================

export {
  SmartRecommendations,
  IntelligentNotifications,
  UserProfileDashboard,
  PersonalizationSettings,
  AdminControlPanel,
  AnalyticsDashboard,
  ContentManagement,
  RealTimeUpdates,
};

export default SmartIntegrationProvider;
