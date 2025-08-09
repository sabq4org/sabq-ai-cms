"use client";

import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useDarkModeContext } from "@/contexts/DarkModeContext";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Brain,
  CheckCircle,
  CheckIcon,
  Clock,
  Filter,
  Globe,
  Mail,
  Send,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { useState } from "react";

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  features: string[];
  price: string;
  frequency: string;
  popular?: boolean;
  aiFeatures?: string[];
}

export default function NewsletterPage() {
  const { darkMode } = useDarkModeContext();
  const [email, setEmail] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("smart");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [preferences, setPreferences] = useState({
    topics: [] as string[],
    frequency: "daily",
    timeSlot: "morning",
  });

  const subscriptionPlans: SubscriptionPlan[] = [
    {
      id: "basic",
      name: "النشرة الأساسية",
      description: "الأخبار الرئيسية اليومية",
      features: [
        "أهم الأخبار اليومية",
        "تحديثات أسبوعية",
        "محتوى مُنسق يدوياً",
        "إلغاء الاشتراك في أي وقت",
      ],
      price: "مجاناً",
      frequency: "يومياً",
    },
    {
      id: "smart",
      name: "النشرة الذكية",
      description: "محتوى مخصص بالذكاء الاصطناعي",
      features: [
        "محتوى مخصص حسب اهتماماتك",
        "ملخصات ذكية للأخبار",
        "توقيت مثالي للإرسال",
        "تحليل سلوك القراءة",
        "توصيات مقالات مخصصة",
      ],
      aiFeatures: [
        "تحليل الاهتمامات بالذكاء الاصطناعي",
        "ملخصات تلقائية للمقالات الطويلة",
        "اقتراحات محتوى ذكية",
        "تحسين أوقات الإرسال",
      ],
      price: "مجاناً",
      frequency: "يومياً",
      popular: true,
    },
    {
      id: "premium",
      name: "النشرة المتقدمة",
      description: "تجربة شاملة مع تحليلات عميقة",
      features: [
        "جميع مميزات النشرة الذكية",
        "تحليلات عميقة للأحداث",
        "محتوى حصري ومقالات مفصلة",
        "بودكاست صوتي مخصص",
        "دعم فني مخصص",
      ],
      aiFeatures: [
        "تحليل متقدم للاتجاهات",
        "تنبؤات ذكية بالأحداث",
        "محتوى صوتي مولد بالذكاء الاصطناعي",
        "ملف شخصي للاهتمامات",
      ],
      price: "29 ريال",
      frequency: "شهرياً",
    },
  ];

  const topicCategories = [
    { id: "politics", name: "السياسة", icon: "🏛️" },
    { id: "economy", name: "الاقتصاد", icon: "📈" },
    { id: "technology", name: "التكنولوجيا", icon: "💻" },
    { id: "sports", name: "الرياضة", icon: "⚽" },
    { id: "health", name: "الصحة", icon: "🏥" },
    { id: "culture", name: "الثقافة", icon: "🎭" },
    { id: "education", name: "التعليم", icon: "📚" },
    { id: "entertainment", name: "الترفيه", icon: "🎬" },
  ];

  const aiFeatures = [
    {
      icon: <Brain className="w-8 h-8 text-purple-600" />,
      title: "تخصيص ذكي",
      description:
        "يتعلم الذكاء الاصطناعي من تفاعلك مع المحتوى ويقدم لك أخباراً أكثر صلة بك",
    },
    {
      icon: <Target className="w-8 h-8 text-blue-600" />,
      title: "استهداف دقيق",
      description: "محتوى مُنسق خصيصاً لاهتماماتك ووقتك المتاح للقراءة",
    },
    {
      icon: <Zap className="w-8 h-8 text-yellow-600" />,
      title: "ملخصات فورية",
      description: "ملخصات ذكية للأخبار الطويلة في ثوانٍ معدودة",
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-green-600" />,
      title: "تحليل الاتجاهات",
      description: "رؤى عميقة حول الأحداث والاتجاهات المستقبلية",
    },
  ];

  const handleSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/email/subscribers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          plan: selectedPlan,
          preferences,
        }),
      });

      if (response.ok) {
        setSubscriptionStatus("success");
        setEmail("");
      } else {
        setSubscriptionStatus("error");
      }
    } catch (error) {
      console.error("خطأ في الاشتراك:", error);
      setSubscriptionStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleTopic = (topicId: string) => {
    setPreferences((prev) => ({
      ...prev,
      topics: prev.topics.includes(topicId)
        ? prev.topics.filter((t) => t !== topicId)
        : [...prev.topics, topicId],
    }));
  };

  return (
    <div
      className={cn(
        "min-h-screen transition-colors duration-300",
        darkMode
          ? "bg-slate-900"
          : "bg-gradient-to-br from-blue-50 via-white to-indigo-50"
      )}
    >
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-16 sm:py-24">
          <div className="text-center max-w-4xl mx-auto">
            {/* AI Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              مدعوم بالذكاء الاصطناعي
            </div>

            <h1
              className={cn(
                "text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight",
                darkMode ? "text-white" : "text-gray-900"
              )}
            >
              النشرة البريدية الذكية
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent block sm:inline sm:ml-4">
                لصحيفة سبق
              </span>
            </h1>

            <p
              className={cn(
                "text-xl sm:text-2xl mb-8 leading-relaxed",
                darkMode ? "text-gray-300" : "text-gray-600"
              )}
            >
              احصل على أهم الأخبار والتحليلات مخصصة حسب اهتماماتك
              <br className="hidden sm:block" />
              بتقنية الذكاء الاصطناعي المتقدمة
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 mb-12 max-w-3xl mx-auto">
              {[
                { icon: Users, value: "50K+", label: "مشترك" },
                { icon: Mail, value: "1M+", label: "نشرة مرسلة" },
                { icon: Star, value: "4.9", label: "تقييم" },
                { icon: Globe, value: "15+", label: "موضوع" },
              ].map((stat, index) => (
                <div
                  key={index}
                  className={cn(
                    "p-4 rounded-2xl backdrop-blur-sm",
                    darkMode ? "bg-slate-800/50" : "bg-white/70"
                  )}
                >
                  <stat.icon className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                  <div
                    className={cn(
                      "text-2xl font-bold",
                      darkMode ? "text-white" : "text-gray-900"
                    )}
                  >
                    {stat.value}
                  </div>
                  <div
                    className={cn(
                      "text-sm",
                      darkMode ? "text-gray-400" : "text-gray-600"
                    )}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Subscribe */}
            <div className="max-w-md mx-auto">
              <form onSubmit={handleSubscription} className="flex gap-3">
                <Input
                  type="email"
                  placeholder="أدخل بريدك الإلكتروني"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={cn(
                    "flex-1 h-12 text-lg",
                    darkMode
                      ? "bg-slate-800/50 border-slate-700"
                      : "bg-white/70 border-gray-300"
                  )}
                  disabled={isSubmitting}
                />
                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting || !email}
                  className="px-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-5 h-5 ml-2" />
                      اشترك
                    </>
                  )}
                </Button>
              </form>

              {subscriptionStatus === "success" && (
                <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-lg text-sm flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  تم الاشتراك بنجاح! تحقق من بريدك الإلكتروني
                </div>
              )}

              {subscriptionStatus === "error" && (
                <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-lg text-sm">
                  حدث خطأ. يرجى المحاولة مرة أخرى
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl" />
        </div>
      </section>

      {/* AI Features Section */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-700 dark:text-green-300 text-sm font-medium mb-6">
              <Brain className="w-4 h-4" />
              مميزات الذكاء الاصطناعي
            </div>

            <h2
              className={cn(
                "text-3xl sm:text-4xl font-bold mb-6",
                darkMode ? "text-white" : "text-gray-900"
              )}
            >
              تجربة قراءة مخصصة بالكامل
            </h2>

            <p
              className={cn(
                "text-lg max-w-3xl mx-auto",
                darkMode ? "text-gray-300" : "text-gray-600"
              )}
            >
              نستخدم أحدث تقنيات الذكاء الاصطناعي لفهم اهتماماتك وتقديم محتوى
              مخصص يناسب وقتك وتفضيلاتك
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {aiFeatures.map((feature, index) => (
              <Card
                key={index}
                className={cn(
                  "p-6 transition-all duration-300 hover:shadow-xl border-0",
                  darkMode
                    ? "bg-slate-800/50 backdrop-blur-sm"
                    : "bg-white/70 backdrop-blur-sm"
                )}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">{feature.icon}</div>
                  <div>
                    <h3
                      className={cn(
                        "text-xl font-semibold mb-2",
                        darkMode ? "text-white" : "text-gray-900"
                      )}
                    >
                      {feature.title}
                    </h3>
                    <p
                      className={cn(
                        "leading-relaxed",
                        darkMode ? "text-gray-300" : "text-gray-600"
                      )}
                    >
                      {feature.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Subscription Plans */}
      <section
        className={cn(
          "py-16 sm:py-24",
          darkMode ? "bg-slate-800/30" : "bg-gray-50/50"
        )}
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2
              className={cn(
                "text-3xl sm:text-4xl font-bold mb-6",
                darkMode ? "text-white" : "text-gray-900"
              )}
            >
              اختر الخطة المناسبة لك
            </h2>
            <p
              className={cn(
                "text-lg max-w-3xl mx-auto",
                darkMode ? "text-gray-300" : "text-gray-600"
              )}
            >
              من النشرة الأساسية إلى التجربة المتقدمة بالذكاء الاصطناعي
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {subscriptionPlans.map((plan) => (
              <Card
                key={plan.id}
                className={cn(
                  "relative transition-all duration-300 hover:shadow-xl cursor-pointer border-2",
                  selectedPlan === plan.id
                    ? "border-purple-500 shadow-lg"
                    : darkMode
                    ? "border-slate-700 bg-slate-800/50"
                    : "border-gray-200 bg-white/70",
                  plan.popular && "ring-2 ring-purple-500/50"
                )}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1">
                      الأكثر شعبية
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <h3
                    className={cn(
                      "text-2xl font-bold mb-2",
                      darkMode ? "text-white" : "text-gray-900"
                    )}
                  >
                    {plan.name}
                  </h3>
                  <p
                    className={cn(
                      "mb-4",
                      darkMode ? "text-gray-300" : "text-gray-600"
                    )}
                  >
                    {plan.description}
                  </p>
                  <div className="mb-4">
                    <span
                      className={cn(
                        "text-3xl font-bold",
                        darkMode ? "text-white" : "text-gray-900"
                      )}
                    >
                      {plan.price}
                    </span>
                    {plan.price !== "مجاناً" && (
                      <span
                        className={cn(
                          "text-sm ml-2",
                          darkMode ? "text-gray-400" : "text-gray-500"
                        )}
                      >
                        / {plan.frequency}
                      </span>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span
                          className={cn(
                            "text-sm",
                            darkMode ? "text-gray-300" : "text-gray-600"
                          )}
                        >
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {plan.aiFeatures && (
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-4 h-4 text-purple-600" />
                        <span
                          className={cn(
                            "text-sm font-medium",
                            darkMode ? "text-purple-400" : "text-purple-600"
                          )}
                        >
                          مميزات الذكاء الاصطناعي
                        </span>
                      </div>
                      <ul className="space-y-2">
                        {plan.aiFeatures.map((feature, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2 flex-shrink-0" />
                            <span
                              className={cn(
                                "text-xs",
                                darkMode ? "text-gray-400" : "text-gray-500"
                              )}
                            >
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Button
                    className={cn(
                      "w-full",
                      selectedPlan === plan.id
                        ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                        : "bg-gray-600 hover:bg-gray-700"
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPlan(plan.id);
                    }}
                  >
                    {selectedPlan === plan.id ? (
                      <>
                        <CheckCircle className="w-4 h-4 ml-2" />
                        مُختار
                      </>
                    ) : (
                      "اختيار الخطة"
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Preferences Section */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2
                className={cn(
                  "text-3xl sm:text-4xl font-bold mb-6",
                  darkMode ? "text-white" : "text-gray-900"
                )}
              >
                خصص تفضيلاتك
              </h2>
              <p
                className={cn(
                  "text-lg",
                  darkMode ? "text-gray-300" : "text-gray-600"
                )}
              >
                اختر المواضيع التي تهمك وأوقات الإرسال المفضلة
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Topics */}
              <Card
                className={cn(
                  "p-6",
                  darkMode ? "bg-slate-800/50" : "bg-white/70"
                )}
              >
                <h3
                  className={cn(
                    "text-xl font-semibold mb-4 flex items-center gap-2",
                    darkMode ? "text-white" : "text-gray-900"
                  )}
                >
                  <Filter className="w-5 h-5" />
                  المواضيع المفضلة
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {topicCategories.map((topic) => (
                    <Button
                      key={topic.id}
                      variant={
                        preferences.topics.includes(topic.id)
                          ? "default"
                          : "outline"
                      }
                      className={cn(
                        "justify-start gap-2 h-auto py-3",
                        preferences.topics.includes(topic.id) &&
                          "bg-gradient-to-r from-purple-600 to-blue-600"
                      )}
                      onClick={() => toggleTopic(topic.id)}
                    >
                      <span>{topic.icon}</span>
                      <span className="text-sm">{topic.name}</span>
                    </Button>
                  ))}
                </div>
              </Card>

              {/* Timing */}
              <Card
                className={cn(
                  "p-6",
                  darkMode ? "bg-slate-800/50" : "bg-white/70"
                )}
              >
                <h3
                  className={cn(
                    "text-xl font-semibold mb-4 flex items-center gap-2",
                    darkMode ? "text-white" : "text-gray-900"
                  )}
                >
                  <Clock className="w-5 h-5" />
                  التوقيت المفضل
                </h3>
                <div className="space-y-4">
                  <div>
                    <label
                      className={cn(
                        "block text-sm font-medium mb-2",
                        darkMode ? "text-gray-300" : "text-gray-700"
                      )}
                    >
                      معدل الإرسال
                    </label>
                    <select
                      value={preferences.frequency}
                      onChange={(e) =>
                        setPreferences((prev) => ({
                          ...prev,
                          frequency: e.target.value,
                        }))
                      }
                      className="w-full p-3 rounded-lg border focus:ring-2 focus:ring-purple-500 bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    >
                      <option value="daily">يومياً</option>
                      <option value="weekly">أسبوعياً</option>
                      <option value="monthly">شهرياً</option>
                    </select>
                  </div>
                  <div>
                    <label
                      className={cn(
                        "block text-sm font-medium mb-2",
                        darkMode ? "text-gray-300" : "text-gray-700"
                      )}
                    >
                      وقت الإرسال
                    </label>
                    <select
                      value={preferences.timeSlot}
                      onChange={(e) =>
                        setPreferences((prev) => ({
                          ...prev,
                          timeSlot: e.target.value,
                        }))
                      }
                      className="w-full p-3 rounded-lg border focus:ring-2 focus:ring-purple-500 bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white"
                    >
                      <option value="morning">صباحاً (8:00 ص)</option>
                      <option value="afternoon">بعد الظهر (2:00 م)</option>
                      <option value="evening">مساءً (6:00 م)</option>
                    </select>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className={cn(
          "py-16 sm:py-24",
          darkMode
            ? "bg-purple-900/20"
            : "bg-gradient-to-r from-purple-50 to-blue-50"
        )}
      >
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h2
              className={cn(
                "text-3xl sm:text-4xl font-bold mb-6",
                darkMode ? "text-white" : "text-gray-900"
              )}
            >
              ابدأ رحلتك مع النشرة الذكية
            </h2>
            <p
              className={cn(
                "text-lg mb-8",
                darkMode ? "text-gray-300" : "text-gray-600"
              )}
            >
              انضم إلى آلاف القراء الذين يحصلون على أخبار مخصصة ومميزة يومياً
            </p>

            <form onSubmit={handleSubscription} className="max-w-md mx-auto">
              <div className="flex gap-3 mb-4">
                <Input
                  type="email"
                  placeholder="بريدك الإلكتروني"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={cn(
                    "flex-1 h-12 text-lg",
                    darkMode
                      ? "bg-slate-800/50 border-slate-700"
                      : "bg-white border-gray-300"
                  )}
                  disabled={isSubmitting}
                />
                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting || !email}
                  className="px-8 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      اشترك الآن
                      <ArrowRight className="w-5 h-5 mr-2" />
                    </>
                  )}
                </Button>
              </div>

              <p
                className={cn(
                  "text-sm",
                  darkMode ? "text-gray-400" : "text-gray-500"
                )}
              >
                🔒 بياناتك محمية ولن نرسل لك رسائل غير مرغوب فيها
              </p>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
