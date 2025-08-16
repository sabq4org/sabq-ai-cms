import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';

// Types
interface UserInteractionState {
  liked: boolean;
  saved: boolean;
  shared: boolean;
}

interface UserInteractionsStore {
  // State
  interactions: Record<string, UserInteractionState>;
  isLoading: boolean;
  error: string | null;
  lastSyncTime: number | null;
  
  // Actions
  setInteraction: (articleId: string, type: 'like' | 'save' | 'share', value: boolean) => void;
  toggleInteraction: (articleId: string, type: 'like' | 'save' | 'share') => Promise<boolean>;
  getInteractionState: (articleId: string) => UserInteractionState;
  initializeUserInteractions: (articleIds?: string[]) => Promise<void>;
  clearInteractions: () => void;
  clearError: () => void;
  
  // Bulk operations
  setMultipleInteractions: (interactions: Record<string, UserInteractionState>) => void;
  removeArticleInteractions: (articleId: string) => Promise<void>;
}

// Default interaction state
const DEFAULT_INTERACTION_STATE: UserInteractionState = {
  liked: false,
  saved: false,
  shared: false
};

// Utility functions
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  // Try localStorage first
  const token = localStorage.getItem('auth-token') || localStorage.getItem('authToken');
  if (token) return token;
  
  // Try cookies as fallback
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'auth-token' || name === 'auth_token') {
      return decodeURIComponent(value);
    }
  }
  
  return null;
};

const getUserId = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  const userId = localStorage.getItem('user_id') || localStorage.getItem('userId');
  return userId && userId !== 'anonymous' ? userId : null;
};

// API wrapper with retry logic
const apiCall = async (url: string, options: RequestInit, retries = 3): Promise<Response> => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        }
      });
      
      if (response.ok || response.status < 500) {
        return response;
      }
      
      if (i === retries - 1) throw new Error(`API call failed after ${retries} attempts`);
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
  
  throw new Error('Unexpected error in apiCall');
};

