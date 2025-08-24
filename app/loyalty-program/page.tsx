"use client";

import "@/styles/loyalty-program-mobile.css";
import {
  ArrowLeft,
  Award,
  Bookmark,
  Calendar,
  CheckCircle,
  ChevronRight,
  Crown,
  Gift,
  Heart,
  HelpCircle,
  MessageCircle,
  Shield,
  Sparkles,
  Star,
  TrendingUp,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";

export default function LoyaltyProgramPage() {
  const membershipTiers = [
    {
      name: "قارئ برونزي",
      points: "0 - 99",
      color: "bg-orange-100 border-orange-400",
      iconColor: "text-orange-600",
      icon: Star,
      benefits: ["قراءة المقالات", "التعليق والمشاركة", "حفظ المقالات", "كسب النقاط الأساسية"],
    },
    {
      name: "قارئ فضي",
      points: "100 - 499",
      color: "bg-gray-100 border-gray-400",
      iconColor: "text-gray-600",
      icon: Award,
      benefits: ["جميع مزايا البرونزي", "شارة فضية", "أولوية في التعليقات", "إشعارات مخصصة"],
    },
    {
      name: "قارئ ذهبي",
      points: "500 - 1999",
      color: "bg-yellow-100 border-yellow-400",
      iconColor: "text-yellow-600",
      icon: Trophy,
      benefits: ["جميع مزايا الفضي", "محتوى حصري", "بدون إعلانات", "دعوات لفعاليات خاصة"],
    },
    {
      name: "قارئ بلاتيني",
      points: "2000+",
      color: "bg-purple-100 border-purple-400",
      iconColor: "text-purple-600",
      icon: Crown,
      benefits: ["جميع المزايا", "محتوى VIP حصري", "مكافآت شهرية", "وصول مبكر للمزايا الجديدة"],
    },
  ];

  const pointsActivities = [
    {
      activity: "قراءة مقال (30+ ثانية)",
      points: 2,
      icon: CheckCircle,
      description: "اقرأ المقال لأكثر من 30 ثانية",
      limit: "مرة واحدة لكل مقال",
    },
    {
      activity: "قراءة طويلة (60+ ثانية)",
      points: 3,
      icon: Calendar,
      description: "قراءة متعمقة للمقال",
      limit: "حد أقصى 50 مقال/يوم",
    },
    {
      activity: "مشاركة المحتوى",
      points: 5,
      icon: Users,
      description: "شارك المقال مع أصدقائك",
      limit: "حد أقصى 10 مشاركات/يوم",
    },
    {
      activity: "التفاعل بإعجاب",
      points: 1,
      icon: Heart,
      description: "أعجبك المحتوى؟ أخبرنا",
      limit: "حد أقصى 20 إعجاب/يوم",
    },
    {
      activity: "كتابة تعليق",
      points: 4,
      icon: MessageCircle,
      description: "شارك رأيك وناقش المحتوى",
      limit: "حد أقصى 10 تعليقات/يوم",
    },
    {
      activity: "حفظ للقراءة",
      points: 2,
      icon: Bookmark,
      description: "احفظ المقالات المهمة",
      limit: "مرة واحدة لكل مقال",
    },
    {
      activity: "فتح إشعار",
      points: 2,
      icon: Zap,
      description: "افتح الإشعارات التي نرسلها",
      limit: "حد أقصى 5 إشعارات/يوم",
    },
    {
      activity: "دعوة صديق",
      points: 20,
      icon: Gift,
      description: "ادع صديق وسجل بريد مفعل",
      limit: "بدون حد أقصى",
    },
  ];

  const rewards = [
    {
      title: "محتوى حصري",
      description: "اشتراك مجاني في المحتوى المميز بدون إعلانات",
      icon: Sparkles,
      requiredPoints: 500,
    },
    {
      title: "مكافآت الشركاء",
      description: "قسائم خصم وعروض حصرية من شركائنا المميزين",
      icon: Gift,
      requiredPoints: 750,
    },
    {
      title: "شارات التميز",
      description: "شارات خاصة تظهر بجانب اسمك في المنصة",
      icon: Shield,
      requiredPoints: 200,
    },
    {
      title: "تجارب مبكرة",
      description: "كن أول من يجرب المزايا والتحديثات الجديدة",
      icon: Zap,
      requiredPoints: 1000,
    },
  ];

  const faqs = [
    {
      question: "كيف أكسب النقاط؟",
      answer:
        "اكسب النقاط تلقائياً عند القراءة (2-3 نقاط)، الإعجاب (1 نقطة)، التعليق (4 نقاط)، المشاركة (5 نقاط)، وحفظ المقالات (2 نقطة). هناك حدود يومية لضمان العدالة.",
    },
    {
      question: "ما هي الحدود اليومية للنقاط؟",
      answer:
        "يمكنك كسب حد أقصى: 20 إعجاب، 10 تعليقات، 10 مشاركات، 50 قراءة طويلة، و5 فتح إشعارات يومياً. القراءة العادية والحفظ مرة واحدة لكل مقال.",
    },
    {
      question: "متى يمكنني استبدال النقاط؟",
      answer:
        "يمكنك استبدال النقاط بالمكافآت عند الوصول للحد المطلوب. المكافآت تبدأ من 200 نقطة للشارات وتصل إلى 1000 نقطة للتجارب المبكرة.",
    },
    {
      question: "كيف تعمل المكافآت الخاصة؟",
      answer:
        "احصل على مكافآت إضافية: +10 نقاط للقراءة المتتالية (5 مقالات)، +100 نقطة للنشاط الشهري (30+ تفاعل)، +50 نقطة لمعدل إكمال عالي (80%+).",
    },
    {
      question: "هل تنتهي صلاحية النقاط؟",
      answer:
        "النقاط صالحة دائماً طالما كنت نشطاً. النشاط يعني زيارة واحدة كل 90 يوماً. النقاط محفوظة بأمان في حسابك.",
    },
    {
      question: "كيف أرتقي في المستويات؟",
      answer:
        "ترتقي تلقائياً: برونزي (0-99)، فضي (100-499)، ذهبي (500-1999)، بلاتيني (2000+). كل مستوى يفتح مزايا ومحتوى حصري جديد.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 text-white py-12 sm:py-20 overflow-hidden loyalty-hero-mobile">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="container mx-auto px-4 relative z-10 loyalty-container-mobile">
            <div className="max-w-4xl mx-auto text-center loyalty-mobile-typography">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5 sm:px-4 sm:py-2 mb-4 sm:mb-6 loyalty-badge-mobile">
                <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-300" />
                <span className="text-xs sm:text-sm font-medium">
                  برنامج الولاء الجديد
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6">
                اقرأ، تفاعل، واكسب
              </h1>
              <p className="text-lg sm:text-xl text-white/90 mb-6 sm:mb-8 leading-relaxed px-2">
                انضم لبرنامج النقاط واحصل على مكافآت حصرية مع كل قراءة وتفاعل
              </p>
              <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4 buttons">
                <Link
                  href="/register"
                  className="bg-white text-purple-700 px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg button"
                >
                  ابدأ رحلتك الآن
                </Link>
                <Link
                  href="#how-it-works"
                  className="border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold hover:bg-white hover:text-purple-700 transition-all button"
                >
                  كيف يعمل البرنامج
                </Link>
              </div>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-6 sm:top-10 left-6 sm:left-10 opacity-20">
            <Star className="w-12 sm:w-20 h-12 sm:h-20 text-yellow-300 animate-pulse" />
          </div>
          <div className="absolute bottom-6 sm:bottom-10 right-6 sm:right-10 opacity-20">
            <Trophy className="w-14 sm:w-24 h-14 sm:h-24 text-yellow-300 animate-pulse" />
          </div>
        </section>

        {/* How It Works Overview */}
        <section className="py-12 sm:py-16 bg-white loyalty-section-mobile">
          <div className="container mx-auto px-4 loyalty-container-mobile">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                كيف يعمل نظام النقاط؟
              </h2>
              <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
                نظام بسيط وعادل يكافئ تفاعلك مع المحتوى ويحفزك على القراءة والمشاركة
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
              <div className="text-center">
                <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">1. اقرأ وتفاعل</h3>
                <p className="text-gray-600 text-sm">
                  اقرأ المقالات، اكتب التعليقات، شارك المحتوى، واضغط إعجاب
                </p>
              </div>

              <div className="text-center">
                <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">2. اكسب النقاط</h3>
                <p className="text-gray-600 text-sm">
                  احصل على نقاط تلقائياً مع كل نشاط حسب قواعد واضحة وعادلة
                </p>
              </div>

              <div className="text-center">
                <div className="bg-yellow-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Award className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">3. ارتق في المستويات</h3>
                <p className="text-gray-600 text-sm">
                  انتقل من برونزي إلى بلاتيني واحصل على مزايا أكثر
                </p>
              </div>

              <div className="text-center">
                <div className="bg-purple-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Gift className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">4. استبدل المكافآت</h3>
                <p className="text-gray-600 text-sm">
                  استخدم نقاطك للحصول على محتوى حصري ومكافآت قيمة
                </p>
              </div>
            </div>

            <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Shield className="w-8 h-8 text-blue-600" />
                <h3 className="text-2xl font-bold text-gray-900">نظام عادل ومتوازن</h3>
              </div>
              <p className="text-gray-700 max-w-2xl mx-auto mb-6">
                صممنا النظام ليكون عادلاً للجميع مع حدود يومية تمنع التلاعب وتضمن تجربة متوازنة. 
                كل نقطة تكسبها تعكس تفاعلك الحقيقي مع المحتوى.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="bg-white rounded-lg p-3">
                  <div className="font-bold text-blue-600">حماية من التلاعب</div>
                  <div className="text-gray-600">حدود يومية ذكية</div>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <div className="font-bold text-green-600">تحديث فوري</div>
                  <div className="text-gray-600">نقاط في الوقت الفعلي</div>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <div className="font-bold text-yellow-600">مكافآت متنوعة</div>
                  <div className="text-gray-600">خيارات للجميع</div>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <div className="font-bold text-purple-600">نقاط دائمة</div>
                  <div className="text-gray-600">لا تنتهي صلاحيتها</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Membership Tiers */}
        <section className="py-12 sm:py-16 bg-gray-50 loyalty-section-mobile">
          <div className="container mx-auto px-4 loyalty-container-mobile">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 loyalty-section-title-mobile">
                مستويات العضوية
              </h2>
              <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto loyalty-section-subtitle-mobile">
                ارتق في المستويات واحصل على مزايا أكثر مع كل إنجاز
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-7xl mx-auto loyalty-tiers-mobile">
              {membershipTiers.map((tier, index) => {
                const Icon = tier.icon;
                return (
                  <div
                    key={index}
                    className={`${tier.color} border-2 rounded-xl sm:rounded-2xl p-4 sm:p-6 relative overflow-hidden transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl loyalty-tier-card-mobile`}
                  >
                    <div className="relative z-10">
                      <Icon
                        className={`w-8 sm:w-12 h-8 sm:h-12 ${tier.iconColor} mb-3 sm:mb-4 icon`}
                      />
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                        {tier.name}
                      </h3>
                      <p className="text-gray-700 font-medium mb-3 sm:mb-4 text-sm sm:text-base">
                        {tier.points} نقطة
                      </p>
                      <ul className="space-y-1.5 sm:space-y-2">
                        {tier.benefits.map((benefit, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-gray-700 benefit"
                          >
                            <CheckCircle className="w-3 sm:w-4 h-3 sm:h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-xs sm:text-sm">
                              {benefit}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* How to Earn Points */}
        <section
          id="how-it-works"
          className="py-12 sm:py-16 bg-white loyalty-section-mobile"
        >
          <div className="container mx-auto px-4 loyalty-container-mobile">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 loyalty-section-title-mobile">
                كيف تكسب النقاط؟
              </h2>
              <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto loyalty-section-subtitle-mobile">
                كل تفاعل له قيمة، وكل قراءة تقربك من المكافآت
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto loyalty-activities-mobile">
              {pointsActivities.map((activity, index) => {
                const Icon = activity.icon;
                return (
                  <div
                    key={index}
                    className="bg-white border border-gray-200 rounded-lg sm:rounded-xl p-4 sm:p-6 hover:shadow-lg transition-all duration-300 hover:border-purple-300 loyalty-activity-card-mobile"
                  >
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4">
                      <div className="bg-purple-100 p-2.5 sm:p-3 rounded-lg icon-container">
                        <Icon className="w-5 sm:w-6 h-5 sm:h-6 text-purple-600" />
                      </div>
                      <div className="flex-1 text-center sm:text-right">
                        <h3 className="font-bold text-gray-900 mb-1 text-sm sm:text-base">
                          {activity.activity}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 mb-2 description">
                          {activity.description}
                        </p>
                        <div className="space-y-1">
                          <div className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2.5 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium points">
                            <TrendingUp className="w-3 h-3" />
                            <span>{activity.points} نقاط</span>
                          </div>
                          {activity.limit && (
                            <div className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full inline-block">
                              {activity.limit}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Special Bonuses Section */}
        <section className="py-12 sm:py-16 bg-gradient-to-r from-indigo-50 to-purple-50 loyalty-section-mobile">
          <div className="container mx-auto px-4 loyalty-container-mobile">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 loyalty-section-title-mobile">
                المكافآت الخاصة والسلوكية
              </h2>
              <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto loyalty-section-subtitle-mobile">
                احصل على نقاط إضافية للسلوك الإيجابي والنشاط المستمر
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
              <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-yellow-200 hover:shadow-xl transition-all">
                <div className="text-center">
                  <div className="bg-yellow-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-yellow-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">مكافأة القراءة المتتالية</h3>
                  <p className="text-gray-600 mb-4">اقرأ 5 مقالات متتالية في جلسة واحدة</p>
                  <div className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full font-bold">
                    +10 نقاط مكافأة
                  </div>
                  <p className="text-xs text-gray-500 mt-2">مرة واحدة يومياً</p>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-green-200 hover:shadow-xl transition-all">
                <div className="text-center">
                  <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Trophy className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">النشاط الشهري</h3>
                  <p className="text-gray-600 mb-4">30+ تفاعل في الشهر الواحد</p>
                  <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full font-bold">
                    +100 نقطة مكافأة
                  </div>
                  <p className="text-xs text-gray-500 mt-2">مرة واحدة شهرياً</p>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-purple-200 hover:shadow-xl transition-all">
                <div className="text-center">
                  <div className="bg-purple-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Crown className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">قارئ متفاني</h3>
                  <p className="text-gray-600 mb-4">معدل إكمال 80%+ للمقالات</p>
                  <div className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full font-bold">
                    +50 نقطة مكافأة
                  </div>
                  <p className="text-xs text-gray-500 mt-2">تقييم شهري</p>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 max-w-2xl mx-auto">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <Star className="w-6 h-6 text-blue-600" />
                  <h4 className="text-lg font-bold text-blue-900">مستخدم متفاعل</h4>
                </div>
                <p className="text-blue-700 mb-2">استخدم 4+ أنواع مختلفة من التفاعل (قراءة، إعجاب، تعليق، مشاركة)</p>
                <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-bold inline-block">
                  +30 نقطة مكافأة شهرية
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Rewards Section */}
        <section className="py-12 sm:py-16 bg-gradient-to-b from-purple-50 to-white loyalty-section-mobile">
          <div className="container mx-auto px-4 loyalty-container-mobile">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 loyalty-section-title-mobile">
                المكافآت المتاحة
              </h2>
              <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto loyalty-section-subtitle-mobile">
                استبدل نقاطك بمكافآت قيّمة ومزايا حصرية
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto loyalty-rewards-mobile">
              {rewards.map((reward, index) => {
                const Icon = reward.icon;
                return (
                  <div
                    key={index}
                    className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 loyalty-reward-card-mobile"
                  >
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4 content">
                      <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-3 sm:p-4 rounded-lg sm:rounded-xl text-white icon-container">
                        <Icon className="w-6 sm:w-8 h-6 sm:h-8 icon" />
                      </div>
                      <div className="flex-1 text-center sm:text-right">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                          {reward.title}
                        </h3>
                        <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base description">
                          {reward.description}
                        </p>
                        <div className="flex items-center justify-center sm:justify-start gap-2 text-purple-600 font-medium text-sm sm:text-base required-points">
                          <Trophy className="w-3 sm:w-4 h-3 sm:h-4" />
                          <span>{reward.requiredPoints} نقطة مطلوبة</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12 sm:py-16 bg-gray-50 loyalty-section-mobile">
          <div className="container mx-auto px-4 loyalty-container-mobile">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 loyalty-section-title-mobile">
                الأسئلة الشائعة
              </h2>
              <p className="text-base sm:text-lg text-gray-600 loyalty-section-subtitle-mobile">
                كل ما تحتاج معرفته عن برنامج الولاء
              </p>
            </div>

            <div className="max-w-3xl mx-auto space-y-3 sm:space-y-4 loyalty-faq-mobile">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 loyalty-faq-card-mobile"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4 faq-content">
                    <HelpCircle className="w-5 sm:w-6 h-5 sm:h-6 text-purple-600 flex-shrink-0 mt-0 sm:mt-1 self-start faq-icon" />
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-2 text-base sm:text-lg faq-question">
                        {faq.question}
                      </h3>
                      <p className="text-gray-600 text-sm sm:text-base leading-relaxed faq-answer">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-8 sm:mt-12 faq-contact">
              <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">
                لديك سؤال آخر؟
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 text-purple-600 font-medium hover:text-purple-700 text-sm sm:text-base contact-link"
              >
                تواصل معنا
                <ArrowLeft className="w-3 sm:w-4 h-3 sm:h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-r from-purple-600 to-indigo-700 text-white loyalty-cta-mobile">
          <div className="container mx-auto px-4 text-center loyalty-container-mobile">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 loyalty-cta-title-mobile">
              ابدأ رحلة القراءة المكافئة اليوم
            </h2>
            <p className="text-lg sm:text-xl text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto loyalty-cta-subtitle-mobile">
              انضم لآلاف القراء الذين يستمتعون بالمحتوى ويكسبون المكافآت
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-white text-purple-700 px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg text-sm sm:text-base loyalty-cta-button-mobile"
            >
              سجل الآن مجاناً
              <ChevronRight className="w-4 sm:w-5 h-4 sm:h-5" />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
