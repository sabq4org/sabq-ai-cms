'use client';

import Image from 'next/image';
import React, { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { 
  User, Mail, Lock, Eye, EyeOff, 
  CheckCircle, AlertCircle, Sparkles 
} from 'lucide-react';
export default function RegisterPage() {
  const router = useRouter();
  const emailRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const validateForm = () => {
    const newErrors: any = {};
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'الاسم الكامل مطلوب';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صحيح';
    }
    if (!formData.password) {
      newErrors.password = 'كلمة المرور مطلوبة';
    } else if (formData.password.length < 8) {
      newErrors.password = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'كلمات المرور غير متطابقة';
    }
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'يجب الموافقة على الشروط والأحكام';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    // إظهار رسالة تحميل
    const loadingToast = toast.loading('جاري إنشاء حسابك...');
    setLoading(true);
    
    try {
      console.log('بدء عملية التسجيل:', {
        name: formData.fullName,
        email: formData.email,
        passwordLength: formData.password.length
      });
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // timeout بعد 30 ثانية
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          password: formData.password
        }),
        signal: controller.signal,
        cache: 'no-store'
      });
      
      clearTimeout(timeoutId);
      
      console.log('استجابة API:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });
      
      const data = await response.json().catch(() => ({} as any));
      console.log('بيانات الاستجابة:', data);
      
      if (!response.ok) {
        const serverMessage = data?.error || data?.message || '';
        // معالجة خاصة للبريد المستخدم
        if (response.status === 409 || /مستخدم بالفعل|already/i.test(serverMessage)) {
          setErrors((prev: any) => ({ ...prev, email: 'البريد الإلكتروني مستخدم بالفعل' }));
          emailRef.current?.focus();
          toast.error('البريد الإلكتروني مستخدم بالفعل');
          return;
        }
        throw new Error(serverMessage || 'فشل التسجيل');
      }
      
      // إلغاء رسالة التحميل
      toast.dismiss(loadingToast);
      
      // حفظ بيانات المستخدم في localStorage
      localStorage.setItem('user', JSON.stringify(data.user));
      
      if (data.requiresVerification) {
        toast.success('تم إنشاء حسابك! يرجى التحقق من بريدك الإلكتروني');
        // توجيه إلى صفحة التحقق من البريد
        router.push(`/verify?email=${encodeURIComponent(formData.email)}`);
      } else {
        toast.success('🎉 تم إنشاء حسابك بنجاح! لقد حصلت على 50 نقطة ترحيبية');
        // توجيه إلى صفحة اختيار الاهتمامات
        router.push('/welcome/preferences');
      }
    } catch (error: any) {
      // إلغاء رسالة التحميل
      toast.dismiss(loadingToast);
      
      console.error('خطأ في التسجيل:', error);
      
      if (error.name === 'AbortError') {
        toast.error('انتهت مهلة الاتصال. يرجى المحاولة مرة أخرى.');
      } else {
        const message = error instanceof Error ? error.message : 'حدث خطأ في التسجيل';
        // إظهار رسالة مفهومة للمستخدم عند البريد المكرر
        if (/مستخدم بالفعل|already/i.test(message)) {
          setErrors((prev: any) => ({ ...prev, email: 'البريد الإلكتروني مستخدم بالفعل' }));
          emailRef.current?.focus();
          toast.error('البريد الإلكتروني مستخدم بالفعل');
        } else {
          toast.error(message);
        }
      }
    } finally {
      setLoading(false);
    }
  };
  return (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4 py-6 md:py-8">
      {/* خلفية ديناميكية - مخفية على الموبايل */}
      <div className="absolute inset-0 overflow-hidden hidden md:block">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-300 dark:bg-blue-800 rounded-full blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-300 dark:bg-purple-800 rounded-full blur-3xl opacity-30 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-300 dark:bg-indigo-800 rounded-full blur-3xl opacity-20"></div>
      </div>
      <div className="relative z-10 w-full max-w-md">
        {/* الشعار والعنوان */}
        <div className="text-center mb-4 md:mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 md:w-20 md:h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-lg mb-3">
            <Sparkles className="w-7 h-7 md:w-10 md:h-10 text-white" />
          </div>
          <h1 className="text-xl md:text-3xl font-bold text-gray-800 dark:text-white mb-1 md:mb-2">أهلاً بك في سبق</h1>
          <p className="text-xs md:text-base text-gray-600 dark:text-gray-300 hidden md:block">انضم لأكبر منصة إخبارية ذكية في المملكة</p>
          {/* رسالة واضحة للموبايل */}
          <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium md:hidden">
            ✅ سجل الآن لبدء تخصيص محتواك الذكي
          </p>
        </div>
        {/* نموذج التسجيل */}
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-2xl shadow-xl p-4 md:p-8 border border-white/50 dark:border-gray-700/50">
          <form onSubmit={handleSubmit} className="space-y-3 md:space-y-5">
            {/* الاسم الكامل */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 md:mb-2">
                الاسم الكامل
              </label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className={`w-full pr-9 md:pr-10 pl-3 md:pl-4 py-2.5 md:py-3 text-sm md:text-base border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all dark:bg-gray-700 dark:text-white ${
                    errors.fullName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="أدخل اسمك الكامل"
                  autoComplete="name"
                />
              </div>
              {errors.fullName && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.fullName}
                </p>
              )}
            </div>
            {/* البريد الإلكتروني */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 md:mb-2">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  ref={emailRef}
                  className={`w-full pr-9 md:pr-10 pl-3 md:pl-4 py-2.5 md:py-3 text-sm md:text-base border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all dark:bg-gray-700 dark:text-white ${
                    errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="example@email.com"
                  autoComplete="email"
                  dir="ltr"
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 md:mb-2">
                كلمة المرور
              </label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400 dark:text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`w-full pr-9 md:pr-10 pl-9 md:pl-10 py-2.5 md:py-3 text-sm md:text-base border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all dark:bg-gray-700 dark:text-white ${
                    errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4 md:w-5 md:h-5" /> : <Eye className="w-4 h-4 md:w-5 md:h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.password}
                </p>
              )}
            </div>
            {/* تأكيد كلمة المرور */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 md:mb-2">
                تأكيد كلمة المرور
              </label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400 dark:text-gray-500" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className={`w-full pr-9 md:pr-10 pl-9 md:pl-10 py-2.5 md:py-3 text-sm md:text-base border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all dark:bg-gray-700 dark:text-white ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4 md:w-5 md:h-5" /> : <Eye className="w-4 h-4 md:w-5 md:h-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.confirmPassword}
                </p>
              )}
            </div>
            {/* الموافقة على الشروط */}
            <div>
              <label className="flex items-start gap-2 md:gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.agreeToTerms}
                  onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
                  className="w-4 h-4 mt-0.5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="text-xs md:text-sm text-gray-700 dark:text-gray-300">
                  أوافق على{' '}
                  <Link href="/terms-of-use" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                    الشروط والأحكام
                  </Link>{' '}
                  <span className="hidden md:inline">
                    و{' '}
                    <Link href="/privacy-policy" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                      سياسة الخصوصية
                    </Link>
                  </span>
                </span>
              </label>
              {errors.agreeToTerms && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.agreeToTerms}
                </p>
              )}
            </div>
            {/* زر التسجيل */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white py-3 md:py-3.5 rounded-lg font-medium hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg text-sm md:text-base min-h-[44px]"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>جارٍ إنشاء حسابك...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4 md:w-5 md:h-5" />
                  <span>إنشاء حساب جديد</span>
                </div>
              )}
            </button>
            {/* رابط تسجيل الدخول */}
            <div className="text-center pt-3 border-t dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                لديك حساب بالفعل؟{' '}
                <Link href="/login" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
                  تسجيل الدخول
                </Link>
              </p>
            </div>
          </form>
        </div>
        {/* الميزات - مخفية على الموبايل */}
        <div className="mt-6 text-center space-y-2 hidden md:block">
          <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            50 نقطة ترحيبية مجانية
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            محتوى مخصص حسب اهتماماتك
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            تنبيهات ذكية للأخبار المهمة
          </p>
        </div>
      </div>
    </div>
  );
}