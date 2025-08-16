"use client";

import Cookies from "js-cookie";
import { jwtDecode, JwtPayload } from "jwt-decode";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

export interface User extends JwtPayload {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  is_admin?: boolean;
  loyaltyPoints?: number;
  status?: string;
  isVerified?: boolean;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

// Hook لاستخدام AuthContext
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // في البيئة المحلية، أعطي تحذير بدلاً من خطأ
    if (process.env.NODE_ENV === "development") {
      console.warn("useAuth must be used within an AuthProvider");
      return {
        user: null,
        loading: false,
        isAuthenticated: false,
        login: () => {},
        logout: () => {},
        refreshUser: async () => {},
      };
    }
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserFromAPI = async (): Promise<User | null> => {
    try {
      const token = Cookies.get("auth-token");
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const response = await fetch("/api/auth/me", {
        headers,
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          return data.user;
        }
      }
      return null;
    } catch (error) {
      console.error("خطأ في جلب بيانات المستخدم من API:", error);
      return null;
    }
  };

  const loadUserFromCookie = async () => {
    try {
      // محاولة جلب بيانات المستخدم من API أولاً
      const userData = await fetchUserFromAPI();
      if (userData) {
        setUser(userData);
        // مزامنة مع localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(userData));
          if (userData.id) {
            localStorage.setItem("user_id", String(userData.id));
          }
        }
        setLoading(false);
        return;
      }

      // إذا فشل API، محاولة قراءة من الكوكيز كـ fallback
      // أمان: لا تعتمد على Cookie 'user' كمصدر مصادقة

      // إذا لم نجد أي بيانات مستخدم، تنظيف localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("user");
        localStorage.removeItem("user_id");
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

  const login = async (token: string) => {
    try {
      console.log('🔑 بدء تسجيل الدخول بالتوكن');
      
      // حفظ التوكن أولاً
      Cookies.set("auth-token", token, {
        expires: 7,
        secure: process.env.NODE_ENV === 'production',
        sameSite: "lax",
      });
      
      // جلب بيانات المستخدم من API
      const userData = await fetchUserFromAPI();
      if (userData) {
        setUser(userData);
        console.log('✅ تم تسجيل الدخول بنجاح:', userData.name);
        
        // حفظ في localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(userData));
          if (userData.id) {
            localStorage.setItem("user_id", String(userData.id));
          }
        }
      } else {
        // إذا فشل جلب البيانات، جرب decode التوكن كبديل
        const decodedUser = jwtDecode<User>(token);
        setUser(decodedUser);
        console.log('⚠️ تم استخدام decode كبديل');
      }
      
      setLoading(false);
    } catch (error) {
      console.error("فشل في معالجة التوكن عند تسجيل الدخول:", error);
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // استدعاء API تسجيل الخروج
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("خطأ في تسجيل الخروج:", error);
    }

    setUser(null);
    // إزالة جميع الكوكيز المتعلقة بالمصادقة
    Cookies.remove("user");
    Cookies.remove("auth-token");
    Cookies.remove("token");

    // إزالة من localStorage أيضاً
    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
      localStorage.removeItem("user_id");
      localStorage.removeItem("user_preferences");
      localStorage.removeItem("darkMode");
      sessionStorage.removeItem("user");
      sessionStorage.clear(); // تنظيف جميع بيانات الجلسة
    }

    window.location.href = "/"; // العودة للصفحة الرئيسية بدلاً من صفحة تسجيل الدخول
  };

  const refreshUser = async () => {
    const userData = await fetchUserFromAPI();
    if (userData) {
      setUser(userData);
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(userData));
        if (userData.id) {
          localStorage.setItem("user_id", String(userData.id));
        }
      }
    } else {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
