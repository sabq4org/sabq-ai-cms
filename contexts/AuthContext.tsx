'use client';

import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';

export interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
  roleId?: string;
  is_admin?: boolean;
  avatar?: string;
  loyaltyPoints?: number;
  created_at?: string;
  updated_at?: string;
  is_verified?: boolean;
  iat?: number;
  exp?: number;
}

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  userId: string | null;
  loading: boolean;
  error: string | null;
}

interface AuthContextValue extends AuthState {
  login: (tokenOrUser: string | User) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoggedIn: false,
    userId: null,
    loading: true,
    error: null
  });

  // تحديث حالة المصادقة
  const updateAuthState = useCallback((user: User | null, error: string | null = null) => {
    setAuthState({
      user,
      isLoggedIn: !!user,
      userId: user?.id || null,
      loading: false,
      error
    });
  }, []);

  // تحميل بيانات المستخدم
  const loadUser = useCallback(async () => {
    try {
      // تعيين loading state
      setAuthState(prev => ({ ...prev, loading: true }));
      
      // الاعتماد على API فقط للحصول على بيانات المستخدم
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          updateAuthState(data.user);
          return;
        }
      }

      // لا يوجد مستخدم مسجل
      updateAuthState(null);
    } catch (error) {
      console.error('خطأ في تحميل بيانات المستخدم:', error);
      updateAuthState(null, 'فشل في تحميل بيانات المستخدم');
    }
  }, [updateAuthState]);

  // تسجيل الدخول
  const login = useCallback(async (tokenOrUser: string | User) => {
    // إذا كان token، نحتاج لجلب بيانات المستخدم
    if (typeof tokenOrUser === 'string') {
      // Token تم تمريره، الكوكيز يجب أن تكون قد تم تعيينها من قبل API
      // فقط نحتاج لتحديث بيانات المستخدم
      await loadUser();
      
      // أطلق حدث لتحديث المكونات الأخرى
      window.dispatchEvent(new Event('auth-change'));
    } else {
      // User object تم تمريره مباشرة
      updateAuthState(tokenOrUser);
      window.dispatchEvent(new Event('auth-change'));
    }
  }, [updateAuthState, loadUser]);

  // تسجيل الخروج
  const logout = useCallback(() => {
    updateAuthState(null);
    
    // مسح البيانات غير الحساسة فقط
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user_preferences');
      sessionStorage.clear();
    }
    
    // لا نتلاعب بالكوكيز HttpOnly من العميل
  }, [updateAuthState]);

  // تحميل البيانات عند بدء التطبيق
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // استمع لتغييرات الجلسة من تبويبات أخرى
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_session_update') {
        loadUser();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [loadUser]);

  // استمع لتغييرات المصادقة
  useEffect(() => {
    const handleAuthChange = () => {
      loadUser();
    };

    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, [loadUser]);

  const value: AuthContextValue = {
    ...authState,
    login,
    logout,
    refreshUser: loadUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}