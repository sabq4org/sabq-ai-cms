'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    // جلب البريد الإلكتروني من URL params
    const emailParam = searchParams?.get('email');
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }
  }, [searchParams]);

  useEffect(() => {
    // عداد تنازلي لإعادة الإرسال
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !code) {
      toast.error('يرجى إدخال البريد الإلكتروني ورمز التحقق');
      return;
    }

    if (code.length !== 6) {
      toast.error('رمز التحقق يجب أن يكون 6 أرقام');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (data.success) {
        setIsVerified(true);
        toast.success('تم تأكيد بريدك الإلكتروني بنجاح!');
        
        // حفظ بيانات المستخدم
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // الانتقال للصفحة الرئيسية بعد 3 ثواني
        setTimeout(() => {
          router.push('/newspaper');
        }, 3000);
      } else {
        toast.error(data.error || 'حدث خطأ في التحقق');
      }
    } catch (error) {
      toast.error('حدث خطأ في الاتصال بالخادم');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      toast.error('يرجى إدخال البريد الإلكتروني');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('تم إرسال رمز جديد إلى بريدك الإلكتروني');
        setResendTimer(60); // انتظار 60 ثانية قبل إعادة الإرسال
      } else {
        toast.error(data.error || 'حدث خطأ في إعادة الإرسال');
      }
    } catch (error) {
      toast.error('حدث خطأ في الاتصال بالخادم');
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            تم التحقق بنجاح!
          </h1>
          
          <p className="text-gray-600 mb-6">
            تم تأكيد بريدك الإلكتروني بنجاح. سيتم توجيهك إلى الصفحة الرئيسية...
          </p>
          
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            تأكيد البريد الإلكتروني
          </h1>
          <p className="text-gray-600">
            أدخل الرمز المكون من 6 أرقام المرسل إلى بريدك
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="example@email.com"
              required
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              رمز التحقق
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                if (value.length <= 6) {
                  setCode(value);
                }
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl font-bold tracking-widest"
              placeholder="000000"
              maxLength={6}
              required
              dir="ltr"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || code.length !== 6}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                جاري التحقق...
              </>
            ) : (
              <>
                تأكيد البريد
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 mb-2">
            لم تستلم الرمز؟
          </p>
          <button
            onClick={handleResendCode}
            disabled={isLoading || resendTimer > 0}
            className="text-blue-600 font-medium hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resendTimer > 0 
              ? `إعادة الإرسال بعد ${resendTimer} ثانية`
              : 'إعادة إرسال الرمز'
            }
          </button>
        </div>

        <div className="mt-8 p-4 bg-amber-50 rounded-lg border border-amber-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-medium mb-1">ملاحظة مهمة:</p>
              <p>رمز التحقق صالح لمدة 10 دقائق فقط. تأكد من إدخاله قبل انتهاء المدة.</p>
              {process.env.NODE_ENV !== 'production' && (
                <p className="mt-2 text-xs text-amber-700 bg-amber-100 px-2 py-1 rounded">
                  🔓 للتطوير: يمكنك استخدام الكود 000000 للتجاوز السريع
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 