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
      // محاولة جلب بيانات المستخدم من localStorage أولاً
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('user');
        const storedUserId = localStorage.getItem('user_id');
        
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            // التحقق من صحة البيانات
            if (userData && userData.id) {
              updateAuthState(userData);
              return;
            }
          } catch (e) {
            console.error('خطأ في تحليل بيانات المستخدم:', e);
          }
        }
        
        // إذا كان هناك user_id فقط، محاولة بناء user object أساسي
        if (storedUserId) {
          updateAuthState({
            id: storedUserId,
            email: 'user@sabq.ai', // قيمة افتراضية
            role: 'user',
            is_admin: false
          });
          return;
        }
      }

      // محاولة قراءة من الكوكيز
      const userCookie = Cookies.get('user');
      if (userCookie) {
        try {
          const userData = JSON.parse(decodeURIComponent(userCookie));
          if (userData && userData.id) {
            updateAuthState(userData);
            // مزامنة مع localStorage
            if (typeof window !== 'undefined') {
              localStorage.setItem('user', JSON.stringify(userData));
              localStorage.setItem('user_id', userData.id);
            }
            return;
          }
        } catch (e) {
          console.error('خطأ في قراءة كوكيز المستخدم:', e);
        }
      }

      // لا يوجد مستخدم
      updateAuthState(null);
    } catch (error) {
      console.error('خطأ في تحميل بيانات المستخدم:', error);
      updateAuthState(null, 'فشل في تحميل بيانات المستخدم');
    }
  }, [updateAuthState]);

  // تسجيل الدخول
  const login = useCallback((user: User) => {
    updateAuthState(user);
    
    // حفظ في localStorage و Cookies
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('user_id', user.id);
      Cookies.set('user', JSON.stringify(user), { expires: 7 });
    }
  }, [updateAuthState]);

  // تسجيل الخروج
  const logout = useCallback(() => {
    updateAuthState(null);
    
    // مسح جميع البيانات
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      localStorage.removeItem('user_id');
      localStorage.removeItem('user_preferences');
      sessionStorage.clear();
    }
    
    Cookies.remove('user');
    Cookies.remove('auth-token');
    Cookies.remove('token');
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