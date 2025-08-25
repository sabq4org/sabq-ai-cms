'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { httpAPI } from '@/lib/http';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  is_admin: boolean;
  is_verified?: boolean;
  loyalty_points?: number;
  preferences?: any;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  error: string | null;
  serverError: boolean;
  login: (userData: User) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

const EnhancedAuthContext = createContext<AuthContextType | undefined>(undefined);

export function useEnhancedAuth() {
  const context = useContext(EnhancedAuthContext);
  if (context === undefined) {
    throw new Error('useEnhancedAuth must be used within an EnhancedAuthProvider');
  }
  return context;
}

export function EnhancedAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [serverError, setServerError] = useState(false);

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError(null);
      setServerError(false);

      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data?.success && data?.user) {
          console.log('✅ تم تحميل بيانات المستخدم:', data.user.email);
          
          // إذا كانت بيانات جزئية، أظهر تحذير
          if (data.partial) {
            setError('يتم العمل بوضع محدود - بعض الميزات قد لا تعمل');
            console.warn('⚠️ بيانات المستخدم جزئية');
          }
          
          setUser(data.user);
          return;
        }
      } else if (response.status === 401) {
        // غير مصادق - حالة طبيعية
        console.log('⚠️ لا يوجد مستخدم مسجل');
        setUser(null);
        setError(null);
        return;
      } else if (response.status >= 500) {
        // خطأ خادم - احتفظ بالمستخدم الحالي
        console.warn('⚠️ خطأ خادم - الاحتفاظ بالحالة الحالية');
        setServerError(true);
        setError('خطأ مؤقت في الخادم');
        
        if (user) {
          console.log('ℹ️ المحافظة على بيانات المستخدم الحالية');
          return; // احتفظ بالـ user الحالي
        }
        
        throw new Error(`Server error: ${response.status}`);
      } else {
        throw new Error(`HTTP error: ${response.status}`);
      }

    } catch (err: any) {
      console.error('❌ خطأ في تحميل المستخدم:', err);
      
      // فقط امسح المستخدم إذا لم يكن خطأ خادم
      if (!serverError && err.response?.status !== 500) {
        setUser(null);
      }
      
      setError(err.message || 'حدث خطأ في تحميل بيانات المستخدم');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    setError(null);
    setServerError(false);
  };

  const logout = async () => {
    try {
      await httpAPI.post('/auth/logout');
    } catch (error) {
      console.warn('⚠️ خطأ في API تسجيل الخروج:', error);
    }
    
    setUser(null);
    setError(null);
    setServerError(false);
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  const clearError = () => {
    setError(null);
    setServerError(false);
  };

  const contextValue: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: !!(user?.is_admin || user?.role === 'admin'),
    error,
    serverError,
    login,
    logout,
    refreshUser,
    clearError,
  };

  return (
    <EnhancedAuthContext.Provider value={contextValue}>
      {children}
    </EnhancedAuthContext.Provider>
  );
}
