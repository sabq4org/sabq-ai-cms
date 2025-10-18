"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EnhancedButton } from "@/components/ui/EnhancedButton";
import { EnhancedCard, EnhancedCardContent } from "@/components/ui/EnhancedCard";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, Sparkles, TrendingUp, Zap } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

/**
 * صفحة تسجيل الدخول المحسّنة
 * 
 * تصميم عصري مع:
 * - Gradient خلفية جذاب
 * - تأثيرات حركية سلسة
 * - أيقونات واضحة
 * - تجربة مستخدم محسّنة
 */
export default function EnhancedLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      if (response.ok) {
        const data = await response.json();
        // إعادة التوجيه إلى For You
        router.push("/for-you");
      } else {
        const data = await response.json();
        setError(data.message || "فشل تسجيل الدخول");
      }
    } catch (err) {
      setError("حدث خطأ أثناء تسجيل الدخول");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-brand-primary via-purple-600 to-brand-accent p-4">
      
      {/* خلفية متحركة */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-brand-accent/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="w-full max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-center relative z-10">
        
        {/* الجانب الأيسر - معلومات وميزات */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden md:block text-white space-y-8"
        >
          <div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6"
            >
              <Sparkles className="w-5 h-5" />
              <span className="font-semibold">مدعوم بالذكاء الاصطناعي</span>
            </motion.div>
            
            <h1 className="text-5xl font-bold mb-4">
              مرحباً بعودتك!
            </h1>
            <p className="text-xl text-white/90">
              سجّل دخولك للاستمتاع بمحتوى مخصص لك
            </p>
          </div>

          <div className="space-y-6">
            {[
              {
                icon: Sparkles,
                title: "محتوى مخصص بالذكاء الاصطناعي",
                description: "أخبار ومقالات مختارة خصيصاً لاهتماماتك"
              },
              {
                icon: TrendingUp,
                title: "تحليلات ذكية",
                description: "رؤى وتحليلات عميقة للأخبار المهمة"
              },
              {
                icon: Zap,
                title: "تحديثات فورية",
                description: "كن أول من يعرف آخر الأخبار العاجلة"
              }
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{feature.title}</h3>
                    <p className="text-white/80">{feature.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* الجانب الأيمن - نموذج تسجيل الدخول */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <EnhancedCard variant="elevated" padding="lg" className="backdrop-blur-xl bg-white/95 dark:bg-gray-900/95">
            <EnhancedCardContent>
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                  className="inline-block mb-4"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-brand-primary to-brand-accent rounded-2xl flex items-center justify-center mx-auto">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                </motion.div>
                <h2 className="text-3xl font-bold text-brand-primary dark:text-white mb-2">
                  تسجيل الدخول
                </h2>
                <p className="text-brand-fgMuted dark:text-gray-400">
                  ادخل إلى حسابك للوصول إلى المحتوى المخصص
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* حقل البريد الإلكتروني */}
                <div>
                  <label className="block text-sm font-semibold text-brand-fg dark:text-white mb-2">
                    البريد الإلكتروني
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <Mail className="w-5 h-5 text-brand-fgMuted" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@email.com"
                      required
                      className="w-full pr-10 pl-4 py-3 border-2 border-brand-border dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all bg-white dark:bg-gray-800 text-brand-fg dark:text-white"
                    />
                  </div>
                </div>

                {/* حقل كلمة المرور */}
                <div>
                  <label className="block text-sm font-semibold text-brand-fg dark:text-white mb-2">
                    كلمة المرور
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <Lock className="w-5 h-5 text-brand-fgMuted" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pr-10 pl-12 py-3 border-2 border-brand-border dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all bg-white dark:bg-gray-800 text-brand-fg dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 left-0 pl-3 flex items-center text-brand-fgMuted hover:text-brand-primary transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* تذكرني ونسيت كلمة المرور */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-brand-border text-brand-primary focus:ring-brand-primary"
                    />
                    <span className="text-sm text-brand-fg dark:text-white">تذكرني</span>
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-brand-primary hover:text-brand-accent transition-colors font-semibold"
                  >
                    نسيت كلمة المرور؟
                  </Link>
                </div>

                {/* رسالة الخطأ */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                {/* زر تسجيل الدخول */}
                <EnhancedButton
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  loading={loading}
                  disabled={loading}
                >
                  {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
                </EnhancedButton>

                {/* إنشاء حساب جديد */}
                <div className="text-center pt-4 border-t border-brand-border dark:border-gray-700">
                  <p className="text-sm text-brand-fgMuted dark:text-gray-400">
                    ليس لديك حساب؟{" "}
                    <Link
                      href="/register"
                      className="text-brand-primary hover:text-brand-accent transition-colors font-semibold"
                    >
                      إنشاء حساب جديد
                    </Link>
                  </p>
                </div>

                {/* العودة للصفحة الرئيسية */}
                <div className="text-center">
                  <Link
                    href="/"
                    className="text-sm text-brand-fgMuted hover:text-brand-primary transition-colors"
                  >
                    ← العودة للصفحة الرئيسية
                  </Link>
                </div>
              </form>
            </EnhancedCardContent>
          </EnhancedCard>
        </motion.div>
      </div>
    </div>
  );
}

