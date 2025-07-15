'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  Newspaper, Users, Target, Award, Globe, 
  Zap, BarChart3, Calendar, TrendingUp, 
  CheckCircle, ArrowLeft, Play, Brain
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function AboutPage() {
  const currentYear = new Date().getFullYear();
  const yearsSince2007 = currentYear - 2007;

  const stats = [
    { label: 'سنوات من الريادة', value: yearsSince2007, icon: <Calendar className="w-6 h-6" /> },
    { label: 'مليون قارئ شهرياً', value: '10+', icon: <Users className="w-6 h-6" /> },
    { label: 'ألف خبر يومياً', value: '5+', icon: <Newspaper className="w-6 h-6" /> },
    { label: 'تغطية دولة', value: '22', icon: <Globe className="w-6 h-6" /> }
  ];

  const milestones = [
    { year: 2007, title: 'التأسيس', description: 'انطلاق أول صحيفة إلكترونية سعودية' },
    { year: 2010, title: 'التوسع الإقليمي', description: 'تغطية شاملة للأحداث الخليجية والعربية' },
    { year: 2015, title: 'الريادة الرقمية', description: 'إطلاق التطبيقات الذكية ومنصات التواصل' },
    { year: 2020, title: 'التحول الذكي', description: 'تبني تقنيات الذكاء الاصطناعي في الإنتاج الإخباري' },
    { year: 2024, title: 'سبق AI', description: 'إطلاق منصة سبق المدعومة بالذكاء الاصطناعي' }
  ];

  const values = [
    {
      icon: <CheckCircle className="w-8 h-8" />,
      title: 'المصداقية',
      description: 'نلتزم بأعلى معايير الدقة والموضوعية في نقل الأخبار'
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'السرعة',
      description: 'نسبق في نقل الحدث مع الحفاظ على الدقة والمهنية'
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: 'الشمولية',
      description: 'تغطية متوازنة لكافة القضايا المحلية والإقليمية والدولية'
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: 'الابتكار',
      description: 'توظيف أحدث التقنيات لتحسين تجربة القارئ'
    }
  ];

  const features = [
    'تحليل عميق مدعوم بالذكاء الاصطناعي',
    'تخصيص المحتوى حسب اهتمامات القارئ',
    'ملخصات صوتية للأخبار',
    'نظام توصيات ذكي',
    'تحليل المشاعر والتوجهات',
    'ترجمة فورية متعددة اللغات'
  ];

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-blue-900 to-blue-800 text-white">
          <div className="container mx-auto px-4 py-12">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm mb-6 text-blue-100">
              <Link href="/" className="hover:text-white transition-colors">
                الرئيسية
              </Link>
              <span>/</span>
              <span>من نحن</span>
            </div>

            {/* Title Section */}
            <div className="max-w-4xl">
              <h1 className="text-3xl md:text-5xl font-bold mb-4">صحيفة سبق الإلكترونية</h1>
              <p className="text-xl text-blue-50 mb-2">أول صحيفة إلكترونية سعودية</p>
              <p className="text-lg text-blue-100">منذ 2007 .. نسبق في نقل الحدث</p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="container mx-auto px-4 -mt-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow"
              >
                <div className="text-blue-600 dark:text-blue-400 mb-3 flex justify-center">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto">
            {/* Story Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 mb-8">
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <Newspaper className="w-8 h-8 text-blue-600" />
                قصتنا
              </h2>
              <div className="prose prose-lg max-w-none text-gray-700 dark:text-gray-300">
                <p className="mb-4 leading-relaxed">
                  انطلقت صحيفة سبق الإلكترونية عام 2007 كأول صحيفة إلكترونية سعودية، 
                  لتكون رائدة في مجال الصحافة الرقمية في المملكة والمنطقة. منذ تأسيسها، 
                  حرصت سبق على تقديم محتوى إخباري موثوق وشامل يغطي كافة جوانب الحياة.
                </p>
                <p className="leading-relaxed">
                  على مدار {yearsSince2007} عاماً، تطورت سبق من مجرد موقع إخباري إلى منصة 
                  إعلامية متكاملة تجمع بين الصحافة التقليدية وأحدث تقنيات الذكاء الاصطناعي، 
                  لتقدم تجربة إخبارية فريدة تلبي احتياجات القارئ العربي في عصر المعلومات.
                </p>
              </div>
            </div>

            {/* Timeline Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 mb-8">
              <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-blue-600" />
                رحلة التطور
              </h2>
              <div className="relative">
                <div className="absolute right-4 top-0 bottom-0 w-0.5 bg-blue-200 dark:bg-blue-800"></div>
                {milestones.map((milestone, index) => (
                  <div key={index} className="relative flex items-start mb-8 last:mb-0">
                    <div className="absolute right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="mr-12 flex-1">
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-blue-600 dark:text-blue-400 font-bold">{milestone.year}</span>
                          <h3 className="text-xl font-bold">{milestone.title}</h3>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300">{milestone.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Vision & Mission */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Target className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-2xl font-bold">رؤيتنا</h2>
                </div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  أن نكون المصدر الإخباري الأول والأكثر موثوقية في المنطقة، 
                  ونموذجاً رائداً في توظيف التقنية لخدمة الصحافة العربية.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Award className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-2xl font-bold">رسالتنا</h2>
                </div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  تقديم محتوى إخباري دقيق وشامل وفوري، مع الالتزام بأعلى 
                  معايير المهنية والمصداقية، وتوظيف أحدث التقنيات لتحسين تجربة القارئ.
                </p>
              </div>
            </div>

            {/* Values Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 mb-8">
              <h2 className="text-3xl font-bold mb-8 text-center">قيمنا الأساسية</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {values.map((value, index) => (
                  <div key={index} className="text-center">
                    <div className="text-blue-600 dark:text-blue-400 mb-3 flex justify-center">
                      {value.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {value.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Features */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-700 rounded-xl p-8 mb-8">
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <Brain className="w-8 h-8 text-blue-600" />
                سبق والذكاء الاصطناعي
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg">
                نوظف أحدث تقنيات الذكاء الاصطناعي لتقديم تجربة إخبارية متميزة:
              </p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-lg p-4">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Section */}
            <div className="text-center py-12">
              <h3 className="text-2xl font-bold mb-4">انضم إلى ملايين القراء</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                كن جزءاً من مجتمع سبق واحصل على آخر الأخبار والتحليلات
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  سجل الآن
                </Link>
                <Link 
                  href="/"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  تصفح الأخبار
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
} 