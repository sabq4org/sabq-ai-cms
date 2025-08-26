"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LogIn, Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function LightLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nextParam = searchParams?.get("next") || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("يرجى إدخال البريد وكلمة المرور");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data?.success) {
        router.replace(nextParam || "/");
      } else {
        setError(data?.error || "تعذر تسجيل الدخول");
      }
    } catch (e) {
      setError("حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="mx-auto max-w-md px-4 py-6">
        {/* رأس مبسّط */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold">تسجيل دخول</h1>
          <p className="mt-1 text-sm text-gray-600">نسخة خفيفة ومناسبة للشاشات الصغيرة</p>
        </div>

        {/* بطاقة النموذج */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* البريد */}
            <div>
              <label className="mb-1 block text-sm font-medium">البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  className="w-full rounded-lg border border-gray-300 bg-white pr-9 pl-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* كلمة المرور */}
            <div>
              <label className="mb-1 block text-sm font-medium">كلمة المرور</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  className="w-full rounded-lg border border-gray-300 bg-white pr-9 pl-9 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* رسالة الخطأ */}
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
            )}

            {/* زر الدخول */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2 text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
            >
              <LogIn className="h-4 w-4" />
              {loading ? "جارٍ تسجيل الدخول..." : "تسجيل الدخول"}
            </button>

            {/* روابط مساعدة */}
            <div className="flex items-center justify-between text-xs text-blue-600">
              <Link href="/forgot-password" className="hover:underline">
                نسيت كلمة المرور؟
              </Link>
              <Link href="/register" className="hover:underline">
                إنشاء حساب جديد
              </Link>
            </div>
          </form>
        </div>

        {/* أسفل مبسط */}
        <div className="mt-4 text-center text-xs text-gray-500">
          <Link href="/" className="hover:underline">العودة للرئيسية</Link>
        </div>
      </div>
    </div>
  );
}


