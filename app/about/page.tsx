'use client';

import React from 'react';
import Footer from '@/components/Footer';
import { 
  Newspaper, Users, Target, Award, Globe, 
  Zap, BarChart3, Calendar, TrendingUp, 
  CheckCircle, ArrowLeft, Play, Brain, Star,
  MapPin, Trophy, Clock, Sparkles
} from 'lucide-react';
import Link from 'next/link';

export default function AboutPageEnhanced() {
  const currentYear = new Date().getFullYear();
  const yearsSince2007 = currentYear - 2007;

  const stats = [
    { 
      label: 'سنوات من الريادة', 
      value: yearsSince2007, 
      icon: <Trophy className="w-6 h-6" />
    },
    { 
      label: 'مليون قارئ شهرياً', 
      value: '10+', 
      icon: <Users className="w-6 h-6" />
    },
    { 
      label: 'ألف خبر يومياً', 
      value: '5+', 
      icon: <Newspaper className="w-6 h-6" />
    },
    { 
      label: 'دولة تغطية', 
      value: '22', 
      icon: <Globe className="w-6 h-6" />
    }
  ];

  const timeline = [
    { 
      year: '2007', 
      title: 'البداية الرائدة', 
      description: 'انطلاق أول صحيفة إلكترونية سعودية متخصصة'
    },
    { 
      year: '2010', 
      title: 'التوسع الإقليمي', 
      description: 'تغطية شاملة للأحداث الخليجية والعربية'
    },
    { 
      year: '2015', 
      title: 'الثورة الرقمية', 
      description: 'إطلاق التطبيقات الذكية ومنصات التواصل الاجتماعي'
    },
    { 
      year: '2020', 
      title: 'عصر الذكاء الاصطناعي', 
      description: 'تبني تقنيات الذكاء الاصطناعي في الإنتاج الإخباري'
    },
    { 
      year: '2024', 
      title: 'منصة سبق AI', 
      description: 'إطلاق أول منصة إخبارية عربية مدعومة بالذكاء الاصطناعي'
    }
  ];

  const values = [
    'المصداقية في نقل الأخبار',
    'السرعة في الوصول للمعلومة',
    'التغطية الشاملة للأحداث',
    'الابتكار في التقنية'
  ];

  const features = [
    'تحليل عميق بالذكاء الاصطناعي',
    'تخصيص المحتوى للقارئ',
    'ملخصات صوتية',
    'نظام توصيات ذكي',
    'تحليل المشاعر',
    'ترجمة فورية'
  ];

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        
        {/* Hero Section - بسيط ونظيف */}
        <div className="bg-white dark:bg-gray-800 py-20">
          <div className="container mx-auto px-4 text-center">

            {/* العنوان الرئيسي */}
            <div className="max-w-4xl mx-auto">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-6 bg-blue-600 rounded-full">
                <Newspaper className="w-8 h-8 text-white" />
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold mb-6 text-gray-900 dark:text-white">
                صحيفة سبق
              </h1>
              
              <p className="text-2xl text-blue-600 dark:text-blue-400 mb-4">
                من أوائل الصحف الإلكترونية السعودية
              </p>
              
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                منذ عام 2007، نقود مشهد الإعلام الرقمي في المملكة والمنطقة العربية
                <br />
                بمصداقية عالية وابتكار تقني متقدم
              </p>
            </div>
          </div>
        </div>

        {/* الإحصائيات - بسيطة وأنيقة */}
        <div className="py-16 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
              {stats.map((stat, index) => (
                <div key={index} className="group">
                  <div className="mb-4 text-blue-600 dark:text-blue-400 flex justify-center">
                    {stat.icon}
                  </div>
                  <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* المحتوى الرئيسي */}
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto">
            
            {/* قصتنا */}
            <div className="text-center mb-20">
              <div className="mb-8">
                <Newspaper className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
                <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">قصتنا</h2>
              </div>
              
              <div className="space-y-6 text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                <p>
                  انطلقت صحيفة سبق الإلكترونية عام 2007 كأول صحيفة إلكترونية سعودية، 
                  لتكون رائدة في مجال الصحافة الرقمية في المملكة والمنطقة. منذ تأسيسها، 
                  حرصت سبق على تقديم محتوى إخباري موثوق وشامل يغطي كافة جوانب الحياة.
                </p>
                <p>
                  على مدار <span className="font-bold text-blue-600 dark:text-blue-400">{yearsSince2007} عاماً</span>، تطورت سبق من مجرد موقع إخباري إلى منصة 
                  إعلامية متكاملة تجمع بين الصحافة التقليدية وأحدث تقنيات الذكاء الاصطناعي، 
                  لتقدم تجربة إخبارية فريدة تلبي احتياجات القارئ العربي في عصر المعلومات.
                </p>
              </div>
            </div>

            {/* رحلة التطور */}
            <div className="mb-20">
              <div className="text-center mb-12">
                <TrendingUp className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
                <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">رحلة التطور</h2>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  معالم مهمة في مسيرة سبق نحو الريادة الإعلامية
                </p>
              </div>
              
              <div className="relative max-w-4xl mx-auto">
                {/* خط التايم لاين */}
                <div className="absolute right-1/2 transform translate-x-1/2 top-0 bottom-0 w-1 bg-blue-200 dark:bg-blue-800"></div>
                
                <div className="space-y-16">
                  {timeline.map((item, index) => (
                    <div key={index} className={`relative flex items-center ${index % 2 === 0 ? 'flex-row-reverse' : ''}`}>
                      {/* النقطة المركزية */}
                      <div className="absolute right-1/2 transform translate-x-1/2 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm z-10 border-4 border-white dark:border-gray-50">
                        {item.year}
                      </div>
                      
                      {/* محتوى التايم لاين */}
                      <div className={`w-5/12 ${index % 2 === 0 ? 'ml-auto text-left' : 'mr-auto text-right'}`}>
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-100 dark:border-gray-700">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                            {item.title}
                          </h3>
                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* الرؤية والرسالة */}
            <div className="grid md:grid-cols-2 gap-12 mb-20">
              <div className="text-center">
                <Target className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">رؤيتنا</h2>
                <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                  أن نكون المصدر الإخباري الأول والأكثر موثوقية في المنطقة، 
                  ونموذجاً رائداً في توظيف التقنية لخدمة الصحافة العربية.
                </p>
              </div>
              
              <div className="text-center">
                <Award className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">رسالتنا</h2>
                <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                  تقديم محتوى إخباري دقيق وشامل وفوري، مع الالتزام بأعلى 
                  معايير المهنية والمصداقية في عصر الإعلام الرقمي.
                </p>
              </div>
            </div>

            {/* القيم الأساسية */}
            <div className="text-center mb-20">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">قيمنا الأساسية</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-12">
                المبادئ التي تحكم عملنا وتوجه قراراتنا
              </p>
              
              <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                {values.map((value, index) => (
                  <div key={index} className="flex items-center gap-3 text-lg text-gray-700 dark:text-gray-300">
                    <CheckCircle className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    {value}
                  </div>
                ))}
              </div>
            </div>

            {/* ميزات سبق AI */}
            <div className="text-center">
              <Brain className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">ميزات سبق AI</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-12">
                تقنيات متطورة لتحسين تجربة القراءة
              </p>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 text-lg text-gray-700 dark:text-gray-300">
                    <CheckCircle className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    {feature}
                  </div>
                ))}
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
              انضم إلى ملايين القراء
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              تابع آخر الأخبار والتطورات مع سبق، صحيفتك الإلكترونية الأولى
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/" 
                className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-blue-50 transition-colors"
              >
                تصفح الأخبار
              </Link>
              <Link 
                href="/register" 
                className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                اشترك الآن
              </Link>
            </div>
          </div>
        </div>

      </div>
      <Footer />
    </>
  );
} 