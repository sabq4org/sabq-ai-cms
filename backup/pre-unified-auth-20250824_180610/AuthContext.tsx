'use client';

import React, { createContext, useState, useEffect, useCallback, useContext, useRef } from 'react';
import { api, checkSession } from '@/lib/api-client';

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
  const lastLoadTimeRef = useRef<number>(0);

  // تحديث حالة المصادقة بأمان
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

  // تحميل بيانات المستخدم مع حماية من Race Conditions وDebouncing
  const loadUser = useCallback(async (force = false) => {
    const now = Date.now();
    const timeSinceLastLoad = now - lastLoadTimeRef.current;
    
    // تجنب التحميل المتكرر (debounce: 2 ثانية)
    if (!force && timeSinceLastLoad < 2000) {
      console.log('⏰ تجنب التحميل المتكرر - آخر تحميل كان منذ', timeSinceLastLoad, 'ms');
      return;
    }

    if (loadingRef.current && !force) {
      console.log('⏳ تحميل جاري بالفعل...');
      return;
    }

    loadingRef.current = true;
    lastLoadTimeRef.current = now;

    try {
      console.log('🔍 بدء تحميل بيانات المستخدم...');
      
      // عيّن حالة التحميل فقط عند عدم وجود مستخدم أو عند الإجبار
      if ((!authState.user || force) && mountedRef.current) {
        setAuthState(prev => ({ ...prev, loading: true, error: null }));
      }

      // استخدام دالة فحص الجلسة المحسّنة
      const isValidSession = await checkSession();
      
      if (!isValidSession) {
        console.log('❌ جلسة غير صالحة');
        updateAuthState(null);
        return;
      }

      // الحصول على بيانات المستخدم
      const data = await api.get('/auth/me');

      if (!mountedRef.current) return;

      if (data?.success && data?.user) {
        console.log('✅ تم تحميل بيانات المستخدم:', data.user.email);
        updateAuthState(data.user);
        return;
      }

      console.log('⚠️ لا يوجد مستخدم مسجل');
      updateAuthState(null);
      
    } catch (error: any) {
      console.error('❌ خطأ في تحميل بيانات المستخدم:', {
        message: error.message,
        status: error.response?.status,
        code: error.code
      });
      
      if (mountedRef.current) {
        // التعامل مع أنواع الأخطاء المختلفة
        if (error.response?.status === 401) {
          console.log('🔐 جلسة منتهية الصلاحية');
          updateAuthState(null, null); // لا نعرض خطأ للمستخدم
        } else if (error.code === 'NETWORK_ERROR' || error.message.includes('timeout')) {
          console.log('🌐 خطأ في الشبكة - إبقاء الحالة الحالية');
          // لا نغير الحالة في حالة خطأ الشبكة
          setAuthState(prev => ({ ...prev, loading: false }));
        } else {
          updateAuthState(null, 'فشل في تحميل بيانات المستخدم');
        }
      }
    } finally {
      loadingRef.current = false;
    }
  }, [updateAuthState, authState.user]);

  // تسجيل الدخول
  const login = useCallback(async (tokenOrUser: string | User) => {
    console.log('🔐 عملية تسجيل الدخول...');
    
    if (typeof tokenOrUser === 'string') {
      // إذا كان token، قم بتحميل بيانات المستخدم
      await loadUser(true);
      
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth-change', { 
          detail: { type: 'login', source: 'token' } 
        }));
      }
    } else {
      // إذا كان user object، استخدمه مباشرة
      updateAuthState(tokenOrUser);
      
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth-change', { 
          detail: { type: 'login', source: 'user-object' } 
        }));
      }
    }
  }, [updateAuthState, loadUser]);

  // تسجيل الخروج
  const logout = useCallback(async () => {
    console.log('👋 عملية تسجيل الخروج...');
    
    try {
      // استدعاء API تسجيل الخروج لمسح الكوكيز
      await api.post('/auth/logout');
    } catch (error) {
      console.warn('⚠️ خطأ في API تسجيل الخروج (غير حاسم):', error);
    }
    
    // تنظيف الحالة المحلية
    updateAuthState(null);
    
    if (typeof window !== 'undefined') {
      // تنظيف localStorage و sessionStorage
      ['user_preferences', 'auth-token', 'user'].forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });
      
      // إطلاق حدث تسجيل الخروج
      window.dispatchEvent(new CustomEvent('auth-change', { 
        detail: { type: 'logout' } 
      }));
    }
  }, [updateAuthState]);

  // تحميل البيانات عند بدء التطبيق (مع تأخير للاستقرار)
  useEffect(() => {
    mountedRef.current = true;
    
    const timer = setTimeout(() => {
      if (mountedRef.current) {
        console.log('🚀 تحميل أولي لبيانات المستخدم...');
        loadUser();
      }
    }, 500); // تأخير أطول للاستقرار

    return () => {
      mountedRef.current = false;
      clearTimeout(timer);
    };
  }, []);

  // الاستماع لتغييرات الجلسة من تبويبات أخرى مع Debounce
  useEffect(() => {
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_session_update' || e.key === 'user') {
        console.log('💾 تغيير في localStorage:', e.key);
        
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          if (mountedRef.current && !loadingRef.current) {
            console.log('🔄 إعادة تحميل بسبب تغيير localStorage');
            loadUser();
          }
        }, 1000);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadUser]);

  // الاستماع لأحداث المصادقة مع تصفية المصدر وDebounce
  useEffect(() => {
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    
    const handleAuthChange = (event: Event) => {
      const custom = event as CustomEvent;
      const detail: any = custom?.detail || {};
      const { type, source } = detail;

      console.log('🎯 حدث تغيير المصادقة:', type, source);

      // إذا كان التحديث نتيجة تمرير user object مباشرة، فلا حاجة لإعادة التحميل
      if (source === 'user-object') {
        console.log('ℹ️ تجاهل إعادة التحميل - مصدر user object');
        return;
      }

      // تجاهل أحداث تجديد التوكن إذا كان المستخدم مسجل دخول بالفعل
      if (type === 'token-refreshed' && authState.user) {
        console.log('ℹ️ تجاهل تجديد التوكن - المستخدم مسجل دخول');
        return;
      }

      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        if (mountedRef.current && !loadingRef.current) {
          console.log('🔄 إعادة تحميل بسبب حدث المصادقة:', type);
          loadUser(true);
        }
      }, 500);
    };

    window.addEventListener('auth-change', handleAuthChange as EventListener);
    
    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      window.removeEventListener('auth-change', handleAuthChange as EventListener);
    };
  }, [loadUser, authState.user]);

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