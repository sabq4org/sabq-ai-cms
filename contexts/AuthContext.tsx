'use client';

import { useState, useEffect, createContext, ReactNode } from 'react';
import Cookies from 'js-cookie';
import { jwtDecode, JwtPayload } from 'jwt-decode';

export interface User extends JwtPayload {
  id: string;
  name: string;
  email: string;
  role: string;
  is_admin?: boolean;
  loyaltyPoints?: number;
  status?: string;
  isVerified?: boolean;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUserFromCookie = () => {
    try {
      // محاولة قراءة كوكيز المستخدم أولاً (المحفوظة من API)
      const userCookie = Cookies.get('user');
      if (userCookie) {
        try {
          const userData = JSON.parse(decodeURIComponent(userCookie));
          setUser(userData);
          // مزامنة مع localStorage لضمان توفر user_id في الواجهة
          if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(userData));
            if (userData.id) {
              localStorage.setItem('user_id', String(userData.id));
            }
          }
          setLoading(false);
          return;
        } catch (error) {
          console.error("فشل في قراءة كوكيز المستخدم:", error);
        }
      }

      // إذا لم توجد كوكيز المستخدم، محاولة قراءة التوكن القديم
      const token = Cookies.get('auth-token') || Cookies.get('token');
      if (token) {
        try {
          const decodedUser = jwtDecode<User>(token);
          setUser(decodedUser);
          Cookies.set('token', token, { expires: 7, secure: true, sameSite: 'lax' });

          // مزامنة مع localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(decodedUser));
            if (decodedUser.id) {
              localStorage.setItem('user_id', String(decodedUser.id));
            }
          }
          setLoading(false);
          return;
        } catch (error) {
          console.error("فشل في معالجة التوكن عند تسجيل الدخول:", error);
          // إزالة التوكن التالف
          Cookies.remove('auth-token');
          Cookies.remove('token');
        }
      }

      // محاولة قراءة من localStorage كـ fallback
      if (typeof window !== 'undefined') {
        const localUser = localStorage.getItem('user');
        if (localUser) {
          try {
            const userData = JSON.parse(localUser);
            setUser(userData);
            setLoading(false);
            return;
          } catch (error) {
            console.error("فشل في قراءة localStorage:", error);
          }
        }
      }

      // إذا لم نجد أي بيانات مستخدم
      setUser(null);
    } catch (error) {
      console.error("خطأ في تحميل بيانات المستخدم:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadUserFromCookie();
  }, []);

  const login = (token: string) => {
    try {
      const decodedUser = jwtDecode<User>(token);
      setUser(decodedUser);
      Cookies.set('token', token, { expires: 7, secure: true, sameSite: 'lax' });
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(decodedUser));
        if (decodedUser.id) {
          localStorage.setItem('user_id', String(decodedUser.id));
        }
      }
    } catch (error) {
      console.error("فشل في معالجة التوكن عند تسجيل الدخول:", error);
    }
  };

  const logout = () => {
    setUser(null);
    // إزالة جميع الكوكيز المتعلقة بالمصادقة
    Cookies.remove('user');
    Cookies.remove('auth-token');
    Cookies.remove('token');
    
    // إزالة من localStorage أيضاً
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      localStorage.removeItem('user_id');
      sessionStorage.removeItem('user');
    }
    
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 