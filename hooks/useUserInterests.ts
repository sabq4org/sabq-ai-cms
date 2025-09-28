import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/EnhancedAuthContextWithSSR';

export interface UserInterest {
  id: number;
  category_id: number;
  category: {
    id: number;
    name: string;
    icon?: string;
    color?: string;
  };
}

export interface FetchUserInterestsResponse {
  interests: UserInterest[];
  totalCount: number;
}

export function useUserInterests() {
  const { isLoggedIn, user, loading: authLoading } = useAuth();
  const [interests, setInterests] = useState<UserInterest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserInterests = async (): Promise<FetchUserInterestsResponse> => {
    // Skip during SSR
    if (typeof window === 'undefined') {
      return { interests: [], totalCount: 0 };
    }

    console.log('🎯 fetchUserInterests called with:', { 
      isLoggedIn, 
      userId: user?.id,
      user: user ? 'exists' : 'null',
      authLoading
    });

    if (!isLoggedIn || !user?.id) {
      const errorMsg = '❌ User not logged in or no user ID';
      console.log(errorMsg, { isLoggedIn, userId: user?.id, authLoading });
      throw new Error(errorMsg);
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('📤 Fetching user interests for user:', user.id);
      const response = await fetch('/api/profile/me/interests', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('📥 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Failed to fetch interests:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: FetchUserInterestsResponse = await response.json();
      console.log('✅ Fetched interests successfully:', {
        interestsCount: data.interests?.length || 0,
        totalCount: data.totalCount
      });

      setInterests(data.interests || []);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('❌ Error in fetchUserInterests:', errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateUserInterests = async (categoryIds: number[]): Promise<FetchUserInterestsResponse> => {
    if (!isLoggedIn || !user?.id) {
      throw new Error('User not logged in');
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/profile/me/interests', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category_ids: categoryIds }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: FetchUserInterestsResponse = await response.json();
      setInterests(data.interests || []);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get interest names
  const getInterestNames = (): string[] => {
    return interests.map(interest => interest.category.name);
  };

  // Helper function to check if user has interests
  const hasInterests = (): boolean => {
    return interests.length > 0;
  };

  // Auto-fetch interests when user logs in - WAIT for auth loading to complete
  useEffect(() => {
    // Skip during SSR
    if (typeof window === 'undefined') {
      return;
    }

    // Only proceed if auth is not loading and user is authenticated
    if (!authLoading && isLoggedIn && user?.id) {
      console.log('🔄 Auth loading complete, fetching user interests...');
      fetchUserInterests().catch(console.error);
    } else if (!authLoading && !isLoggedIn) {
      // لا نقوم بمسح الاهتمامات هنا لتجنب الوميض المؤقت عند تغيّر حالة الجلسة
      // سيتم المسح فقط عند أحداث خروج صريحة (logout/session-expired)
      console.log('🧭 Auth indicates guest, keeping existing interests until explicit logout');
    } else {
      console.log('⏳ Waiting for auth loading to complete...', { authLoading, isLoggedIn, userId: user?.id });
    }
  }, [authLoading, isLoggedIn, user?.id]);

  // امسح الاهتمامات فقط عند أحداث خروج مؤكدة لتجنّب الاختفاء المفاجئ
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onAuthEvent = (e: any) => {
      const t = e?.detail?.type;
      if (t === 'logout' || t === 'session-expired' || t === 'max-retries-exceeded') {
        console.log('🧹 Clearing interests due to explicit auth event:', t);
        setInterests([]);
        setError(null);
      }
    };
    window.addEventListener('auth-change', onAuthEvent as EventListener);
    window.addEventListener('auth-expired', onAuthEvent as EventListener);
    return () => {
      window.removeEventListener('auth-change', onAuthEvent as EventListener);
      window.removeEventListener('auth-expired', onAuthEvent as EventListener);
    };
  }, []);

  return {
    interests,
    loading: loading || authLoading, // Include auth loading in the overall loading state
    error,
    fetchUserInterests,
    updateUserInterests,
    getInterestNames,
    hasInterests,
  };
}
