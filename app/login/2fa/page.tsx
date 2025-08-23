"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";

export default function TwoFactorLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";
  const { login } = useAuth();
  
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [useBackupCode, setUseBackupCode] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const tempToken = sessionStorage.getItem('2fa_temp_token');
      if (!tempToken) {
        toast.error("جلسة منتهية، يرجى تسجيل الدخول مرة أخرى");
        router.push("/login");
        return;
      }

      const res = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${tempToken}`
        },
        credentials: "include",
        body: JSON.stringify({ code }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          // حفظ التوكن النهائي
          if (data.access_token && typeof window !== 'undefined') {
            localStorage.setItem('auth-token', data.access_token);
            await login(data.access_token);
          }
          
          // مسح الرمز المؤقت
          sessionStorage.removeItem('2fa_temp_token');
          
          toast.success("تم التحقق بنجاح!");
          router.replace(next);
        } else {
          toast.error(data.error || "رمز غير صحيح");
        }
      } else {
        if (res.status === 401) {
          toast.error("انتهت صلاحية الجلسة");
          router.push("/login");
        } else {
          toast.error(`خطأ: ${res.status}`);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("حدث خطأ في الاتصال");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-3xl mb-4 shadow-lg">
              🔐
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              المصادقة الثنائية
            </h1>
            <p className="text-gray-600 mt-2">
              {useBackupCode ? "أدخل أحد الرموز الاحتياطية" : "أدخل رمز التحقق من تطبيق المصادقة"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                {useBackupCode ? "الرمز الاحتياطي" : "رمز التحقق"}
              </label>
              <input
                type="text"
                inputMode={useBackupCode ? "text" : "numeric"}
                pattern={useBackupCode ? "[0-9A-Z]{8}" : "[0-9]{6}"}
                maxLength={useBackupCode ? 8 : 6}
                className="w-full text-center text-2xl font-mono border-2 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                placeholder={useBackupCode ? "ABCD1234" : "000000"}
                value={code}
                onChange={(e) => {
                  const val = e.target.value.toUpperCase();
                  if (useBackupCode) {
                    setCode(val.replace(/[^0-9A-Z]/g, ''));
                  } else {
                    setCode(val.replace(/[^0-9]/g, ''));
                  }
                }}
                required
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-2 text-center">
                {useBackupCode 
                  ? "الرمز الاحتياطي مكون من 8 أحرف وأرقام" 
                  : "الرمز مكون من 6 أرقام من تطبيق المصادقة"}
              </p>
            </div>
            
            <button
              type="submit"
              className={`w-full py-3 px-4 rounded-lg font-medium transition duration-200 ${
                loading || (useBackupCode ? code.length !== 8 : code.length !== 6)
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
              disabled={loading || (useBackupCode ? code.length !== 8 : code.length !== 6)}
            >
              {loading ? (
                <div className="flex items-center gap-2 justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>جاري التحقق...</span>
                </div>
              ) : (
                "تحقق"
              )}
            </button>

            <div className="text-center space-y-3">
              <button
                type="button"
                onClick={() => {
                  setUseBackupCode(!useBackupCode);
                  setCode("");
                }}
                className="text-sm text-blue-600 hover:text-blue-700 underline"
              >
                {useBackupCode 
                  ? "استخدام رمز من تطبيق المصادقة" 
                  : "استخدام رمز احتياطي بدلاً من ذلك"}
              </button>
              
              <div>
                <a
                  href="/login"
                  className="text-sm text-gray-600 hover:text-gray-700"
                >
                  العودة لتسجيل الدخول
                </a>
              </div>
            </div>
          </form>
        </div>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            نحمي حسابك بأعلى معايير الأمان
          </p>
        </div>
      </div>
    </div>
  );
}