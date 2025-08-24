'use client';

import { useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';

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

export function useAuth() {
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
  const login = useCallback((user: User) => {
    updateAuthState(user);
    // لا نحتاج لتخزين أي بيانات محلياً
    // الكوكيز الآمنة ستتولى كل شيء
  }, [updateAuthState]);

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

  return {
    ...authState,
    login,
    logout,
    refreshUser: loadUser
  };
} 