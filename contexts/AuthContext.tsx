'use client';

import React, { createContext, useState, useEffect, useCallback, useContext, useRef } from 'react';

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

  // مراجع لمنع سباقات التحميل والتحديث بعد فك التركيب
  const loadingRef = useRef<boolean>(false);
  const mountedRef = useRef<boolean>(true);

  // تحديث حالة المصادقة بأمان
  const updateAuthState = useCallback((user: User | null, error: string | null = null) => {
    if (!mountedRef.current) return;
    setAuthState({
      user,
      isLoggedIn: !!user,
      userId: user?.id || null,
      loading: false,
      error
    });
  }, []);

  // تحميل بيانات المستخدم مع حماية من Race Conditions
  const loadUser = useCallback(async () => {
    if (loadingRef.current) {
      // تحميل جارٍ بالفعل
      return;
    }
    loadingRef.current = true;

    try {
      // عيّن حالة التحميل فقط عند عدم وجود مستخدم
      if (!authState.user && mountedRef.current) {
        setAuthState(prev => ({ ...prev, loading: true, error: null }));
      }

      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!mountedRef.current) return;

      if (response.ok) {
        const data = await response.json();
        if (data?.success && data?.user) {
          updateAuthState(data.user);
          return;
        }
      }

      // لا يوجد مستخدم مسجل
      updateAuthState(null);
    } catch (error) {
      console.error('❌ خطأ في تحميل بيانات المستخدم:', error);
      if (mountedRef.current) {
        updateAuthState(null, 'فشل في تحميل بيانات المستخدم');
      }
    } finally {
      loadingRef.current = false;
    }
  }, [updateAuthState, authState.user]);

  // تسجيل الدخول
  const login = useCallback(async (tokenOrUser: string | User) => {
    if (typeof tokenOrUser === 'string') {
      await loadUser();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth-change', { detail: { type: 'login', source: 'token' } }));
      }
    } else {
      updateAuthState(tokenOrUser);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth-change', { detail: { type: 'login', source: 'user-object' } }));
      }
    }
  }, [updateAuthState, loadUser]);

  // تسجيل الخروج
  const logout = useCallback(() => {
    updateAuthState(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user_preferences');
      sessionStorage.clear();
      window.dispatchEvent(new CustomEvent('auth-change', { detail: { type: 'logout' } }));
    }
  }, [updateAuthState]);

  // تحميل البيانات عند بدء التطبيق (مرة واحدة مع تأخير بسيط)
  useEffect(() => {
    mountedRef.current = true;
    const timer = setTimeout(() => {
      if (mountedRef.current) {
        loadUser();
      }
    }, 100);

    return () => {
      mountedRef.current = false;
      clearTimeout(timer);
    };
  }, []);

  // الاستماع لتغييرات الجلسة من تبويبات أخرى (مع Debounce)
  useEffect(() => {
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_session_update') {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          if (mountedRef.current && !loadingRef.current) {
            loadUser();
          }
        }, 500);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadUser]);

  // الاستماع لأحداث المصادقة (مع تصفية المصدر و Debounce)
  useEffect(() => {
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    const handleAuthChange = (event: Event) => {
      const custom = event as CustomEvent;
      const detail: any = custom?.detail || {};
      const { type, source } = detail;

      // إذا كان التحديث نتيجة تمرير كائن المستخدم مباشرة، فلا حاجة لإعادة التحميل
      if (source === 'user-object') return;

      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        if (mountedRef.current && !loadingRef.current) {
          loadUser();
        }
      }, 300);
    };

    window.addEventListener('auth-change', handleAuthChange as EventListener);
    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      window.removeEventListener('auth-change', handleAuthChange as EventListener);
    };
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