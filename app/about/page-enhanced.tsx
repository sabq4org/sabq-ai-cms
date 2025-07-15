'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  Newspaper, Users, Target, Award, Globe, 
  Zap, BarChart3, Calendar, TrendingUp, 
  CheckCircle, ArrowLeft, Play, Brain, Star,
  MapPin, Trophy, Clock, Sparkles
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function AboutPageEnhanced() {
  const currentYear = new Date().getFullYear();
  const yearsSince2007 = currentYear - 2007;

  const stats = [
    { 
      label: 'سنوات من الريادة', 
      value: yearsSince2007, 
      icon: <Trophy className="w-8 h-8" />,
      color: 'from-amber-400 to-amber-600',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20',
      description: 'من التأسيس إلى الآن'
    },
    { 
      label: 'مليون قارئ شهرياً', 
      value: '10+', 
      icon: <Users className="w-8 h-8" />,
      color: 'from-blue-400 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      description: 'حول العالم'
    },
    { 
      label: 'ألف خبر يومياً', 
      value: '5+', 
      icon: <Newspaper className="w-8 h-8" />,
      color: 'from-green-400 to-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      description: 'تغطية شاملة'
    },
    { 
      label: 'دولة تغطية', 
      value: '22', 
      icon: <Globe className="w-8 h-8" />,
      color: 'from-purple-400 to-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      description: 'عبر المنطقة'
    }
  ];

  const timeline = [
    { 
      year: '2007', 
      title: 'البداية الرائدة', 
      description: 'انطلاق أول صحيفة إلكترونية سعودية متخصصة',
      icon: <Sparkles className="w-5 h-5" />,
      highlight: true
    },
    { 
      year: '2010', 
      title: 'التوسع الإقليمي', 
      description: 'تغطية شاملة للأحداث الخليجية والعربية',
      icon: <MapPin className="w-5 h-5" />
    },
    { 
      year: '2015', 
      title: 'الثورة الرقمية', 
      description: 'إطلاق التطبيقات الذكية ومنصات التواصل الاجتماعي',
      icon: <TrendingUp className="w-5 h-5" />
    },
    { 
      year: '2020', 
      title: 'عصر الذكاء الاصطناعي', 
      description: 'تبني تقنيات الذكاء الاصطناعي في الإنتاج الإخباري',
      icon: <Brain className="w-5 h-5" />
    },
    { 
      year: '2024', 
      title: 'منصة سبق AI', 
      description: 'إطلاق أول منصة إخبارية عربية مدعومة بالذكاء الاصطناعي',
      icon: <Star className="w-5 h-5" />,
      highlight: true
    }
  ];

  const values = [
    {
      icon: <CheckCircle className="w-10 h-10" />,
      title: 'المصداقية أولاً',
      description: 'نلتزم بأعلى معايير الدقة والموضوعية في نقل الأخبار والتحقق من المصادر',
      color: 'text-emerald-600 dark:text-emerald-400'
    },
    {
      icon: <Zap className="w-10 h-10" />,
      title: 'السرعة والدقة',
      description: 'نسبق في نقل الحدث مع الحفاظ على الدقة والمهنية الصحفية العالية',
      color: 'text-yellow-600 dark:text-yellow-400'
    },
    {
      icon: <Globe className="w-10 h-10" />,
      title: 'التغطية الشاملة',
      description: 'تغطية متوازنة لكافة القضايا المحلية والإقليمية والدولية المهمة',
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      icon: <Brain className="w-10 h-10" />,
      title: 'الابتكار التقني',
      description: 'توظيف أحدث التقنيات والذكاء الاصطناعي لتحسين تجربة القارئ',
      color: 'text-purple-600 dark:text-purple-400'
    }
  ];

  const features = [
    'تحليل عميق مدعوم بالذكاء الاصطناعي',
    'تخصيص المحتوى حسب اهتمامات القارئ',
    'ملخصات صوتية للأخبار الهامة',
    'نظام توصيات ذكي ومتقدم',
    'تحليل المشاعر والتوجهات العامة',
    'ترجمة فورية متعددة اللغات'
  ];

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700">
        
        {/* Hero Section - تصميم ناعم وأنيق */}
        <div className="relative bg-gradient-to-b from-white via-blue-50 to-white dark:from-slate-800 dark:via-slate-700 dark:to-slate-600 overflow-hidden">
          {/* خلفية زخرفية ناعمة */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl bg-blue-200/30 dark:bg-blue-900/20" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full blur-3xl bg-purple-200/30 dark:bg-purple-900/20" />
          </div>
          
          <div className="relative container mx-auto px-4 py-16">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm mb-8 text-slate-600 dark:text-slate-400">
              <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                الرئيسية
              </Link>
              <span>/</span>
              <span className="text-blue-600 dark:text-blue-400 font-medium">من نحن</span>
            </div>

            {/* العنوان الرئيسي - محسن */}
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-2xl">
                <Newspaper className="w-10 h-10 text-white" />
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-slate-900 via-blue-800 to-slate-900 dark:from-white dark:via-blue-300 dark:to-white bg-clip-text text-transparent">
                صحيفة سبق الإلكترونية
              </h1>
              
              <p className="text-xl md:text-2xl text-blue-700 dark:text-blue-300 mb-2 font-semibold">
                أول صحيفة إلكترونية سعودية
              </p>
              
              <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
                منذ 2007 .. نسبق في نقل الحدث بمصداقية وابتكار
              </p>
            </div>
          </div>
        </div>

        {/* الإحصائيات المحسنة - Grid منظم وجذاب */}
        <div className="container mx-auto px-4 -mt-12 mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className={`${stat.bgColor} backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 text-center group hover:scale-105 border border-white/20`}
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 mb-4 rounded-xl bg-gradient-to-r ${stat.color} text-white shadow-lg group-hover:scale-110 transition-transform`}>
                  {stat.icon}
                </div>
                <div className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {stat.label}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  {stat.description}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* المحتوى الرئيسي */}
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-7xl mx-auto">
            
            {/* قصتنا - محسنة */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl shadow-xl p-10 mb-12 border border-white/20">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-3 mb-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                    <Newspaper className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-4xl font-bold text-slate-900 dark:text-white">قصتنا</h2>
                </div>
              </div>
              
              <div className="prose prose-xl max-w-none text-slate-700 dark:text-slate-300 leading-relaxed space-y-6">
                <p className="text-xl leading-relaxed text-center max-w-4xl mx-auto">
                  انطلقت صحيفة سبق الإلكترونية عام 2007 كأول صحيفة إلكترونية سعودية، 
                  لتكون رائدة في مجال الصحافة الرقمية في المملكة والمنطقة. منذ تأسيسها، 
                  حرصت سبق على تقديم محتوى إخباري موثوق وشامل يغطي كافة جوانب الحياة.
                </p>
                <p className="text-xl leading-relaxed text-center max-w-4xl mx-auto">
                  على مدار <span className="font-bold text-blue-600 dark:text-blue-400">{yearsSince2007} عاماً</span>، تطورت سبق من مجرد موقع إخباري إلى منصة 
                  إعلامية متكاملة تجمع بين الصحافة التقليدية وأحدث تقنيات الذكاء الاصطناعي، 
                  لتقدم تجربة إخبارية فريدة تلبي احتياجات القارئ العربي في عصر المعلومات.
                </p>
              </div>
            </div>

            {/* Timeline - تصميم أنيق ومتطور */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl shadow-xl p-10 mb-12 border border-white/20">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-3 mb-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                    <TrendingUp className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h2 className="text-4xl font-bold text-slate-900 dark:text-white">رحلة التطور والإنجاز</h2>
                </div>
                <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                  معالم مهمة في مسيرة سبق نحو الريادة الإعلامية والتكنولوجية
                </p>
              </div>
              
              <div className="relative max-w-4xl mx-auto">
                {/* خط التايم لاين */}
                <div className="absolute right-1/2 transform translate-x-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 via-purple-500 to-blue-600 rounded-full"></div>
                
                {timeline.map((item, index) => (
                  <div 
                    key={index} 
                    className={`relative flex items-center mb-12 last:mb-0 ${
                      index % 2 === 0 ? 'flex-row-reverse' : ''
                    }`}
                  >
                    {/* النقطة المركزية */}
                    <div className={`absolute right-1/2 transform translate-x-1/2 w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg z-10 ${
                      item.highlight 
                        ? 'bg-gradient-to-r from-amber-400 to-amber-600 ring-4 ring-amber-200' 
                        : 'bg-gradient-to-r from-blue-500 to-purple-600'
                    }`}>
                      {item.icon}
                    </div>
                    
                    {/* محتوى التايم لاين */}
                    <div className={`w-5/12 ${index % 2 === 0 ? 'ml-auto' : 'mr-auto'}`}>
                      <div className={`bg-gradient-to-br ${
                        item.highlight 
                          ? 'from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-200' 
                          : 'from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-600 border-slate-200 dark:border-slate-500'
                      } rounded-2xl p-6 shadow-lg border`}>
                        <div className="flex items-center gap-3 mb-3">
                          <span className={`text-2xl font-bold ${
                            item.highlight ? 'text-amber-600 dark:text-amber-400' : 'text-blue-600 dark:text-blue-400'
                          }`}>
                            {item.year}
                          </span>
                          {item.highlight && <Star className="w-5 h-5 text-amber-500" />}
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                          {item.title}
                        </h3>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* الرؤية والرسالة - محسنة */}
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-3xl shadow-xl p-8 border border-blue-200/50">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-lg">
                    <Target className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white">رؤيتنا</h2>
                </div>
                <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                  أن نكون المصدر الإخباري الأول والأكثر موثوقية في المنطقة، 
                  ونموذجاً رائداً في توظيف التقنية لخدمة الصحافة العربية وتطوير تجربة القارئ.
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-3xl shadow-xl p-8 border border-emerald-200/50">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-lg">
                    <Award className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white">رسالتنا</h2>
                </div>
                <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                  تقديم محتوى إخباري دقيق وشامل وفوري، مع الالتزام بأعلى 
                  معايير المهنية والمصداقية، وتوظيف أحدث التقنيات لتحسين تجربة القارئ المعاصر.
                </p>
              </div>
            </div>

            {/* القيم الأساسية - محسنة */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl shadow-xl p-10 mb-12 border border-white/20">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">قيمنا الأساسية</h2>
                <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                  المبادئ التي تحكم عملنا وتوجه قراراتنا في كل ما نقوم به
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {values.map((value, index) => (
                  <div key={index} className="text-center group hover:scale-105 transition-transform duration-300">
                    <div className="bg-white dark:bg-slate-700 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-600 h-full">
                      <div className={`mb-4 flex justify-center ${value.color}`}>
                        {value.icon}
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                        {value.title}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-base">
                        {value.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ميزات سبق AI */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-3xl shadow-xl p-10 border border-purple-200/50">
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-3 mb-4">
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-lg">
                    <Brain className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h2 className="text-4xl font-bold text-slate-900 dark:text-white">ميزات سبق AI</h2>
                </div>
                <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                  تقنيات متطورة لتحسين تجربة القراءة والوصول للمعلومات
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 bg-white/80 dark:bg-slate-700/80 rounded-xl p-4 shadow-lg border border-purple-200/50">
                    <CheckCircle className="w-6 h-6 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300 font-medium">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
} 