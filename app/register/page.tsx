'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, Mail, Phone, Lock, MapPin, Globe, Heart, 
  Eye, EyeOff, Check, X, Shield, Gift, Star 
} from 'lucide-react';
import Link from 'next/link';

interface RegisterForm {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  gender: 'male' | 'female' | 'not_specified';
  city: string;
  country: string;
  preferredCategories: string[];
  subscribeNewsletter: boolean;
  agreeToTerms: boolean;
  captchaVerified: boolean;
}

interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState(1); // 1: معلومات أساسية، 2: تفضيلات، 3: تأكيد
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  const [formData, setFormData] = useState<RegisterForm>({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    gender: 'not_specified',
    city: '',
    country: 'السعودية',
    preferredCategories: [],
    subscribeNewsletter: true,
    agreeToTerms: false,
    captchaVerified: false
  });

  // تحميل التصنيفات المتاحة
  useEffect(() => {
    loadCategories();
    detectUserLocation();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      if (data.success) {
        setAvailableCategories(data.data);
      }
    } catch (error) {
      console.error('فشل في تحميل التصنيفات:', error);
    }
  };

  // كشف موقع المستخدم التلقائي
  const detectUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            // محاكاة API لكشف الموقع
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=ar`
            );
            const data = await response.json();
            
            setFormData(prev => ({
              ...prev,
              city: data.city || data.locality || '',
              country: data.countryName || 'السعودية'
            }));
          } catch (error) {
            console.log('لم يتم كشف الموقع تلقائياً');
          }
        },
        (error) => {
          console.log('المستخدم رفض كشف الموقع');
        }
      );
    }
  };

  // تحديث حقول النموذج
  const updateFormData = (field: keyof RegisterForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // إزالة الخطأ عند بدء الكتابة
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // التحقق من صحة البيانات
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // التحقق من الاسم الكامل
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'الاسم الكامل مطلوب';
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = 'الاسم يجب أن يكون 3 أحرف على الأقل';
    }

    // التحقق من البريد الإلكتروني
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صحيح';
    }

    // التحقق من كلمة المرور
    if (!formData.password) {
      newErrors.password = 'كلمة المرور مطلوبة';
    } else if (formData.password.length < 8) {
      newErrors.password = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'كلمة المرور يجب أن تحتوي على أحرف كبيرة وصغيرة وأرقام';
    }

    // التحقق من تأكيد كلمة المرور
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'كلمات المرور غير متطابقة';
    }

    // التحقق من رقم الجوال (إذا تم إدخاله)
    if (formData.phone && !/^(\+966|0)?[5][0-9]{8}$/.test(formData.phone)) {
      newErrors.phone = 'رقم الجوال غير صحيح (يجب أن يبدأ بـ 05 أو +9665)';
    }

    // التحقق من الموافقة على الشروط
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'يجب الموافقة على الشروط والأحكام';
    }

    // التحقق من reCAPTCHA (محاكاة)
    if (!formData.captchaVerified) {
      newErrors.captchaVerified = 'يرجى التحقق من أنك لست روبوت';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // تقييم قوة كلمة المرور
  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    
    const levels = ['ضعيف جداً', 'ضعيف', 'متوسط', 'قوي', 'قوي جداً'];
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
    
    return { level: levels[strength - 1] || 'ضعيف جداً', color: colors[strength - 1] || 'bg-red-500', strength };
  };

  // إرسال النموذج
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        // إظهار رسالة نجاح وتوجيه للتحقق من البريد
        router.push(`/auth/verify?email=${encodeURIComponent(formData.email)}`);
      } else {
        setErrors({ submit: data.error || 'حدث خطأ أثناء التسجيل' });
      }
    } catch (error) {
      setErrors({ submit: 'حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.' });
    } finally {
      setIsLoading(false);
    }
  };

  // الانتقال للخطوة التالية
  const nextStep = () => {
    if (step === 1) {
      // التحقق من الحقول الأساسية فقط
      const basicErrors: { [key: string]: string } = {};
      
      if (!formData.fullName.trim()) basicErrors.fullName = 'الاسم الكامل مطلوب';
      if (!formData.email) basicErrors.email = 'البريد الإلكتروني مطلوب';
      if (!formData.password) basicErrors.password = 'كلمة المرور مطلوبة';
      
      setErrors(basicErrors);
      if (Object.keys(basicErrors).length === 0) {
        setStep(2);
      }
    } else if (step === 2) {
      setStep(3);
    }
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center py-12 px-4" dir="rtl">
      <div className="max-w-md w-full space-y-8">
        {/* الشعار والعنوان */}
        <div className="text-center">
          <Link href="/" className="inline-block">
            <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-xl">سبق</span>
            </div>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900">إنشاء حساب جديد</h2>
          <p className="mt-2 text-gray-600">انضم إلى مجتمع صحيفة سبق واحصل على تجربة إخبارية مخصصة</p>
          
          {/* مؤشر الخطوات */}
          <div className="flex justify-center mt-6 space-x-2 space-x-reverse">
            {[1, 2, 3].map((stepNum) => (
              <div
                key={stepNum}
                className={`w-3 h-3 rounded-full ${
                  stepNum <= step ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* النموذج */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="bg-white p-8 rounded-xl shadow-lg">
            
            {/* الخطوة الأولى: المعلومات الأساسية */}
            {step === 1 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">المعلومات الأساسية</h3>
                
                {/* الاسم الكامل */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الاسم الكامل *
                  </label>
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => updateFormData('fullName', e.target.value)}
                      className={`w-full pr-10 pl-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.fullName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="أدخل اسمك الكامل"
                    />
                  </div>
                  {errors.fullName && (
                    <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
                  )}
                </div>

                {/* البريد الإلكتروني */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    البريد الإلكتروني *
                  </label>
                  <div className="relative">
                    <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateFormData('email', e.target.value)}
                      className={`w-full pr-10 pl-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="example@domain.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                {/* رقم الجوال */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رقم الجوال (اختياري)
                  </label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => updateFormData('phone', e.target.value)}
                      className={`w-full pr-10 pl-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="05xxxxxxxx"
                      dir="ltr"
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>

                {/* كلمة المرور */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    كلمة المرور *
                  </label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => updateFormData('password', e.target.value)}
                      className={`w-full pr-10 pl-10 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.password ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="أدخل كلمة مرور قوية"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  
                  {/* مؤشر قوة كلمة المرور */}
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrength(formData.password).color}`}
                            style={{ width: `${(getPasswordStrength(formData.password).strength / 5) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600">
                          {getPasswordStrength(formData.password).level}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                  )}
                </div>

                {/* تأكيد كلمة المرور */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    تأكيد كلمة المرور *
                  </label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                      className={`w-full pr-10 pl-10 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="أعد إدخال كلمة المرور"
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
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                  )}
                </div>

                {/* الجنس */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الجنس
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'male', label: 'ذكر' },
                      { value: 'female', label: 'أنثى' },
                      { value: 'not_specified', label: 'غير محدد' }
                    ].map(option => (
                      <label key={option.value} className="flex items-center">
                        <input
                          type="radio"
                          name="gender"
                          value={option.value}
                          checked={formData.gender === option.value}
                          onChange={(e) => updateFormData('gender', e.target.value)}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span className="mr-2 text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* الخطوة الثانية: الموقع والتفضيلات */}
            {step === 2 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">الموقع والتفضيلات</h3>
                
                {/* المدينة والدولة */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      المدينة
                    </label>
                    <div className="relative">
                      <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => updateFormData('city', e.target.value)}
                        className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="الرياض"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الدولة
                    </label>
                    <div className="relative">
                      <Globe className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <select
                        value={formData.country}
                        onChange={(e) => updateFormData('country', e.target.value)}
                        className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="السعودية">السعودية</option>
                        <option value="الإمارات">الإمارات</option>
                        <option value="الكويت">الكويت</option>
                        <option value="قطر">قطر</option>
                        <option value="البحرين">البحرين</option>
                        <option value="عمان">عمان</option>
                        <option value="الأردن">الأردن</option>
                        <option value="مصر">مصر</option>
                        <option value="أخرى">أخرى</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* التصنيفات المفضلة */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    اختر التصنيفات التي تهمك (اختياري)
                  </label>
                  <div className="grid grid-cols-1 gap-3 max-h-48 overflow-y-auto">
                    {availableCategories.map(category => (
                      <label key={category.id} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.preferredCategories.includes(category.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              updateFormData('preferredCategories', [...formData.preferredCategories, category.id]);
                            } else {
                              updateFormData('preferredCategories', formData.preferredCategories.filter(id => id !== category.id));
                            }
                          }}
                          className="text-blue-600 focus:ring-blue-500 ml-3"
                        />
                        <div>
                          <span className="font-medium text-gray-900">{category.name}</span>
                          {category.description && (
                            <p className="text-sm text-gray-600">{category.description}</p>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* الاشتراك في النشرة البريدية */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.subscribeNewsletter}
                    onChange={(e) => updateFormData('subscribeNewsletter', e.target.checked)}
                    className="text-blue-600 focus:ring-blue-500 ml-3"
                  />
                  <div>
                    <span className="font-medium text-gray-900">اشترك في النشرة البريدية</span>
                    <p className="text-sm text-gray-600">احصل على آخر الأخبار والتحديثات مباشرة في بريدك</p>
                  </div>
                </div>
              </div>
            )}

            {/* الخطوة الثالثة: التأكيد والشروط */}
            {step === 3 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">تأكيد وإنهاء التسجيل</h3>
                
                {/* ملخص البيانات */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">ملخص بياناتك:</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">الاسم:</span> {formData.fullName}</p>
                    <p><span className="font-medium">البريد:</span> {formData.email}</p>
                    {formData.phone && <p><span className="font-medium">الجوال:</span> {formData.phone}</p>}
                    <p><span className="font-medium">الموقع:</span> {formData.city}{formData.city && formData.country && '، '}{formData.country}</p>
                    {formData.preferredCategories.length > 0 && (
                      <p><span className="font-medium">التصنيفات المفضلة:</span> {formData.preferredCategories.length} تصنيف</p>
                    )}
                  </div>
                </div>

                {/* مكافأة التسجيل */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center">
                    <Gift className="w-8 h-8 text-green-600 ml-3" />
                    <div>
                      <h4 className="font-medium text-green-800">مكافأة التسجيل!</h4>
                      <p className="text-sm text-green-700">ستحصل على 50 نقطة ولاء عند إكمال التسجيل وتفعيل حسابك</p>
                    </div>
                  </div>
                </div>

                {/* reCAPTCHA محاكاة */}
                <div className="border border-gray-300 rounded-lg p-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.captchaVerified}
                      onChange={(e) => updateFormData('captchaVerified', e.target.checked)}
                      className="text-blue-600 focus:ring-blue-500 ml-3"
                    />
                    <div className="flex items-center">
                      <Shield className="w-5 h-5 text-gray-600 ml-2" />
                      <span className="text-gray-700">أنا لست روبوت</span>
                    </div>
                  </label>
                  {errors.captchaVerified && (
                    <p className="mt-2 text-sm text-red-600">{errors.captchaVerified}</p>
                  )}
                </div>

                {/* الموافقة على الشروط */}
                <div>
                  <label className="flex items-start cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.agreeToTerms}
                      onChange={(e) => updateFormData('agreeToTerms', e.target.checked)}
                      className="text-blue-600 focus:ring-blue-500 mt-1 ml-3"
                    />
                    <span className="text-sm text-gray-700">
                      أوافق على{' '}
                      <Link href="/terms" className="text-blue-600 hover:underline">
                        الشروط والأحكام
                      </Link>
                      {' '}و{' '}
                      <Link href="/privacy" className="text-blue-600 hover:underline">
                        سياسة الخصوصية
                      </Link>
                    </span>
                  </label>
                  {errors.agreeToTerms && (
                    <p className="mt-1 text-sm text-red-600">{errors.agreeToTerms}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* أزرار التنقل */}
          <div className="flex items-center justify-between">
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                السابق
              </button>
            )}
            
            {step < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className="mr-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                التالي
              </button>
            ) : (
              <button
                type="submit"
                disabled={isLoading}
                className="mr-auto flex items-center justify-center px-8 py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg hover:from-blue-700 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Star className="w-5 h-5 ml-2" />
                    إنشاء الحساب
                  </>
                )}
              </button>
            )}
          </div>

          {/* رسائل الخطأ */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <X className="w-5 h-5 text-red-500 ml-2" />
                <span className="text-red-700">{errors.submit}</span>
              </div>
            </div>
          )}
        </form>

        {/* رابط تسجيل الدخول */}
        <div className="text-center">
          <p className="text-gray-600">
            لديك حساب بالفعل؟{' '}
            <Link href="/login" className="text-blue-600 hover:underline font-medium">
              تسجيل الدخول
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 