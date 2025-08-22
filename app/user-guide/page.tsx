'use client';

import React from 'react';
import { 
  UserPlus, Heart, Settings, Brain, 
  BookOpen, MessageCircle, Share2, Bookmark,
  ThumbsUp, Headphones, BarChart3, Sparkles,
  CheckCircle, ArrowRight, Play
} from 'lucide-react';
import Link from 'next/link';

export default function UserGuidePage() {
  const steps = [
    {
      number: '1',
      icon: <UserPlus className="w-8 h-8" />,
      title: 'التسجيل والعضوية',
      description: 'سجّل باستخدام بريدك الإلكتروني، أنشئ ملفك الشخصي، واختر اسماً يظهر للآخرين.',
      features: [
        'التسجيل السريع بالبريد الإلكتروني',
        'إنشاء ملف شخصي مخصص',
        'اختيار اسم المستخدم المفضل'
      ]
    },
    {
      number: '2',
      icon: <Settings className="w-8 h-8" />,
      title: 'تخصيص الاهتمامات',
      description: 'اختر تصنيفاتك المفضلة (تقنية، رياضة، رأي...)، وسنقترح عليك محتوى يناسب ذوقك.',
      features: [
        'اختيار من أكثر من 20 تصنيف',
        'توصيات مخصصة حسب اهتماماتك',
        'تحديث الاهتمامات في أي وقت'
      ]
    },
    {
      number: '3',
      icon: <Heart className="w-8 h-8" />,
      title: 'التفاعل مع المحتوى',
      description: 'تفاعل مع الأخبار بطرق متعددة واجعل تجربتك أكثر ثراءً.',
      features: [
        '👍 إعجاب: احفظ الخبر في قائمة المفضلة',
        '🔖 حفظ: ارجع للخبر لاحقاً',
        '💬 تعليق: شارك برأيك',
        '📤 مشاركة: شارك الخبر مع من تحب'
      ]
    },
    {
      number: '4',
      icon: <Brain className="w-8 h-8" />,
      title: 'استخدام الذكاء الاصطناعي',
      description: 'استفد من مزايا سبق الذكية لتجربة قراءة متطورة.',
      features: [
        '🧠 الموجز الذكي: ملخص آلي لكل خبر',
        '🎧 استمع: استمع للمقال صوتياً',
        '📊 تحليل التفاعل: شاهد كم قرأت وما يهمك'
      ]
    }
  ];

  const quickTips = [
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: 'نصيحة سريعة',
      tip: 'استخدم البحث الذكي للعثور على مواضيع محددة'
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: 'وضع القراءة',
      tip: 'فعّل الوضع الليلي للقراءة المريحة في المساء'
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'تابع إحصائياتك',
      tip: 'راجع إحصائيات قراءتك في لوحة التحكم الشخصية'
    }
  ];

  return (
    <>
      <div className="min-h-screen bg-background-primary dark:bg-gray-900">
        
        {/* Hero Section - بسيط ونظيف */}
        <div className="bg-white dark:bg-gray-800 py-20">
          <div className="container mx-auto px-4 text-center">

            {/* العنوان الرئيسي */}
            <div className="max-w-4xl mx-auto">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-6 bg-blue-600 rounded-full">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold mb-6 text-gray-900 dark:text-white">
                دليل المستخدم
              </h1>
              
              <p className="text-2xl text-blue-600 dark:text-blue-400 mb-4">
                كيف تستخدم منصة سبق الذكية؟ 🤖
              </p>
              
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                دليل شامل لاستخدام جميع مزايا المنصة والاستفادة من الذكاء الاصطناعي
              </p>
            </div>
          </div>
        </div>

        {/* المحتوى الرئيسي */}
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-6xl mx-auto">
            
            {/* مقدمة */}
            <div className="text-center mb-20">
              <div className="mb-8">
                <Play className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
                <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">ابدأ رحلتك مع سبق</h2>
              </div>
              
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed max-w-3xl mx-auto">
                سبق ليست مجرد صحيفة إلكترونية، بل منصة ذكية تتعلم من اهتماماتك وتقدم لك تجربة إخبارية فريدة.
                تعلم كيف تستفيد من جميع المزايا المتاحة.
              </p>
            </div>

            {/* خطوات الاستخدام */}
            <div className="grid gap-12 mb-20">
              {steps.map((step, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
                  
                  {/* رأس الخطوة */}
                  <div className="flex items-center gap-6 mb-6">
                    <div className="relative flex-shrink-0">
                      <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white">
                        {step.icon}
                      </div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-800 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {step.number}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {step.title}
                      </h3>
                      <p className="text-lg text-gray-600 dark:text-gray-400">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* مزايا الخطوة */}
                  <div className="grid md:grid-cols-2 gap-4">
                    {step.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center gap-3 text-gray-700 dark:text-gray-300 bg-background-primary dark:bg-gray-700 rounded-xl p-4">
                        <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                </div>
              ))}
            </div>

            {/* نصائح سريعة */}
            <div className="bg-blue-50 dark:bg-gray-800 rounded-3xl p-10 mb-20">
              <div className="text-center mb-10">
                <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">نصائح مفيدة</h2>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  حيل ونصائح لتحسين تجربتك مع سبق
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8">
                {quickTips.map((tip, index) => (
                  <div key={index} className="bg-white dark:bg-gray-700 rounded-2xl p-6 text-center">
                    <div className="text-blue-600 dark:text-blue-400 mb-4 flex justify-center">
                      {tip.icon}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                      {tip.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {tip.tip}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* مركز المساعدة */}
            <div className="text-center">
              <MessageCircle className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">نحن هنا لمساعدتك</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                لم تجد ما تبحث عنه؟ فريق الدعم جاهز للمساعدة
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="mailto:support@sabq.ai" 
                  className="bg-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors"
                >
                  تواصل مع الدعم
                </a>
                <Link 
                  href="/terms-of-use" 
                  className="border-2 border-blue-600 text-blue-600 dark:text-blue-400 px-8 py-3 rounded-full font-semibold hover:bg-blue-600 hover:text-white transition-colors"
                >
                  شروط الاستخدام
                </Link>
              </div>
            </div>

          </div>
        </div>

        {/* مساحة فراغ إضافية */}
        <div className="py-16"></div>

        {/* دعوة للعمل */}
        <div className="bg-blue-600 py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              جاهز لتجربة سبق الذكية؟
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              انضم إلى آلاف القراء واستمتع بتجربة إخبارية مدعومة بالذكاء الاصطناعي
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/register" 
                className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-blue-50 transition-colors"
              >
                ابدأ الآن مجاناً
              </Link>
              <Link 
                href="/" 
                className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                استكشف المنصة
              </Link>
            </div>
          </div>
        </div>

      </div>
    </>
  );
} 