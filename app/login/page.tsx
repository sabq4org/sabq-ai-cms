'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Mail, Lock, Eye, EyeOff, 
  LogIn, AlertCircle, Sparkles 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { logActions } from '../../lib/log-activity';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  // الحصول على رابط الإرجاع من URL parameters
  const callbackUrl = searchParams?.get('callbackUrl') || 
                     searchParams?.get('redirectTo') || 
                     searchParams?.get('returnTo');

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.email.trim()) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صحيح';
    }

    if (!formData.password) {
      newErrors.password = 'كلمة المرور مطلوبة';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'فشل تسجيل الدخول');
      }

      // حفظ بيانات المستخدم
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('currentUser', JSON.stringify({
        user_id: data.user.id,
        user_name: data.user.name,
        email: data.user.email,
        role: data.user.role
      }));
      
      // حفظ user_id للتوافق مع نظام التوصيات
      localStorage.setItem('user_id', data.user.id);
      
      // تسجيل حدث تسجيل الدخول
      await logActions.login({
        user_id: data.user.id,
        user_name: data.user.name,
        email: data.user.email,
        role: data.user.role
      });
      
      toast.success('مرحباً بعودتك! 🎉');
      
      // التوجيه الذكي
      let redirectPath = '/';
      
      // إذا كان هناك رابط محدد للعودة إليه
      if (callbackUrl && callbackUrl.startsWith('/')) {
        // استخدام الرابط المطلوب مباشرة (بغض النظر عن نوع المستخدم)
        redirectPath = callbackUrl;
        console.log('توجيه إلى الرابط المطلوب:', redirectPath);
      } else {
        // التوجيه بناءً على نوع المستخدم فقط إذا لم يكن هناك رابط محدد
        if (data.user.is_admin === true || data.user.role === 'admin') {
          redirectPath = '/dashboard';
          console.log('توجيه مدير إلى لوحة التحكم');
        } else {
          redirectPath = '/newspaper';
          console.log('توجيه مستخدم عادي إلى الصحيفة');
        }
      }
      
      router.push(redirectPath);

    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'حدث خطأ في تسجيل الدخول');
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
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-lg mb-4">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">مرحباً بعودتك</h1>
          <p className="text-gray-600">سجل دخولك للاستمتاع بمحتوى مخصص لك</p>
        </div>

        {/* نموذج تسجيل الدخول */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-white/50">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* البريد الإلكتروني */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full pr-10 pl-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="example@email.com"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                كلمة المرور
              </label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`w-full pr-10 pl-10 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">تذكرني</span>
              </label>
              <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                نسيت كلمة المرور؟
              </Link>
            </div>

            {/* زر تسجيل الدخول */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>جارٍ تسجيل الدخول...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <LogIn className="w-5 h-5" />
                  <span>تسجيل الدخول</span>
                </div>
              )}
            </button>

            {/* رابط إنشاء حساب */}
            <div className="text-center pt-4 border-t">
              <p className="text-sm text-gray-600">
                ليس لديك حساب؟{' '}
                <Link href="/register" className="text-blue-600 hover:underline font-medium">
                  إنشاء حساب جديد
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* روابط سريعة */}
        <div className="mt-8 text-center">
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-800 transition-colors">
            العودة للصفحة الرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
} 