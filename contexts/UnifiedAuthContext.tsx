"use client";

/**
 * نظام مصادقة موحد يحل تضارب الأنظمة المختلفة
 * يدعم كل من المستخدمين العاديين والإداريين
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  is_admin: boolean;
  is_verified?: boolean;
  reputation?: number;
  badges?: string[];
  memberSince?: string;
  totalComments?: number;
  totalLikes?: number;
  preferred_language?: string;
  loyalty_points?: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (userData: User) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
}

const UnifiedAuthContext = createContext<AuthContextType | undefined>(undefined);

export function useUnifiedAuth() {
  const context = useContext(UnifiedAuthContext);
  if (context === undefined) {
    // في البيئة المحلية، إرجاع قيم افتراضية بدلاً من خطأ
    if (process.env.NODE_ENV === "development") {
      console.warn("useUnifiedAuth must be used within UnifiedAuthProvider");
      return {
        user: null,
        loading: false,
        isAuthenticated: false,
        isAdmin: false,
        login: () => {},
        logout: async () => {},
        refreshUser: async () => {},
        updateUser: () => {},
      };
    }
    throw new Error("useUnifiedAuth must be used within UnifiedAuthProvider");
  }
  return context;
}

export function UnifiedAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // جلب بيانات المستخدم من الخادم
  const fetchUserFromServer = useCallback(async (): Promise<User | null> => {
    try {
      // المحاولة الأولى: API الرئيسي للمصادقة
      const authResponse = await fetch("/api/auth/me", { 
        credentials: "include", 
        cache: 'no-store' 
      });
      
      if (authResponse.ok) {
        const authData = await authResponse.json();
        if (authData.success && authData.user) {
          return authData.user;
        }
      }

      // المحاولة الثانية: API المستخدمين
      const userResponse = await fetch("/api/user/me", { 
        credentials: "include", 
        cache: 'no-store' 
      });
      
      if (userResponse.ok) {
        const userData = await userResponse.json();
        if (userData && userData.id) {
          return userData;
        }
      }

      // المحاولة الثالثة: فحص الكوكيز المحلية
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('user');
        const storedUserId = localStorage.getItem('user_id');
        
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser && parsedUser.id) {
              // التحقق من صحة الجلسة
              const validationResponse = await fetch(`/api/users/${parsedUser.id}`, {
                credentials: "include"
              });
              
              if (validationResponse.ok) {
                const validatedData = await validationResponse.json();
                return validatedData.user || parsedUser;
              }
              
              return parsedUser;
            }
          } catch (e) {
            console.error('خطأ في تحليل بيانات المستخدم المحفوظة:', e);
          }
        }
        
        // إذا كان هناك user_id فقط
        if (storedUserId && storedUserId !== 'anonymous') {
          try {
            const userResponse = await fetch(`/api/users/${storedUserId}`, {
              credentials: "include"
            });
            
            if (userResponse.ok) {
              const userData = await userResponse.json();
              return userData.user;
            }
          } catch (e) {
            console.error('خطأ في جلب بيانات المستخدم:', e);
          }
        }
      }

      return null;
    } catch (error) {
      console.error('خطأ في جلب بيانات المستخدم من الخادم:', error);
      return null;
    }
  }, []);

  // تحديث بيانات المستخدم
  const refreshUser = useCallback(async () => {
    setLoading(true);
    try {
      const userData = await fetchUserFromServer();
      setUser(userData);
      
      // مزامنة مع التخزين المحلي
      if (typeof window !== 'undefined') {
        if (userData) {
          localStorage.setItem('user', JSON.stringify(userData));
          localStorage.setItem('user_id', userData.id);
          localStorage.setItem('user_email', userData.email);
        } else {
          localStorage.removeItem('user');
          localStorage.removeItem('user_id');
          localStorage.removeItem('user_email');
        }
      }
    } catch (error) {
      console.error('خطأ في تحديث بيانات المستخدم:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [fetchUserFromServer]);

  // تسجيل الدخول
  const login = useCallback((userData: User) => {
    setUser(userData);
    
    // حفظ في التخزين المحلي
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('user_id', userData.id);
      localStorage.setItem('user_email', userData.email);
    }
  }, []);

  // تسجيل الخروج
  const logout = useCallback(async () => {
    try {
      // إرسال طلب تسجيل الخروج للخادم
      await fetch('/api/auth/logout', { 
        method: 'POST', 
        credentials: 'include' 
      });
    } catch (error) {
      console.error('خطأ في تسجيل الخروج:', error);
    }

    // مسح البيانات المحلية
    setUser(null);
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      localStorage.removeItem('user_id');
      localStorage.removeItem('user_email');
      localStorage.removeItem('user_preferences');
      sessionStorage.clear();
      
      // مسح جميع الكوكيز المتعلقة بالمصادقة
      document.cookie.split(";").forEach((c) => {
        const eqPos = c.indexOf("=");
        const name = eqPos > -1 ? c.substr(0, eqPos) : c;
        const cookieName = name.trim();
        
        // مسح الكوكيز المتعلقة بالمصادقة
        if (cookieName.includes('auth') || 
            cookieName.includes('token') || 
            cookieName.includes('sabq') ||
            cookieName === 'user') {
          document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
          document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.sabq.io`;
        }
      });
    }
  }, []);

  // تحديث بيانات المستخدم جزئياً
  const updateUser = useCallback((updates: Partial<User>) => {
    setUser(prev => {
      if (!prev) return null;
      
      const updatedUser = { ...prev, ...updates };
      
      // مزامنة مع التخزين المحلي
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
      return updatedUser;
    });
  }, []);

  // تحميل بيانات المستخدم عند بدء التطبيق
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // مراقبة تغييرات التخزين المحلي (للمزامنة بين التبويبات)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user' || e.key === 'user_id') {
        if (e.newValue) {
          try {
            const userData = JSON.parse(e.newValue);
            setUser(userData);
          } catch (error) {
            console.error('خطأ في تحليل بيانات المستخدم من التخزين:', error);
          }
        } else {
          setUser(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const contextValue: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: !!(user?.is_admin || user?.role === 'admin'),
    login,
    logout,
    refreshUser,
    updateUser,
  };

  return (
    <UnifiedAuthContext.Provider value={contextValue}>
      {children}
    </UnifiedAuthContext.Provider>
  );
}

// Hook للتوافق مع الأنظمة القديمة
export function useAuth() {
  return useUnifiedAuth();
}

// Hook للتوافق مع نظام التعليقات
export function useUser() {
  const { user, loading, updateUser } = useUnifiedAuth();
  
  return {
    user,
    isLoading: loading,
    updateUser,
    isAuthenticated: !!user
  };
}
