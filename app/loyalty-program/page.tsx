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
      points: "0 - 199",
      color: "bg-orange-100 border-orange-400",
      iconColor: "text-orange-600",
      icon: Star,
      benefits: ["قراءة المقالات", "التعليق والمشاركة", "حفظ المقالات"],
    },
    {
      name: "قارئ فضي",
      points: "200 - 499",
      color: "bg-gray-100 border-gray-400",
      iconColor: "text-gray-600",
      icon: Award,
      benefits: ["جميع مزايا البرونزي", "محتوى حصري", "شارة فضية"],
    },
    {
      name: "قارئ ذهبي",
      points: "500 - 999",
      color: "bg-yellow-100 border-yellow-400",
      iconColor: "text-yellow-600",
      icon: Trophy,
      benefits: ["جميع مزايا الفضي", "بدون إعلانات", "دعوات لفعاليات"],
    },
    {
      name: "قارئ ألماسي",
      points: "1000+",
      color: "bg-purple-100 border-purple-400",
      iconColor: "text-purple-600",
      icon: Crown,
      benefits: ["جميع المزايا", "محتوى VIP", "مكافآت حصرية"],
    },
  ];

  const pointsActivities = [
    {
      activity: "قراءة مقال كامل",
      points: 5,
      icon: CheckCircle,
      description: "اقرأ المقال حتى النهاية",
    },
    {
      activity: "مشاركة المحتوى",
      points: 10,
      icon: Users,
      description: "شارك مع أصدقائك",
    },
    {
      activity: "التفاعل بإعجاب",
      points: 2,
      icon: Heart,
      description: "أعجبك المحتوى؟ أخبرنا",
    },
    {
      activity: "كتابة تعليق",
      points: 3,
      icon: MessageCircle,
      description: "شارك رأيك",
    },
    {
      activity: "حفظ للقراءة",
      points: 4,
      icon: Bookmark,
      description: "احفظ المقالات المهمة",
    },
    {
      activity: "الزيارة اليومية",
      points: 2,
      icon: Calendar,
      description: "زرنا كل يوم",
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
        "اكسب النقاط تلقائياً عند القراءة والتفاعل مع المحتوى. كل نشاط له قيمة نقطية محددة.",
    },
    {
      question: "متى يمكنني استبدال النقاط؟",
      answer:
        "يمكنك استبدال النقاط بالمكافآت عند الوصول للحد المطلوب لكل مكافأة.",
    },
    {
      question: "هل تنتهي صلاحية النقاط؟",
      answer:
        "النقاط صالحة دائماً طالما كنت نشطاً. النشاط يعني زيارة واحدة كل 90 يوماً.",
    },
    {
      question: "كيف أرتقي في المستويات؟",
      answer:
        "ترتقي تلقائياً عند جمع النقاط المطلوبة. كل مستوى يفتح مزايا جديدة.",
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
                        <div className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2.5 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium points">
                          <TrendingUp className="w-3 h-3" />
                          <span>{activity.points} نقاط</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
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
