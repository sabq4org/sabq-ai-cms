'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, Shield } from 'lucide-react';
import Image from 'next/image';

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams();
  const token = params?.token as string;
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [passwordStrength, setPasswordStrength] = useState(0);

  // تقييم قوة كلمة المرور
  useEffect(() => {
    const password = formData.password;
    let strength = 0;
    
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
    
    setPasswordStrength(strength);
  }, [formData.password]);

  const validateForm = () => {
    const newErrors: any = {};
    
    if (!formData.password) {
      newErrors.password = 'كلمة المرور مطلوبة';
    } else if (formData.password.length < 8) {
      newErrors.password = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'كلمات المرور غير متطابقة';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (!token) {
      toast.error('رابط إعادة التعيين غير صالح');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (data.success) {
        setIsSuccess(true);
        toast.success('تم تغيير كلمة المرور بنجاح!');
        
        // الانتقال لصفحة تسجيل الدخول بعد 3 ثواني
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        toast.error(data.error || 'حدث خطأ في تغيير كلمة المرور');
        
        // إذا كان الرابط منتهي الصلاحية، اعرض رسالة واضحة
        if (data.error === 'انتهت صلاحية رابط إعادة التعيين' || 
            data.error === 'رابط إعادة التعيين غير صالح') {
          setTimeout(() => {
            router.push('/forgot-password');
          }, 2000);
        }
      }
    } catch (error) {
      toast.error('حدث خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  // مؤشر قوة كلمة المرور
  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return 'bg-red-500';
    if (passwordStrength <= 2) return 'bg-orange-500';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    if (passwordStrength <= 4) return 'bg-green-500';
    return 'bg-green-600';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 1) return 'ضعيفة';
    if (passwordStrength <= 2) return 'مقبولة';
    if (passwordStrength <= 3) return 'جيدة';
    if (passwordStrength <= 4) return 'قوية';
    return 'قوية جداً';
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            تم تغيير كلمة المرور بنجاح!
          </h1>
          <p className="text-gray-600 mb-6">
            يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة
          </p>
          <p className="text-sm text-gray-500 mb-4">
            سيتم توجيهك لصفحة تسجيل الدخول تلقائياً...
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-blue-600 hover:underline font-medium"
          >
            الانتقال لتسجيل الدخول الآن
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          {/* الشعار والعنوان */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              إعادة تعيين كلمة المرور
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              أدخل كلمة المرور الجديدة لحسابك
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* كلمة المرور الجديدة */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                كلمة المرور الجديدة
              </label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="أدخل كلمة المرور الجديدة"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.password}
                </p>
              )}
              
              {/* مؤشر قوة كلمة المرور */}
              {formData.password && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">قوة كلمة المرور</span>
                    <span className={`text-xs font-medium ${
                      passwordStrength <= 2 ? 'text-red-600' : 
                      passwordStrength <= 3 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {getPasswordStrengthText()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                      style={{ width: `${(passwordStrength / 5) * 100}%` }}
                    />
                  </div>
                  <div className="mt-2 text-xs text-gray-500 space-y-1">
                    <p className={formData.password.length >= 8 ? 'text-green-600' : ''}>
                      • 8 أحرف على الأقل
                    </p>
                    <p className={/[a-z]/.test(formData.password) && /[A-Z]/.test(formData.password) ? 'text-green-600' : ''}>
                      • أحرف كبيرة وصغيرة
                    </p>
                    <p className={/\d/.test(formData.password) ? 'text-green-600' : ''}>
                      • أرقام
                    </p>
                    <p className={/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? 'text-green-600' : ''}>
                      • رموز خاصة
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* تأكيد كلمة المرور */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                تأكيد كلمة المرور الجديدة
              </label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="أعد إدخال كلمة المرور"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* زر التأكيد */}
            <button
              type="submit"
              disabled={loading || passwordStrength < 2}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                loading || passwordStrength < 2
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transform hover:scale-[1.02]'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  جاري تغيير كلمة المرور...
                </span>
              ) : (
                'تغيير كلمة المرور'
              )}
            </button>
          </form>

          {/* روابط إضافية */}
          <div className="mt-6 text-center space-y-2">
            <Link
              href="/forgot-password"
              className="text-sm text-gray-600 hover:text-gray-800 transition-colors block"
            >
              طلب رابط جديد لإعادة التعيين
            </Link>
            <Link
              href="/login"
              className="text-sm text-blue-600 hover:underline font-medium block"
            >
              العودة لتسجيل الدخول
            </Link>
          </div>
        </div>

        {/* نصائح الأمان */}
        <div className="mt-4 bg-blue-50 rounded-xl p-4 text-sm text-blue-800">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            نصائح لكلمة مرور آمنة:
          </h3>
          <ul className="space-y-1 mr-6">
            <li>• استخدم مزيج من الأحرف الكبيرة والصغيرة والأرقام والرموز</li>
            <li>• تجنب استخدام معلومات شخصية سهلة التخمين</li>
            <li>• استخدم كلمة مرور مختلفة لكل حساب</li>
            <li>• فكر في استخدام عبارة مرور بدلاً من كلمة واحدة</li>
          </ul>
        </div>
      </div>
    </div>
  );
}