import { useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  reputation?: number;
  badges?: string[];
  isVerified?: boolean;
  memberSince?: string;
  totalComments?: number;
  totalLikes?: number;
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userId = localStorage.getItem('user_id');
        const userEmail = localStorage.getItem('user_email');
        
        if (!userId || userId === 'anonymous') {
          setUser(null);
          setIsLoading(false);
          return;
        }

        // محاولة جلب بيانات المستخدم من API
        const response = await fetch(`/api/users/${userId}`);
        if (response.ok) {
          const userData = await response.json();
          setUser(userData.user);
        } else {
          // إنشاء مستخدم افتراضي من البيانات المحلية
          setUser({
            id: userId,
            name: userEmail?.split('@')[0] || 'مستخدم',
            email: userEmail || '',
            reputation: 0,
            badges: [],
            isVerified: false,
            totalComments: 0,
            totalLikes: 0
          });
        }
      } catch (error) {
        console.error('خطأ في جلب بيانات المستخدم:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  const updateUser = (updates: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...updates } : null);
  };

  return {
    user,
    isLoading,
    updateUser,
    isAuthenticated: !!user
  };
}
