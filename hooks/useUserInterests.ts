'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export interface UserInterest {
  id?: string;
  user_id?: string;
  category_id?: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  created_at?: string;
  // البنية الجديدة من API
  interestId?: string;
  categoryName?: string;
  icon?: string;
  addedAt?: string;
}

export function useUserInterests() {
  const { user, isLoggedIn } = useAuth();
  const [interests, setInterests] = useState<UserInterest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserInterests = async () => {
      console.log('🔍 fetchUserInterests called:', { isLoggedIn, userId: user?.id });
      
      if (!isLoggedIn || !user?.id) {
        console.log('❌ User not logged in or no user ID');
        setInterests([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log('📡 Fetching user interests...');
        const response = await fetch('/api/user/interests', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        console.log('📡 Response status:', response.status);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('📊 User interests data:', data);
        
        if (data.success) {
          setInterests(data.interests || []);
          console.log('✅ Interests loaded:', data.interests?.length || 0);
        } else {
          console.log('❌ API returned error:', data.error);
          setError(data.error || 'فشل في جلب الاهتمامات');
        }
      } catch (err) {
        console.error('❌ خطأ في جلب اهتمامات المستخدم:', err);
        setError('فشل في الاتصال بالخادم');
        setInterests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInterests();
  }, [isLoggedIn, user?.id]);

  // دالة للحصول على أسماء الاهتمامات كنص
  const getInterestNames = (): string => {
    if (!interests.length) return 'لم يتم تحديد اهتمامات بعد';
    
    // استخراج أسماء الاهتمامات من البنية الجديدة
    const interestNames = interests
      .map(interest => {
        // التعامل مع البنية الجديدة والقديمة
        if (interest.categoryName) {
          return interest.categoryName;
        }
        if (interest.category?.name) {
          return interest.category.name;
        }
        return null;
      })
      .filter(name => name !== null && name !== 'غير محدد');

    // إزالة التكرارات للحصول على قائمة فريدة
    const uniqueNames = [...new Set(interestNames)];
    
    return uniqueNames.length > 0 
      ? uniqueNames.join('، ') 
      : 'لم يتم تحديد اهتمامات بعد';
  };

  return {
    interests,
    loading,
    error,
    getInterestNames,
    hasInterests: interests.length > 0
  };
}
