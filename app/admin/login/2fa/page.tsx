"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

export default function TwoFactorLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/admin";
  
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const tempToken = sessionStorage.getItem('2fa_temp_token');
      if (!tempToken) {
        alert("جلسة منتهية، يرجى تسجيل الدخول مرة أخرى");
        router.push("/admin/login");
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
          if (data.access_token && typeof document !== 'undefined') {
            document.cookie = `auth-token=${data.access_token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
            document.cookie = `auth_token=${data.access_token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
          }
          
          // مسح الرمز المؤقت
          sessionStorage.removeItem('2fa_temp_token');
          
          alert("تم التحقق بنجاح!");
          router.replace(next);
        } else {
          alert(data.error || "رمز غير صحيح");
        }
      } else {
        if (res.status === 401) {
          alert("انتهت صلاحية الجلسة");
          router.push("/admin/login");
        } else {
          alert(`خطأ: ${res.status}`);
        }
      }
    } catch (error) {
      console.error(error);
      alert("حدث خطأ في الاتصال");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
      <div className="max-w-md w-full mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-3xl mb-4">
              🔐
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              المصادقة الثنائية
            </h1>
            <p className="text-gray-600 mt-2">
              أدخل رمز التحقق من تطبيق المصادقة
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                رمز التحقق
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                className="w-full text-center text-2xl font-mono border-2 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                required
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-2 text-center">
                الرمز مكون من 6 أرقام
              </p>
            </div>
            
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-3 rounded-lg transition-all duration-200 disabled:opacity-60"
              disabled={loading || code.length !== 6}
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

            <div className="text-center space-y-2">
              <a
                href="/admin/login"
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                العودة لتسجيل الدخول
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