// Create the store
export const useUserInteractions = create<UserInteractionsStore>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // Initial state
        interactions: {},
        isLoading: false,
        error: null,
        lastSyncTime: null,

        // Set interaction state locally
        setInteraction: (articleId: string, type: 'like' | 'save' | 'share', value: boolean) => {
          set((state) => ({
            interactions: {
              ...state.interactions,
              [articleId]: {
                ...DEFAULT_INTERACTION_STATE,
                ...state.interactions[articleId],
                [type === 'like' ? 'liked' : type === 'save' ? 'saved' : 'shared']: value
              }
            }
          }));
        },

        // Toggle interaction with API call
        toggleInteraction: async (articleId: string, type: 'like' | 'save' | 'share') => {
          const userId = getUserId();
          const token = getAuthToken();
          
          if (!userId && !token) {
            set({ error: 'يجب تسجيل الدخول للتفاعل' });
            // Redirect to login
            if (typeof window !== 'undefined') {
              window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
            }
            return false;
          }

          set({ isLoading: true, error: null });

          try {
            // Optimistic update
            const currentState = get().interactions[articleId];
            const currentValue = currentState?.[type === 'like' ? 'liked' : type === 'save' ? 'saved' : 'shared'] || false;
            const newValue = !currentValue;
            
            get().setInteraction(articleId, type, newValue);

            // Prepare request headers
            const headers: Record<string, string> = {
              'Content-Type': 'application/json'
            };

            if (token) {
              headers['Authorization'] = `Bearer ${token}`;
            } else if (userId) {
              headers['user-id'] = userId;
            }

            // Make API call
            const response = await apiCall('/api/interactions/unified', {
              method: 'POST',
              headers,
              body: JSON.stringify({
                articleId,
                type,
                action: 'toggle'
              })
            });

            if (response.ok) {
              const data = await response.json();
              
              // Update with server response
              if (data.success) {
                get().setInteraction(articleId, type, data[type]);
                set({ 
                  lastSyncTime: Date.now(),
                  isLoading: false 
                });
                
                // Show success message (optional)
                if (typeof window !== 'undefined' && window.toast) {
                  window.toast.success(data.message || `تم ${data.action === 'added' ? 'إضافة' : 'إزالة'} ${type === 'like' ? 'الإعجاب' : type === 'save' ? 'الحفظ' : 'المشاركة'}`);
                }
                
                return data[type];
              } else {
                throw new Error(data.error || 'فشل في تحديث التفاعل');
              }
            } else {
              const errorData = await response.json().catch(() => ({}));
              throw new Error(errorData.error || `خطأ في الخادم (${response.status})`);
            }

          } catch (error) {
            console.error('خطأ في تبديل التفاعل:', error);
            
            // Revert optimistic update
            get().setInteraction(articleId, type, !newValue);
            
            const errorMessage = error instanceof Error ? error.message : 'حدث خطأ غير متوقع';
            set({ 
              error: errorMessage,
              isLoading: false 
            });

            // Show error message
            if (typeof window !== 'undefined' && window.toast) {
              window.toast.error(errorMessage);
            }

            return !newValue; // Return the reverted state
          }
        },

        // Get interaction state for an article
        getInteractionState: (articleId: string): UserInteractionState => {
          const state = get().interactions[articleId];
          return state ? { ...state } : { ...DEFAULT_INTERACTION_STATE };
        },

        // Initialize user interactions from server
        initializeUserInteractions: async (articleIds?: string[]) => {
          const userId = getUserId();
          const token = getAuthToken();
          
          if (!userId && !token) {
            return; // Not logged in, skip initialization
          }

          set({ isLoading: true, error: null });

          try {
            // Prepare request headers
            const headers: Record<string, string> = {};

            if (token) {
              headers['Authorization'] = `Bearer ${token}`;
            } else if (userId) {
              headers['user-id'] = userId;
            }

            // Build query string
            const queryParams = new URLSearchParams();
            if (articleIds && articleIds.length > 0) {
              queryParams.set('articleIds', articleIds.join(','));
            }

            const url = `/api/interactions/unified${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

            const response = await apiCall(url, {
              method: 'GET',
              headers
            });

            if (response.ok) {
              const data = await response.json();
              
              if (data.success) {
                set({
                  interactions: { ...get().interactions, ...data.data },
                  lastSyncTime: Date.now(),
                  isLoading: false
                });
              } else {
                throw new Error(data.error || 'فشل في جلب التفاعلات');
              }
            } else {
              throw new Error(`خطأ في الخادم (${response.status})`);
            }

          } catch (error) {
            console.error('خطأ في تحميل التفاعلات:', error);
            const errorMessage = error instanceof Error ? error.message : 'حدث خطأ في تحميل التفاعلات';
            set({ 
              error: errorMessage,
              isLoading: false 
            });
          }
        },

        // Clear all interactions
        clearInteractions: () => {
          set({
            interactions: {},
            error: null,
            lastSyncTime: null
          });
        },

        // Clear error
        clearError: () => {
          set({ error: null });
        },

        // Set multiple interactions at once
        setMultipleInteractions: (newInteractions: Record<string, UserInteractionState>) => {
          set((state) => ({
            interactions: { ...state.interactions, ...newInteractions }
          }));
        },

        // Remove all interactions for an article
        removeArticleInteractions: async (articleId: string) => {
          const userId = getUserId();
          const token = getAuthToken();
          
          if (!userId && !token) {
            set({ error: 'يجب تسجيل الدخول لحذف التفاعلات' });
            return;
          }

          set({ isLoading: true, error: null });

          try {
            // Prepare request headers
            const headers: Record<string, string> = {};

            if (token) {
              headers['Authorization'] = `Bearer ${token}`;
            } else if (userId) {
              headers['user-id'] = userId;
            }

            const response = await apiCall(`/api/interactions/unified?articleId=${articleId}`, {
              method: 'DELETE',
              headers
            });

            if (response.ok) {
              const data = await response.json();
              
              if (data.success) {
                // Remove from local state
                set((state) => {
                  const newInteractions = { ...state.interactions };
                  delete newInteractions[articleId];
                  return {
                    interactions: newInteractions,
                    lastSyncTime: Date.now(),
                    isLoading: false
                  };
                });

                if (typeof window !== 'undefined' && window.toast) {
                  window.toast.success('تم حذف جميع التفاعلات');
                }
              } else {
                throw new Error(data.error || 'فشل في حذف التفاعلات');
              }
            } else {
              throw new Error(`خطأ في الخادم (${response.status})`);
            }

          } catch (error) {
            console.error('خطأ في حذف التفاعلات:', error);
            const errorMessage = error instanceof Error ? error.message : 'حدث خطأ في حذف التفاعلات';
            set({ 
              error: errorMessage,
              isLoading: false 
            });

            if (typeof window !== 'undefined' && window.toast) {
              window.toast.error(errorMessage);
            }
          }
        }
      }),
      {
        name: 'user-interactions-storage',
        // Only persist interactions and lastSyncTime
        partialize: (state) => ({
          interactions: state.interactions,
          lastSyncTime: state.lastSyncTime
        }),
        // Custom merge function to handle stored data properly
        merge: (persistedState: any, currentState) => ({
          ...currentState,
          interactions: persistedState?.interactions || {},
          lastSyncTime: persistedState?.lastSyncTime || null
        }),
        // Version for migration support
        version: 1
      }
    )
  )
);

// Export helper hooks for easier usage
export const useArticleInteraction = (articleId: string) => {
  const { 
    getInteractionState, 
    toggleInteraction, 
    isLoading, 
    error, 
    clearError 
  } = useUserInteractions();

  const interactionState = getInteractionState(articleId);

  return {
    liked: interactionState.liked,
    saved: interactionState.saved,
    shared: interactionState.shared,
    isLoading,
    error,
    clearError,
    toggleLike: () => toggleInteraction(articleId, 'like'),
    toggleSave: () => toggleInteraction(articleId, 'save'),
    toggleShare: () => toggleInteraction(articleId, 'share')
  };
};

// Auto-sync functionality - subscribe to changes and sync periodically
if (typeof window !== 'undefined') {
  // Sync interactions on app load
  window.addEventListener('load', () => {
    const store = useUserInteractions.getState();
    const timeSinceLastSync = store.lastSyncTime ? Date.now() - store.lastSyncTime : Infinity;
    
    // Sync if more than 5 minutes since last sync
    if (timeSinceLastSync > 5 * 60 * 1000) {
      store.initializeUserInteractions();
    }
  });

  // Sync interactions when coming back online
  window.addEventListener('online', () => {
    useUserInteractions.getState().initializeUserInteractions();
  });

  // Sync interactions when window becomes visible again
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      const store = useUserInteractions.getState();
      const timeSinceLastSync = store.lastSyncTime ? Date.now() - store.lastSyncTime : Infinity;
      
      // Sync if more than 2 minutes since last sync
      if (timeSinceLastSync > 2 * 60 * 1000) {
        store.initializeUserInteractions();
      }
    }
  });
}
