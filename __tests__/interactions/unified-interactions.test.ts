/**
 * اختبارات شاملة لنظام التفاعلات الموحد
 * يغطي: API، State Management، و Integration
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { renderHook, act } from '@testing-library/react';
import { useUserInteractions, useArticleInteraction } from '@/stores/userInteractions';

// Mock fetch globally
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    pathname: '/article/test-article-123',
    href: 'http://localhost:3000/article/test-article-123'
  }
});

// Mock toast notifications
(global as any).window = {
  ...window,
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
};

describe('Unified Interactions System', () => {
  const mockArticleId = 'test-article-123';
  const mockUserId = 'test-user-456';
  const mockToken = 'mock-jwt-token';

  beforeEach(() => {
    // Clear localStorage
    localStorageMock.clear();
    
    // Reset fetch mock
    (fetch as jest.MockedFunction<typeof fetch>).mockClear();
    
    // Setup default localStorage values
    localStorageMock.setItem('user_id', mockUserId);
    localStorageMock.setItem('auth-token', mockToken);
    
    // Reset Zustand store
    useUserInteractions.getState().clearInteractions();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('API Integration Tests', () => {
    it('should successfully toggle like interaction', async () => {
      // Mock successful API response
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          action: 'added',
          like: true,
          stats: { likes: 1, saves: 0, shares: 0 },
          message: 'تم إضافة الإعجاب بنجاح'
        })
      } as Response);

      const { result } = renderHook(() => useArticleInteraction(mockArticleId));

      // Initially should be false
      expect(result.current.liked).toBe(false);

      // Toggle like
      await act(async () => {
        await result.current.toggleLike();
      });

      // Should be true after toggle
      expect(result.current.liked).toBe(true);

      // Verify API was called correctly
      expect(fetch).toHaveBeenCalledWith('/api/interactions/unified', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mockToken}`
        },
        body: JSON.stringify({
          articleId: mockArticleId,
          type: 'like',
          action: 'toggle'
        })
      });
    });

    it('should handle API errors gracefully', async () => {
      // Mock API error response
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({
          error: 'Internal server error'
        })
      } as Response);

      const { result } = renderHook(() => useArticleInteraction(mockArticleId));

      await act(async () => {
        await result.current.toggleLike();
      });

      // Should remain false after failed toggle
      expect(result.current.liked).toBe(false);
      
      // Should have error
      expect(result.current.error).toContain('خطأ في الخادم');
    });

    it('should handle network errors', async () => {
      // Mock network error
      (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(
        new Error('Network error')
      );

      const { result } = renderHook(() => useArticleInteraction(mockArticleId));

      await act(async () => {
        await result.current.toggleLike();
      });

      // Should remain false after failed toggle
      expect(result.current.liked).toBe(false);
      
      // Should have error
      expect(result.current.error).toContain('Network error');
    });
  });

  describe('State Management Tests', () => {
    it('should persist interactions in localStorage', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          action: 'added',
          like: true,
          stats: { likes: 1, saves: 0, shares: 0 }
        })
      } as Response);

      const { result } = renderHook(() => useUserInteractions());

      await act(async () => {
        await result.current.toggleInteraction(mockArticleId, 'like');
      });

      // Check if localStorage contains the interaction
      const storedData = localStorageMock.getItem('user-interactions-storage');
      expect(storedData).toBeTruthy();
      
      const parsedData = JSON.parse(storedData!);
      expect(parsedData.state.interactions[mockArticleId].liked).toBe(true);
    });

    it('should restore interactions from localStorage', () => {
      // Pre-populate localStorage
      const mockStoredData = {
        state: {
          interactions: {
            [mockArticleId]: {
              liked: true,
              saved: false,
              shared: true
            }
          },
          lastSyncTime: Date.now()
        },
        version: 1
      };
      
      localStorageMock.setItem('user-interactions-storage', JSON.stringify(mockStoredData));

      const { result } = renderHook(() => useArticleInteraction(mockArticleId));

      // Should restore from localStorage
      expect(result.current.liked).toBe(true);
      expect(result.current.saved).toBe(false);
      expect(result.current.shared).toBe(true);
    });

    it('should handle multiple article interactions', async () => {
      const article1 = 'article-1';
      const article2 = 'article-2';

      // Mock API responses
      (fetch as jest.MockedFunction<typeof fetch>)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, action: 'added', like: true })
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, action: 'added', save: true })
        } as Response);

      const { result: result1 } = renderHook(() => useArticleInteraction(article1));
      const { result: result2 } = renderHook(() => useArticleInteraction(article2));

      await act(async () => {
        await result1.current.toggleLike();
        await result2.current.toggleSave();
      });

      expect(result1.current.liked).toBe(true);
      expect(result1.current.saved).toBe(false);
      expect(result2.current.liked).toBe(false);
      expect(result2.current.saved).toBe(true);
    });
  });

  describe('Authentication Tests', () => {
    it('should redirect to login when user is not authenticated', async () => {
      // Remove authentication data
      localStorageMock.removeItem('user_id');
      localStorageMock.removeItem('auth-token');

      // Mock window.location.href setter
      delete (window as any).location;
      (window as any).location = { href: '' };

      const { result } = renderHook(() => useArticleInteraction(mockArticleId));

      await act(async () => {
        await result.current.toggleLike();
      });

      // Should not make API call
      expect(fetch).not.toHaveBeenCalled();
      
      // Should redirect to login
      expect(window.location.href).toContain('/login');
    });

    it('should work with different authentication methods', async () => {
      // Test with user-id header (development mode)
      localStorageMock.removeItem('auth-token');
      
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          action: 'added',
          like: true
        })
      } as Response);

      const { result } = renderHook(() => useArticleInteraction(mockArticleId));

      await act(async () => {
        await result.current.toggleLike();
      });

      // Should use user-id header instead of Authorization
      expect(fetch).toHaveBeenCalledWith('/api/interactions/unified', 
        expect.objectContaining({
          headers: expect.objectContaining({
            'user-id': mockUserId
          })
        })
      );
    });
  });

  describe('Optimistic Updates', () => {
    it('should update UI immediately before API call', async () => {
      // Mock slow API response
      let resolvePromise: (value: any) => void;
      const slowPromise = new Promise(resolve => {
        resolvePromise = resolve;
      });

      (fetch as jest.MockedFunction<typeof fetch>).mockReturnValueOnce(slowPromise as Promise<Response>);

      const { result } = renderHook(() => useArticleInteraction(mockArticleId));

      // Should start as false
      expect(result.current.liked).toBe(false);

      // Start the toggle
      const togglePromise = act(async () => {
        return result.current.toggleLike();
      });

      // Should immediately update to true (optimistic update)
      expect(result.current.liked).toBe(true);

      // Resolve the API call
      resolvePromise!({
        ok: true,
        json: async () => ({
          success: true,
          action: 'added',
          like: true
        })
      });

      await togglePromise;

      // Should remain true
      expect(result.current.liked).toBe(true);
    });

    it('should revert optimistic update on API failure', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Server error' })
      } as Response);

      const { result } = renderHook(() => useArticleInteraction(mockArticleId));

      expect(result.current.liked).toBe(false);

      await act(async () => {
        await result.current.toggleLike();
      });

      // Should revert to false after API failure
      expect(result.current.liked).toBe(false);
    });
  });

  describe('Initialization Tests', () => {
    it('should fetch user interactions on initialization', async () => {
      const mockInteractionsData = {
        success: true,
        data: {
          [mockArticleId]: {
            liked: true,
            saved: false,
            shared: true
          },
          'another-article': {
            liked: false,
            saved: true,
            shared: false
          }
        }
      };

      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockInteractionsData
      } as Response);

      const { result } = renderHook(() => useUserInteractions());

      await act(async () => {
        await result.current.initializeUserInteractions([mockArticleId, 'another-article']);
      });

      // Should fetch with correct parameters
      expect(fetch).toHaveBeenCalledWith(
        `/api/interactions/unified?articleIds=${mockArticleId},another-article`,
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`
          })
        })
      );

      // Should update state with fetched data
      const articleState = result.current.getInteractionState(mockArticleId);
      expect(articleState.liked).toBe(true);
      expect(articleState.saved).toBe(false);
      expect(articleState.shared).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should clear errors when requested', () => {
      const { result } = renderHook(() => useUserInteractions());

      // Manually set an error
      act(() => {
        result.current.clearInteractions();
        // Simulate an error state
        (result.current as any).error = 'Test error';
      });

      // Clear the error
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBe(null);
    });

    it('should handle malformed API responses', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        }
      } as Response);

      const { result } = renderHook(() => useArticleInteraction(mockArticleId));

      await act(async () => {
        await result.current.toggleLike();
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.liked).toBe(false);
    });
  });
});
