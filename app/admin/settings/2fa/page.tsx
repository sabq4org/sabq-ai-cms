"use client";

import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';

export default function TwoFactorSettings() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [showSetup, setShowSetup] = useState(false);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const response = await fetch('/api/auth/2fa/status', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setIs2FAEnabled(data.enabled);
      }
    } catch (error) {
      console.error('خطأ في التحقق من حالة 2FA:', error);
    }
  };

  const setupTwoFactor = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/2fa/setup', {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setQrCode(data.qrCode);
        setBackupCodes(data.backupCodes);
        setShowSetup(true);
      } else {
        const error = await response.json();
        toast({
          title: 'خطأ',
          description: error.error || 'فشل في إنشاء 2FA',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ غير متوقع',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyAndEnable = async () => {
    if (verificationCode.length !== 6) {
      toast({
        title: 'خطأ',
        description: 'الرمز يجب أن يكون 6 أرقام',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          token: verificationCode,
          action: 'enable'
        })
      });

      if (response.ok) {
        toast({
          title: 'نجح',
          description: 'تم تفعيل المصادقة الثنائية بنجاح'
        });
        setIs2FAEnabled(true);
        setShowSetup(false);
        setQrCode('');
        setVerificationCode('');
      } else {
        const error = await response.json();
        toast({
          title: 'خطأ',
          description: error.error || 'فشل في التحقق من الرمز',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ غير متوقع',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const disableTwoFactor = async () => {
    if (!confirm('هل أنت متأكد من تعطيل المصادقة الثنائية؟ سيقلل هذا من أمان حسابك.')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/2fa/disable', {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        toast({
          title: 'تم',
          description: 'تم تعطيل المصادقة الثنائية'
        });
        setIs2FAEnabled(false);
      } else {
        toast({
          title: 'خطأ',
          description: 'فشل في تعطيل المصادقة الثنائية',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ غير متوقع',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">المصادقة الثنائية (2FA)</h1>

      {!is2FAEnabled && !showSetup && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">حماية حسابك</h2>
          <p className="text-gray-600 mb-6">
            المصادقة الثنائية تضيف طبقة إضافية من الأمان لحسابك. بعد تفعيلها، ستحتاج إلى إدخال رمز من تطبيق المصادقة بالإضافة إلى كلمة المرور.
          </p>
          <button
            onClick={setupTwoFactor}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'جاري الإعداد...' : 'إعداد المصادقة الثنائية'}
          </button>
        </div>
      )}

      {showSetup && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">إعداد المصادقة الثنائية</h2>
          
          <div className="mb-6">
            <h3 className="font-semibold mb-2">1. امسح رمز QR</h3>
            <p className="text-gray-600 mb-4">
              استخدم تطبيق المصادقة (Google Authenticator أو Authy) لمسح رمز QR التالي:
            </p>
            {qrCode && (
              <img src={qrCode} alt="QR Code" className="mx-auto mb-4" />
            )}
          </div>

          <div className="mb-6">
            <h3 className="font-semibold mb-2">2. احفظ الرموز الاحتياطية</h3>
            <p className="text-gray-600 mb-4">
              احفظ هذه الرموز في مكان آمن. يمكنك استخدامها لتسجيل الدخول إذا فقدت الوصول إلى تطبيق المصادقة:
            </p>
            <div className="bg-gray-100 p-4 rounded-lg">
              {backupCodes.map((code, index) => (
                <div key={index} className="font-mono text-sm mb-1">
                  {code}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                const text = backupCodes.join('\n');
                const blob = new Blob([text], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'sabq-2fa-backup-codes.txt';
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="mt-3 text-blue-600 hover:text-blue-700 text-sm underline"
            >
              تنزيل الرموز الاحتياطية
            </button>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold mb-2">3. أدخل رمز التحقق</h3>
            <p className="text-gray-600 mb-4">
              أدخل الرمز المكون من 6 أرقام من تطبيق المصادقة:
            </p>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              className="w-32 px-4 py-2 border rounded-lg text-center text-lg font-mono"
              maxLength={6}
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={verifyAndEnable}
              disabled={loading || verificationCode.length !== 6}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'جاري التحقق...' : 'تفعيل المصادقة الثنائية'}
            </button>
            <button
              onClick={() => {
                setShowSetup(false);
                setQrCode('');
                setBackupCodes([]);
                setVerificationCode('');
              }}
              disabled={loading}
              className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}

      {is2FAEnabled && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <svg className="w-6 h-6 text-green-500 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-semibold">المصادقة الثنائية مفعلة</h2>
          </div>
          <p className="text-gray-600 mb-6">
            حسابك محمي بالمصادقة الثنائية. ستحتاج إلى إدخال رمز من تطبيق المصادقة عند تسجيل الدخول.
          </p>
          <button
            onClick={disableTwoFactor}
            disabled={loading}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? 'جاري التعطيل...' : 'تعطيل المصادقة الثنائية'}
          </button>
        </div>
      )}
    </div>
  );
}
