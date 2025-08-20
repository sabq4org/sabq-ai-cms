"use client";

import Cookies from "js-cookie";
import { jwtDecode, JwtPayload } from "jwt-decode";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
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
  // يمنع تكرار التنفيذ في وضع التطوير (React StrictMode)
  const didInitRef = useRef(false);

  const fetchUserFromAPI = async (): Promise<User | null> => {
    // لا نعتمد على auth-token غير الآمن، نستخدم الكوكيز HttpOnly فقط عبر credentials: 'include'
    const headers: Record<string, string> = {};

    // المحاولة الأولى: /api/auth/me
    try {
      const resp = await fetch("/api/auth/me", { headers, credentials: "include", cache: 'no-store' });
      if (resp.ok) {
        const data = await resp.json();
        if (data.success && data.user) return data.user;
      }
    } catch (err) {
      console.log("خطأ في جلب بيانات المستخدم من API:", err);
    }

    // المحاولة الثانية: /api/user/me
    try {
      const resp2 = await fetch("/api/user/me", { headers, credentials: "include", cache: 'no-store' });
      if (resp2.ok) {
        const data2 = await resp2.json();
        if (data2 && (data2.id || (data2.success && data2.id))) {
          return {
            id: data2.id,
            name: data2.name || "مستخدم",
            email: data2.email || "",
            role: data2.role || "user",
            is_admin: data2.isAdmin || data2.is_admin || false,
            isVerified: data2.isVerified || data2.is_verified || false,
          } as User;
        }
      }
    } catch (err2) {
      console.log("خطأ في جلب بيانات المستخدم من /api/user/me:", err2);
    }

    // لا مزيد من fallback إلى Cookie 'user' كمصدر مصادقة

    return null;
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
    if (didInitRef.current) return;
    didInitRef.current = true;
    loadUserFromCookie();
    // تجديد صامت دوري + إعادة تحقق عند التركيز والاتصال
    let refreshInterval: any;
    const doSilentRefresh = async () => {
      try {
        await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' });
        await refreshUser();
      } catch {}
    };
    refreshInterval = setInterval(doSilentRefresh, 10 * 60 * 1000); // كل 10 دقائق
    const onFocus = () => refreshUser();
    const onReconnect = () => refreshUser();
    window.addEventListener('focus', onFocus);
    window.addEventListener('online', onReconnect);
    return () => {
      clearInterval(refreshInterval);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('online', onReconnect);
    };
  }, []);

  const login = async (token: string) => {
    try {
      console.log('🔑 بدء تسجيل الدخول بالتوكن');
      
      // لا نخزن التوكن في كوكي غير HttpOnly؛ نترك ضبط الكوكيز لمسار /api/auth/login
      
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
    // إزالة أي أثر عميل فقط
    Cookies.remove("user");

    // إزالة من localStorage أيضاً
    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
      localStorage.removeItem("user_id");
      localStorage.removeItem("user_preferences");
      localStorage.removeItem("darkMode");
      sessionStorage.removeItem("user");
      sessionStorage.clear(); // تنظيف جميع بيانات الجلسة
    }

    // لا نعيد التوجيه هنا لتجنب تضارب مع واجهة الإدارة؛ دَع المستدعي يقرر
  };

  const refreshUser = async () => {
    // محاولة تجديد صامت إذا لزم
    try {
      await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' });
    } catch {}
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
