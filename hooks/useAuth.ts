'use client';

import { useAuth as useAuthContext } from '@/contexts/AuthContext';

interface UseAuthReturn {
  user: any;
  isLoggedIn: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  logout: () => void;
  userId: string | null;
}

export const useAuth = (): UseAuthReturn => {
  const { user, loading, logout } = useAuthContext();
  
  const isLoggedIn = !!user;
  const isAdmin = isLoggedIn && user ? (user.role === 'admin' || user.role === 'super_admin') : false;
  const userId = user?.id ? String(user.id) : null;

  // ملاحظة: هذا localStorage مؤقت للتوافق مع الأنظمة القديمة
  // TODO: استبدال بـ cookies أو session storage
  if (userId && typeof window !== 'undefined') {
    localStorage.setItem('user_id', userId);
  }

  return { 
    user, 
    isLoggedIn, 
    isAdmin,
    isLoading: loading,
    logout,
    userId
  };
}; 