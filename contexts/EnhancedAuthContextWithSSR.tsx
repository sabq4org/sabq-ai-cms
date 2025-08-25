'use client';

import React, { createContext, useState, useEffect, useCallback, useContext, useRef } from 'react';
import { httpAPI } from '@/lib/http';
import { getAccessToken, setAccessTokenInMemory, clearSession, validateSession } from '@/lib/authClient';

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
  partial?: boolean;
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

export function AuthProvider({ children, initialUser }: { children: React.ReactNode; initialUser?: User | null }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: initialUser || null,
    isLoggedIn: !!initialUser,
    userId: initialUser?.id || null,
    loading: !initialUser,
    error: null
  });

  const mountedRef = useRef<boolean>(true);
  const loadingRef = useRef<boolean>(false);
  const lastLoadTimeRef = useRef<number>(0);
  const retryCountRef = useRef<number>(0);
  const lastFailureRef = useRef<number>(0);
  
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 5000;
  const FAILURE_COOLDOWN = 30000;

  const updateAuthState = useCallback((user: User | null, error: string | null = null) => {
    if (!mountedRef.current) return;
    
    console.log('🔄 تحديث حالة المصادقة:', user ? user.email : 'null');
    
    setAuthState({
      user,
      isLoggedIn: !!user,
      userId: user?.id || null,
      loading: false,
      error
    });
  }, []);

  const loadUser = useCallback(async (force = false, isBackgroundCheck = false) => {
    const now = Date.now();
    const timeSinceLastLoad = now - lastLoadTimeRef.current;

    if (loadingRef.current && !force) {
      console.log('⚠️ تحميل قيد التنفيذ - تجاهل الطلب');
      return;
    }

    if (retryCountRef.current >= MAX_RETRIES && !force) {
      const timeSinceLastFailure = now - lastFailureRef.current;
      if (timeSinceLastFailure < FAILURE_COOLDOWN) {
        console.log(`⏳ في فترة انتظار (${Math.round((FAILURE_COOLDOWN - timeSinceLastFailure) / 1000)}s)`);
        return;
      }
      retryCountRef.current = 0;
    }

    if (timeSinceLastLoad < 1000 && !force) {
      console.log('⚠️ طلب حديث جداً - تجاهل');
      return;
    }

    lastLoadTimeRef.current = now;
    loadingRef.current = true;

    console.log(`🔍 بدء تحميل بيانات المستخدم (${retryCountRef.current + 1}/${MAX_RETRIES})${isBackgroundCheck ? ' (فحص خلفي)' : ''}...`);

    if (!isBackgroundCheck && (!authState.user || force) && mountedRef.current) {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
    }

    try {
      const isValidSession = await validateSession();
      
      if (!isValidSession) {
        console.log('❌ جلسة غير صالحة - إعادة تعيين العداد');
        retryCountRef.current = 0;
        if (!isBackgroundCheck) {
          updateAuthState(null);
        }
        return;
      }

      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!mountedRef.current) return;

      if (response.ok) {
        const data = await response.json();
        if (data?.success && data?.user) {
          console.log('✅ تم تحميل بيانات المستخدم:', data.user.email);
          
          if (data.partial && !isBackgroundCheck) {
            console.warn('⚠️ بيانات المستخدم جزئية - تعمل بـ fallback من التوكن');
          }
          
          updateAuthState(data.user);
          retryCountRef.current = 0;
          return;
        }
      } else if (response.status === 401) {
        console.log('⚠️ لا يوجد مستخدم مسجل - إعادة تعيين العداد');
        retryCountRef.current = 0;
        if (!isBackgroundCheck) {
          updateAuthState(null);
        }
        return;
      } else if (response.status >= 500) {
        // خطأ خادم - احتفظ بالمستخدم الحالي في الفحص الخلفي
        console.warn(`⚠️ خطأ خادم (${response.status}) - ${isBackgroundCheck ? 'تجاهل في الفحص الخلفي' : 'الاحتفاظ بالحالة الحالية'}`);
        
        if (isBackgroundCheck && authState.user) {
          console.log('ℹ️ المحافظة على بيانات المستخدم أثناء فحص خلفي فاشل');
          return;
        }
        
        if (authState.user && !isBackgroundCheck) {
          setAuthState(prev => ({ ...prev, loading: false, error: 'خطأ في الخادم' }));
          loadingRef.current = false;
          return;
        }
        
        throw new Error(`Server error: ${response.status}`);
      }

      console.log('⚠️ لا يوجد مستخدم مسجل');
      retryCountRef.current = 0;
      if (!isBackgroundCheck) {
        updateAuthState(null);
      }
      
    } catch (error: any) {
      console.error('❌ خطأ في تحميل بيانات المستخدم:', {
        message: error.message,
        status: error.response?.status,
        code: error.code
      });
      
      if (!mountedRef.current) return;
      
      if (!isBackgroundCheck) {
        retryCountRef.current++;
        lastFailureRef.current = now;
        
        if (error.response?.status === 401) {
          console.log('🔐 جلسة منتهية الصلاحية - إعادة تعيين العداد');
          retryCountRef.current = 0;
          updateAuthState(null);
          loadingRef.current = false;
        } else if (error.response?.status >= 500 && authState.user) {
          console.log('🔴 خطأ خادم - الاحتفاظ بالحالة الحالية');
          setAuthState(prev => ({ ...prev, loading: false, error: 'خطأ في الخادم - جاري المحاولة مرة أخرى' }));
          loadingRef.current = false;
          
          setTimeout(() => {
            if (mountedRef.current && retryCountRef.current < MAX_RETRIES) {
              console.log('🔄 إعادة المحاولة بعد خطأ خادم...');
              loadUser(true, true);
            }
          }, RETRY_DELAY * 2);
          return;
        } else if (error.code === 'NETWORK_ERROR' || error.message.includes('timeout')) {
          console.log(`🌐 خطأ في الشبكة - إعادة المحاولة خلال ${RETRY_DELAY / 1000} ثانية...`);
          setTimeout(() => {
            if (mountedRef.current) {
              loadUser(true, isBackgroundCheck);
            }
          }, RETRY_DELAY);
          return;
        }
      }
    } finally {
      if (retryCountRef.current >= MAX_RETRIES || retryCountRef.current === 0) {
        loadingRef.current = false;
      }
    }
  }, [updateAuthState, authState.user]);

  const login = useCallback(async (tokenOrUser: string | User) => {
    console.log('🔐 عملية تسجيل الدخول...');
    
    if (typeof tokenOrUser === 'string') {
      await loadUser(true);
      
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth-change', { 
          detail: { type: 'login', source: 'token' } 
        }));
      }
    } else {
      updateAuthState(tokenOrUser);
      
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth-change', { 
          detail: { type: 'login', source: 'user-object' } 
        }));
      }
    }
  }, [updateAuthState, loadUser]);

  const logout = useCallback(async () => {
    console.log('👋 عملية تسجيل الخروج...');
    
    try {
      await httpAPI.post('/auth/logout');
    } catch (error) {
      console.warn('⚠️ خطأ في API تسجيل الخروج (غير حاسم):', error);
    }
    
    updateAuthState(null);
    
    if (typeof window !== 'undefined') {
      ['user_preferences', 'auth-token', 'user'].forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });
      
      window.dispatchEvent(new CustomEvent('auth-change', { 
        detail: { type: 'logout' } 
      }));
    }
  }, [updateAuthState]);

  // تحميل البيانات عند بدء التطبيق
  useEffect(() => {
    mountedRef.current = true;
    
    const delay = initialUser ? 1000 : 500;
    
    const timer = setTimeout(() => {
      if (mountedRef.current) {
        if (initialUser) {
          console.log('🚀 تحميل أولي مع initialUser:', initialUser.email, initialUser.partial ? '(partial)' : '(full)');
          loadUser(true, true);
        } else {
          console.log('🚀 تحميل أولي بدون initialUser...');
          loadUser();
        }
      }
    }, delay);

    return () => {
      mountedRef.current = false;
      clearTimeout(timer);
    };
  }, [initialUser, loadUser]);

  // الاستماع لأحداث المصادقة
  useEffect(() => {
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    
    const handleAuthChange = (event: Event) => {
      const custom = event as CustomEvent;
      const detail: any = custom?.detail || {};
      const { type, source } = detail;

      console.log('🎯 حدث تغيير المصادقة:', type, source);

      if (source === 'user-object') {
        console.log('ℹ️ تجاهل إعادة التحميل - مصدر user object');
        return;
      }

      if (type === 'token-refreshed') {
        console.log('ℹ️ تجديد التوكن - تحديث طابع التوكن فقط (بدون إعادة تحميل)');
        
        if (authState.user && detail.userVersion) {
          setAuthState(prev => ({
            ...prev,
            user: prev.user ? {
              ...prev.user,
              updated_at: new Date().toISOString()
            } : null
          }));
        }
        
        return;
      }

      if (type === 'session-expired' || type === 'auth-expired') {
        console.log('🚪 انتهت الجلسة - تنظيف البيانات');
        clearSession();
        updateAuthState(null);
        return;
      }

      if (['logout', 'session-cleared'].includes(type)) {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          if (mountedRef.current && !loadingRef.current) {
            console.log('🔄 إعادة تحميل بسبب حدث المصادقة:', type);
            loadUser(true);
          }
        }, 500);
      }
    };

    window.addEventListener('auth-change', handleAuthChange as EventListener);
    
    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      window.removeEventListener('auth-change', handleAuthChange as EventListener);
    };
  }, [loadUser, authState.user, updateAuthState]);

  const value: AuthContextValue = {
    ...authState,
    login,
    logout,
    refreshUser: () => loadUser(true)
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
