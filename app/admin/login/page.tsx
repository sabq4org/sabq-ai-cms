"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import SabqLogo from "@/components/SabqLogo";

export default function AdminLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const next = searchParams?.get("next") || "/admin";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        let errorMsg = `فشل تسجيل الدخول. رمز الحالة: ${res.status}`;
        try {
          const errorData = await res.json();
          errorMsg = errorData.error || errorData.message || errorMsg;
        } catch (e) {
          // Response was not JSON
        }
        alert(errorMsg);
        return;
      }

      const data = await res.json();
      if (res.ok && data?.success) {
        // توجيه مباشر بعد نجاح تسجيل الدخول، والميدلوير سيحمي المسارات
        router.replace(next);
      } else {
        alert(data?.error || "فشل تسجيل الدخول");
      }
    } catch (error: any) {
      console.error("An unexpected error occurred during login:", error);
      alert(`حدث خطأ غير متوقع: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-400 via-blue-500 to-blue-600 flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-stretch">
        {/* الجانب الأيسر - معلومات وشعار */}
        <div className="hidden lg:block relative text-white p-8 h-full">
          {/* الشعار في الأعلى */}
          <div className="flex items-start justify-center">
            <SabqLogo className="mx-auto" width={220} height={72} isWhite />
          </div>
          {/* العبارات مثبتة أسفل العمود */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center max-w-xl w-full px-4">
            <div className="space-y-3">[Error] Failed to load resource: the server responded with a status of 415 (Unsupported Media Type) (upload, line 0)
[Error] Upload error: – Error: Upload failed
Error: Upload failed
	(anonymous function) (create-new:25)
	(anonymous function) (emergency-react-fix.js:69)
	(anonymous function) (production-error-fixes.js:36)
	(anonymous function) (react-130-production-fix.js:60)
	error (intercept-console-error.js:57)
	ReactErrorRecovery.useEffect (ReactErrorRecovery.tsx:69)
	(anonymous function) (MediaPickerModal.tsx:133)
              <h2 className="text-3xl font-bold">حيث تلتقي التقنية بالمصداقية</h2>
              <p className="text-xl opacity-90">صحافة ذكية، مستقبل مشرق</p>
              <p className="text-lg opacity-80">انضم إلى ثورة الإعلام الرقمي المدعوم بالذكاء الاصطناعي</p>
            </div>
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium mt-4">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
              AI-Powered
            </div>
          </div>
        </div>

        {/* الجانب الأيمن - نموذج الدخول */}
        <div className="w-full max-w-md mx-auto lg:pt-0">
          <div className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm rounded-xl p-6">
            <div className="text-center space-y-2 pb-4">
              <div className="lg:hidden mb-4">
                <SabqLogo className="mx-auto" width={140} height={48} />
              </div>
              <h1 className="text-2xl font-bold text-gray-800">مرحباً بك في مستقبل الصحافة الذكية</h1>
              <p className="text-gray-600">ادخل إلى لوحة التحكم المدعومة بالذكاء الاصطناعي</p>
              <div className="lg:hidden inline-flex items-center gap-2 bg-blue-50 rounded-full px-3 py-1 text-sm font-medium text-blue-600 w-fit mx-auto">AI-Powered</div>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1 text-gray-700">
              البريد الإلكتروني
            </label>
                <div className="relative">
                  <input
                    type="email"
                    className="w-full border rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                    placeholder="أدخل بريدك الإلكتروني"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">✉️</span>
                </div>
          </div>
          <div>
            <label className="block text-sm mb-1 text-gray-700">
              كلمة المرور
            </label>
                <div className="relative">
                  <input
                    type="password"
                    className="w-full border rounded-lg pr-10 pl-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                    placeholder="أدخل كلمة المرور"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">👁️</button>
                </div>
          </div>
          <button
            type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-3 rounded-lg transition-all duration-200 disabled:opacity-60"
            disabled={loading}
          >
                {loading ? (
                  <div className="flex items-center gap-2 justify-center"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>جاري التحقق من البيانات...</div>
                ) : (
                  "دخول إلى لوحة التحكم"
                )}
          </button>
            </form>

            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-lg p-3 mt-4">
              <span>🔒</span>
              <span>بياناتك محمية بأحدث تقنيات التشفير</span>
            </div>
            <div className="text-center text-sm text-gray-500 mt-2">
              <p>تحتاج مساعدة؟</p>
              <a href="#" className="text-blue-600 hover:text-blue-800 transition-colors">تواصل مع فريق الدعم التقني</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
