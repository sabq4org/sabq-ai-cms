"use client";

import { useAuth } from "@/hooks/useAuth";
import {
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
  LogIn,
  Mail,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams?.get("next") || undefined;
  const callbackUrl =
    searchParams?.get("callbackUrl") ||
    searchParams?.get("redirectTo") ||
    searchParams?.get("returnTo") ||
    searchParams?.get("redirect") ||
    nextParam;

  // إن كان طلب الدخول موجهاً للإدارة، حوِّل لصفحة دخول الإدارة الخالية من الهيدر
  useEffect(() => {
    if (nextParam && nextParam.startsWith("/admin")) {
      const url = `/admin/login?next=${encodeURIComponent(nextParam)}`;
      router.replace(url);
    }
  }, [nextParam, router]);
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});
  // الحصول على رابط الإرجاع من URL parameters
  const validateForm = () => {
    const newErrors: any = {};
    if (!formData.email.trim()) {
      newErrors.email = "البريد الإلكتروني مطلوب";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "البريد الإلكتروني غير صحيح";
    }
    if (!formData.password) {
      newErrors.password = "كلمة المرور مطلوبة";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // تحقق من صحة الإدخال قبل بدء التحميل
    if (!validateForm()) {
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
        credentials: "include",
      });
      const data = await response.json();
      if (response.ok && data.success) {
        console.log('📊 استجابة تسجيل الدخول:', data);
        
        // التحقق من 2FA
        if (data.requires2FA) {
          // حفظ الرمز المؤقت وتوجيه لصفحة 2FA
          sessionStorage.setItem('2fa_temp_token', data.tempToken);
          toast("يرجى إدخال رمز المصادقة الثنائية", {
            icon: "🔐",
            duration: 4000,
          });
          
          // تحديد الوجهة النهائية
          let finalDestination = "/";
          if (callbackUrl) {
            finalDestination = callbackUrl;
          } else if (data.user?.is_admin) {
            finalDestination = "/admin";
          }
          
          router.push(`/login/2fa?next=${encodeURIComponent(finalDestination)}`);
          return;
        }

        // حفظ التوكن أيضاً في localStorage لتسهيل تمريه في Authorization
        if (typeof window !== 'undefined' && data.token) {
          localStorage.setItem('auth-token', data.token);
        }
        // استخدام login من AuthContext
        if (data.token) {
          await login(data.token);
          console.log('✅ تم حفظ التوكن واستدعاء login');
        }

        toast.success(data.message || "تم تسجيل الدخول بنجاح");

        // تحديد مسار إعادة التوجيه
        let redirectPath = "/";

        if (callbackUrl) {
          redirectPath = callbackUrl;
        } else if (data.user?.is_admin) {
          redirectPath = "/admin";
        }

        console.log('🔄 إعادة توجيه إلى:', redirectPath);
        
        // تحديث حالة المصادقة أولاً
        if (login && data.user) {
          await login(data.user);
        }
        
        // تأكيد الجلسة قبل التوجيه
        try {
          const meResponse = await fetch('/api/auth/me', {
            credentials: 'include'
          });
          
          if (meResponse.ok) {
            console.log('✅ تم تأكيد الجلسة');
          }
        } catch (e) {
          console.warn('⚠️ فشل تأكيد الجلسة:', e);
        }
        
        // إعادة توجيه مع ضمان البقاء على نفس المضيف
        if (redirectPath.startsWith('/')) {
          // مسار نسبي - آمن
          router.push(redirectPath);
        } else {
          // مسار مطلق - تأكد من نفس المضيف
          const currentHost = window.location.host;
          const redirectUrl = new URL(redirectPath, window.location.origin);
          
          if (redirectUrl.host === currentHost) {
            router.push(redirectPath);
          } else {
            // إذا كان المضيف مختلف، استخدم المسار فقط
            router.push(redirectUrl.pathname + redirectUrl.search);
          }
        }
      } else {
        toast.error(data.error || "حدث خطأ في تسجيل الدخول");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("تعذر تسجيل الدخول");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      {/* خلفية ديناميكية */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-300 rounded-full blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-300 rounded-full blur-3xl opacity-30 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-300 rounded-full blur-3xl opacity-20"></div>
      </div>
      <div className="relative z-10 w-full max-w-md">
        {/* الشعار والعنوان */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-lg mb-3 sm:mb-4">
            <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            مرحباً بعودتك
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            سجل دخولك للاستمتاع بمحتوى مخصص لك
          </p>
        </div>
        {/* نموذج تسجيل الدخول */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-6 sm:p-8 border border-white/50">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* البريد الإلكتروني */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className={`w-full pr-9 sm:pr-10 pl-3 sm:pl-4 py-2.5 sm:py-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="example@email.com"
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.email}
                </p>
              )}
            </div>
            {/* كلمة المرور */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                كلمة المرور
              </label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className={`w-full pr-9 sm:pr-10 pl-9 sm:pl-10 py-2.5 sm:py-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.password}
                </p>
              )}
            </div>
            {/* تذكرني ونسيت كلمة المرور */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={(e) =>
                    setFormData({ ...formData, rememberMe: e.target.checked })
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-gray-700">تذكرني</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-blue-600 hover:underline"
              >
                نسيت كلمة المرور؟
              </Link>
            </div>
            {/* زر تسجيل الدخول */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2.5 sm:py-3 rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg text-sm sm:text-base"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>جارٍ تسجيل الدخول...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <LogIn className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>تسجيل الدخول</span>
                </div>
              )}
            </button>
            {/* رابط إنشاء حساب */}
            <div className="text-center pt-3 sm:pt-4 border-t">
              <p className="text-sm text-gray-600">
                ليس لديك حساب؟{" "}
                <Link
                  href="/register"
                  className="text-blue-600 hover:underline font-medium"
                >
                  إنشاء حساب جديد
                </Link>
              </p>
            </div>
          </form>
        </div>
        {/* روابط سريعة */}
        <div className="mt-6 sm:mt-8 text-center">
          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            العودة للصفحة الرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}
export default function LoginPage() {
  return <LoginForm />;
}
