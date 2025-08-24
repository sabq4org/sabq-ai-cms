'use client';

import React, { createContext, useState, useEffect, useCallback, useContext, useRef } from 'react';
import { httpAPI } from '@/lib/http';
import { getAccessToken, setAccessTokenInMemory, clearSession, validateSession, loadTokenFromCookies, validateTokenFromCookies } from '@/lib/authClient';
import { getUserFromCookies, hasAuthCookie, clearAuthCookies } from '@/lib/cookieAuth';

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
  
  // Rate Limiting للمصادقة
  const retryCountRef = useRef<number>(0);
  const lastFailureRef = useRef<number>(0);
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 5000; // 5 ثوان
  const FAILURE_COOLDOWN = 30000; // 30 ثانية

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

  // تحديث حالة المصادقة من الكوكيز مباشرة
  const loadUserFromCookies = useCallback(() => {
    console.log('🍪 محاولة قراءة المستخدم من الكوكيز...');
    
    const { user, token } = getUserFromCookies();
    
    if (user && token) {
      console.log('✅ تم العثور على مستخدم في الكوكيز:', user.email);
      
      // تحديث التوكن في الذاكرة
      setAccessTokenInMemory(token);
      
      // تحديث حالة المصادقة
      updateAuthState(user);
      
      return user;
    } else {
      console.log('❌ لم يتم العثور على مستخدم صالح في الكوكيز');
      
      // محاولة أخيرة: استخدام authClient للتحقق من التوكن
      if (validateTokenFromCookies()) {
        console.log('🔄 تم العثور على توكن صالح في authClient، سنحاول تحميل المستخدم من API');
        return 'token-found'; // إشارة لتحميل من API
      }
      
      return null;
    }
  }, [updateAuthState]);

  // تحميل بيانات المستخدم مع حماية من Race Conditions وRate Limiting
  const loadUser = useCallback(async (force = false) => {
    const now = Date.now();
    const timeSinceLastLoad = now - lastLoadTimeRef.current;
    
    // منع الاستدعاءات المتزامنة
    if (loadingRef.current && !force) {
      console.log('⏳ تحميل جاري بالفعل...');
      return;
    }

    // فحص Rate Limiting
    if (retryCountRef.current >= MAX_RETRIES && !force) {
      const timeSinceLastFailure = now - lastFailureRef.current;
      if (timeSinceLastFailure < FAILURE_COOLDOWN) {
        console.log(`⏳ تم تجاوز الحد الأقصى للمحاولات. انتظار ${Math.ceil((FAILURE_COOLDOWN - timeSinceLastFailure) / 1000)} ثانية`);
        return;
      } else {
        // إعادة تعيين العداد بعد انتهاء فترة الانتظار
        retryCountRef.current = 0;
        console.log('🔄 إعادة تعيين عداد المحاولات');
      }
    }
    
    // تجنب التحميل المتكرر (debounce: 2 ثانية)
    if (!force && timeSinceLastLoad < 2000) {
      console.log('⏰ تجنب التحميل المتكرر - آخر تحميل كان منذ', timeSinceLastLoad, 'ms');
      return;
    }

    loadingRef.current = true;
    lastLoadTimeRef.current = now;

    try {
      console.log(`🔍 بدء تحميل بيانات المستخدم (${retryCountRef.current + 1}/${MAX_RETRIES})...`);
      
      // أولاً: محاولة قراءة من الكوكيز إذا لم نكن نجبر إعادة التحميل
      if (!force) {
        const cookieResult = loadUserFromCookies();
        if (cookieResult && cookieResult !== 'token-found') {
          loadingRef.current = false;
          return;
        }
        
        // إذا وُجد توكن في الكوكيز لكن بدون معلومات مستخدم، استمر للـ API
        if (cookieResult === 'token-found') {
          console.log('🔄 توكن موجود، تحميل معلومات المستخدم من API...');
        }
      }
      
      // عيّن حالة التحميل فقط عند عدم وجود مستخدم أو عند الإجبار
      if ((!authState.user || force) && mountedRef.current) {
        setAuthState(prev => ({ ...prev, loading: true, error: null }));
      }

      // استخدام دالة فحص الجلسة المحسّنة
      const isValidSession = await validateSession();
      
      if (!isValidSession) {
        console.log('❌ جلسة غير صالحة - إعادة تعيين العداد');
        retryCountRef.current = 0; // إعادة تعيين عند عدم وجود جلسة
        updateAuthState(null);
        return;
      }

      // الحصول على بيانات المستخدم باستخدام fetch مباشرة
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
          updateAuthState(data.user);
          retryCountRef.current = 0; // إعادة تعيين العداد عند النجاح
          return;
        }
      } else if (response.status === 401) {
        console.log('⚠️ لا يوجد مستخدم مسجل - إعادة تعيين العداد');
        retryCountRef.current = 0;
        updateAuthState(null);
        return;
      }

      console.log('⚠️ لا يوجد مستخدم مسجل');
      retryCountRef.current = 0;
      updateAuthState(null);
      
    } catch (error: any) {
      console.error('❌ خطأ في تحميل بيانات المستخدم:', {
        message: error.message,
        status: error.response?.status,
        code: error.code
      });
      
      if (!mountedRef.current) return;
      
      retryCountRef.current++;
      lastFailureRef.current = now;
      
      if (retryCountRef.current >= MAX_RETRIES) {
        console.error(`❌ تم تجاوز الحد الأقصى للمحاولات (${MAX_RETRIES})`);
        setAuthState(prev => ({ 
          ...prev, 
          loading: false, 
          error: 'فشل في تحميل بيانات المستخدم',
          user: null,
          isLoggedIn: false,
          userId: null 
        }));
        loadingRef.current = false;
      } else {
        // التعامل مع أنواع الأخطاء المختلفة  
        if (error.response?.status === 401) {
          console.log('🔐 جلسة منتهية الصلاحية - إعادة تعيين العداد');
          retryCountRef.current = 0;
          updateAuthState(null);
          loadingRef.current = false;
        } else if (error.code === 'NETWORK_ERROR' || error.message.includes('timeout')) {
          console.log(`🌐 خطأ في الشبكة - إعادة المحاولة خلال ${RETRY_DELAY / 1000} ثانية...`);
          setTimeout(() => {
            if (mountedRef.current) {
              loadUser(true);
            }
          }, RETRY_DELAY);
          return; // لا نغير loading إلى false
        } else {
          console.log(`⏳ إعادة المحاولة خلال ${RETRY_DELAY / 1000} ثانية...`);
          setTimeout(() => {
            if (mountedRef.current) {
              loadUser(true);
            }
          }, RETRY_DELAY);
          return; // لا نغير loading إلى false
        }
      }
    } finally {
      // تعيين loading إلى false فقط إذا لم نكن ننتظر إعادة المحاولة
      if (retryCountRef.current >= MAX_RETRIES || retryCountRef.current === 0) {
        loadingRef.current = false;
      }
    }
  }, [updateAuthState, authState.user, loadUserFromCookies]);

  // تسجيل الدخول
  const login = useCallback(async (tokenOrUser: string | User) => {
    console.log('🔐 عملية تسجيل الدخول...');
    
    if (typeof tokenOrUser === 'string') {
      // إذا كان token، حفظه في الذاكرة وحاول قراءة المستخدم من الكوكيز أولاً
      setAccessTokenInMemory(tokenOrUser);
      
      // محاولة قراءة من الكوكيز أولاً
      const cookieResult = loadUserFromCookies();
      
      if (!cookieResult || cookieResult === 'token-found') {
        // إذا فشل قراءة الكوكيز أو وُجد توكن بدون معلومات مستخدم، حمل من API
        await loadUser(true);
      }
      
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
  }, [updateAuthState, loadUser, loadUserFromCookies]);

  // تسجيل الخروج
  const logout = useCallback(async () => {
    console.log('👋 عملية تسجيل الخروج...');
    
    try {
      // استدعاء API تسجيل الخروج لمسح الكوكيز
      await httpAPI.post('/auth/logout');
    } catch (error) {
      console.warn('⚠️ خطأ في API تسجيل الخروج (غير حاسم):', error);
    }
    
    // تنظيف الحالة المحلية
    updateAuthState(null);
    
    // تنظيف كوكيز المصادقة
    clearAuthCookies();
    
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
    
    // أولاً: محاولة قراءة من الكوكيز فوراً (بدون تأخير)
    if (hasAuthCookie()) {
      console.log('🚀 تحميل فوري من الكوكيز...');
      loadUserFromCookies();
    }
    
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
  }, [loadUserFromCookies]); // إضافة dependency

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

      // ⛔ إيقاف إعادة التحميل عند token-refreshed (حسب البرومنت)
      // لكن تحديث حالة المستخدم إذا لزم الأمر
      if (type === 'token-refreshed') {
        console.log('ℹ️ تجديد التوكن - تحديث طابع التوكن فقط (بدون إعادة تحميل)');
        
        // تحديث timestamp للمستخدم إذا كان موجود
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

      // معالجة انتهاء الجلسة فقط
      if (type === 'session-expired' || type === 'auth-expired') {
        console.log('🚪 انتهت الجلسة - تنظيف البيانات');
        clearSession();
        updateAuthState(null);
        return;
      }

      // أحداث أخرى (logout, etc.)
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