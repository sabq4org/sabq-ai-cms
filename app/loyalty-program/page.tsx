'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  Trophy, Target, Gift, Star, Users, 
  Award, Heart, MessageCircle, Bookmark, 
  CheckCircle, Clock, TrendingUp, Sparkles,
  Shield, Calendar, Zap, HelpCircle,
  ArrowLeft, ChevronRight, Crown, UserCheck
} from 'lucide-react';
import Link from 'next/link';

export default function LoyaltyProgramPage() {
  const membershipTiers = [
    { 
      name: 'قارئ برونزي', 
      points: '0 - 199', 
      color: 'bg-orange-100 border-orange-400', 
      iconColor: 'text-orange-600',
      icon: Star,
      benefits: ['قراءة المقالات', 'التعليق والمشاركة', 'حفظ المقالات']
    },
    { 
      name: 'قارئ فضي', 
      points: '200 - 499', 
      color: 'bg-gray-100 border-gray-400', 
      iconColor: 'text-gray-600',
      icon: Award,
      benefits: ['جميع مزايا البرونزي', 'محتوى حصري', 'شارة فضية']
    },
    { 
      name: 'قارئ ذهبي', 
      points: '500 - 999', 
      color: 'bg-yellow-100 border-yellow-400', 
      iconColor: 'text-yellow-600',
      icon: Trophy,
      benefits: ['جميع مزايا الفضي', 'بدون إعلانات', 'دعوات لفعاليات']
    },
    { 
      name: 'قارئ ألماسي', 
      points: '1000+', 
      color: 'bg-purple-100 border-purple-400', 
      iconColor: 'text-purple-600',
      icon: Crown,
      benefits: ['جميع المزايا', 'محتوى VIP', 'مكافآت حصرية']
    }
  ];

  const pointsActivities = [
    { activity: 'قراءة مقال كامل', points: 5, icon: CheckCircle, description: 'اقرأ المقال حتى النهاية' },
    { activity: 'مشاركة المحتوى', points: 10, icon: Users, description: 'شارك مع أصدقائك' },
    { activity: 'التفاعل بإعجاب', points: 2, icon: Heart, description: 'أعجبك المحتوى؟ أخبرنا' },
    { activity: 'كتابة تعليق', points: 3, icon: MessageCircle, description: 'شارك رأيك' },
    { activity: 'حفظ للقراءة', points: 4, icon: Bookmark, description: 'احفظ المقالات المهمة' },
    { activity: 'الزيارة اليومية', points: 2, icon: Calendar, description: 'زرنا كل يوم' },
  ];

  const rewards = [
    {
      title: 'محتوى حصري',
      description: 'اشتراك مجاني في المحتوى المميز بدون إعلانات',
      icon: Sparkles,
      requiredPoints: 500
    },
    {
      title: 'مكافآت الشركاء',
      description: 'قسائم خصم وعروض حصرية من شركائنا المميزين',
      icon: Gift,
      requiredPoints: 750
    },
    {
      title: 'شارات التميز',
      description: 'شارات خاصة تظهر بجانب اسمك في المنصة',
      icon: Shield,
      requiredPoints: 200
    },
    {
      title: 'تجارب مبكرة',
      description: 'كن أول من يجرب المزايا والتحديثات الجديدة',
      icon: Zap,
      requiredPoints: 1000
    }
  ];

  const faqs = [
    {
      question: 'كيف أكسب النقاط؟',
      answer: 'اكسب النقاط تلقائياً عند القراءة والتفاعل مع المحتوى. كل نشاط له قيمة نقطية محددة.'
    },
    {
      question: 'متى يمكنني استبدال النقاط؟',
      answer: 'يمكنك استبدال النقاط بالمكافآت عند الوصول للحد المطلوب لكل مكافأة.'
    },
    {
      question: 'هل تنتهي صلاحية النقاط؟',
      answer: 'النقاط صالحة دائماً طالما كنت نشطاً. النشاط يعني زيارة واحدة كل 90 يوماً.'
    },
    {
      question: 'كيف أرتقي في المستويات؟',
      answer: 'ترتقي تلقائياً عند جمع النقاط المطلوبة. كل مستوى يفتح مزايا جديدة.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 text-white py-20 overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                <Trophy className="w-5 h-5 text-yellow-300" />
                <span className="text-sm font-medium">برنامج الولاء الجديد</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                اقرأ، تفاعل، واكسب
              </h1>
              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                انضم لبرنامج النقاط واحصل على مكافآت حصرية مع كل قراءة وتفاعل
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/register" className="bg-white text-purple-700 px-8 py-4 rounded-full font-bold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg">
                  ابدأ رحلتك الآن
                </Link>
                <Link href="#how-it-works" className="border-2 border-white text-white px-8 py-4 rounded-full font-bold hover:bg-white hover:text-purple-700 transition-all">
                  كيف يعمل البرنامج
                </Link>
              </div>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-10 left-10 opacity-20">
            <Star className="w-20 h-20 text-yellow-300 animate-pulse" />
          </div>
          <div className="absolute bottom-10 right-10 opacity-20">
            <Trophy className="w-24 h-24 text-yellow-300 animate-pulse" />
          </div>
        </section>

        {/* Membership Tiers */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                مستويات العضوية
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                ارتق في المستويات واحصل على مزايا أكثر مع كل إنجاز
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {membershipTiers.map((tier, index) => {
                const Icon = tier.icon;
                return (
                  <div 
                    key={index} 
                    className={`${tier.color} border-2 rounded-2xl p-6 relative overflow-hidden transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl`}
                  >
                    <div className="relative z-10">
                      <Icon className={`w-12 h-12 ${tier.iconColor} mb-4`} />
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                      <p className="text-gray-700 font-medium mb-4">{tier.points} نقطة</p>
                      <ul className="space-y-2">
                        {tier.benefits.map((benefit, i) => (
                          <li key={i} className="flex items-start gap-2 text-gray-700">
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{benefit}</span>
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
        <section id="how-it-works" className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                كيف تكسب النقاط؟
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                كل تفاعل له قيمة، وكل قراءة تقربك من المكافآت
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {pointsActivities.map((activity, index) => {
                const Icon = activity.icon;
                return (
                  <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:border-purple-300">
                    <div className="flex items-start gap-4">
                      <div className="bg-purple-100 p-3 rounded-lg">
                        <Icon className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 mb-1">{activity.activity}</h3>
                        <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                        <div className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
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
        <section className="py-16 bg-gradient-to-b from-purple-50 to-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                المكافآت المتاحة
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                استبدل نقاطك بمكافآت قيّمة ومزايا حصرية
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {rewards.map((reward, index) => {
                const Icon = reward.icon;
                return (
                  <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                    <div className="flex items-start gap-4">
                      <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-4 rounded-xl text-white">
                        <Icon className="w-8 h-8" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{reward.title}</h3>
                        <p className="text-gray-600 mb-4">{reward.description}</p>
                        <div className="flex items-center gap-2 text-purple-600 font-medium">
                          <Trophy className="w-4 h-4" />
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
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                الأسئلة الشائعة
              </h2>
              <p className="text-lg text-gray-600">
                كل ما تحتاج معرفته عن برنامج الولاء
              </p>
            </div>

            <div className="max-w-3xl mx-auto space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white rounded-xl p-6 border border-gray-200">
                  <div className="flex items-start gap-4">
                    <HelpCircle className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">{faq.question}</h3>
                      <p className="text-gray-600">{faq.answer}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <p className="text-gray-600 mb-4">لديك سؤال آخر؟</p>
              <Link href="/contact" className="inline-flex items-center gap-2 text-purple-600 font-medium hover:text-purple-700">
                تواصل معنا
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-purple-600 to-indigo-700 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              ابدأ رحلة القراءة المكافئة اليوم
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              انضم لآلاف القراء الذين يستمتعون بالمحتوى ويكسبون المكافآت
            </p>
            <Link href="/register" className="inline-flex items-center gap-2 bg-white text-purple-700 px-8 py-4 rounded-full font-bold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg">
              سجل الآن مجاناً
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
} 