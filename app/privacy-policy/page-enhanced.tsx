'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  Shield, Lock, Eye, FileText, UserCheck, 
  Database, Share2, AlertCircle, ChevronLeft,
  Newspaper, CheckCircle, Users, Globe, Clock,
  Settings, Key, Heart, Bell
} from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPolicyPageEnhanced() {
  const sections = [
    {
      id: 'intro',
      title: 'مقدمة عن الخصوصية',
      icon: <FileText className="w-6 h-6" />,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      content: 'نحن في صحيفة سبق الإلكترونية نقدر ثقتكم ونلتزم بحماية خصوصيتكم. توضح هذه السياسة كيفية جمعنا واستخدامنا وحمايتنا لمعلوماتكم الشخصية بأعلى معايير الأمان والشفافية.'
    },
    {
      id: 'data-collection',
      title: 'المعلومات التي نجمعها',
      icon: <Database className="w-6 h-6" />,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      content: 'نجمع المعلومات الضرورية لتحسين تجربتكم الإخبارية، مثل: البريد الإلكتروني عند التسجيل، تفضيلات القراءة والاهتمامات، التفاعلات مع المحتوى، وبيانات الاستخدام التحليلية.'
    },
    {
      id: 'usage',
      title: 'كيف نستخدم معلوماتكم',
      icon: <UserCheck className="w-6 h-6" />,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      content: 'نستخدم معلوماتكم لتخصيص المحتوى الإخباري حسب اهتماماتكم، إرسال النشرات البريدية المختارة، تحسين خدماتنا باستمرار، وضمان أمان المنصة من التهديدات.'
    },
    {
      id: 'protection',
      title: 'حماية المعلومات والأمان',
      icon: <Shield className="w-6 h-6" />,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      content: 'نطبق أعلى معايير الأمان لحماية بياناتكم، بما في ذلك التشفير المتقدم، المصادقة الثنائية، المراجعات الأمنية الدورية، وبروتوكولات الحماية من الاختراق.'
    },
    {
      id: 'sharing',
      title: 'مشاركة المعلومات مع الآخرين',
      icon: <Share2 className="w-6 h-6" />,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      content: 'لا نبيع أو نشارك معلوماتكم الشخصية مع أطراف ثالثة إلا في حالات قانونية محددة أو بموافقتكم الصريحة المكتوبة. خصوصيتكم أولوية قصوى لدينا.'
    },
    {
      id: 'rights',
      title: 'حقوقكم في البيانات',
      icon: <Eye className="w-6 h-6" />,
      color: 'from-teal-500 to-teal-600',
      bgColor: 'bg-teal-50 dark:bg-teal-900/20',
      content: 'لكم الحق الكامل في الوصول إلى بياناتكم، تحديثها، حذفها نهائياً، أو الاعتراض على معالجتها. يمكنكم ممارسة هذه الحقوق بسهولة عبر إعدادات حسابكم أو التواصل معنا.'
    },
    {
      id: 'cookies',
      title: 'ملفات تعريف الارتباط',
      icon: <Lock className="w-6 h-6" />,
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
      content: 'نستخدم ملفات تعريف الارتباط الضرورية لتحسين تجربة التصفح وتذكر تفضيلاتكم. يمكنكم إدارة وتخصيص إعدادات ملفات تعريف الارتباط من خلال متصفحكم أو إعدادات الموقع.'
    },
    {
      id: 'updates',
      title: 'تحديثات سياسة الخصوصية',
      icon: <AlertCircle className="w-6 h-6" />,
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20',
      content: 'قد نحدث سياسة الخصوصية من وقت لآخر لتحسين الخدمة أو للامتثال للقوانين الجديدة. سنعلمكم بأي تغييرات جوهرية مسبقاً عبر البريد الإلكتروني أو إشعار بارز على الموقع.'
    }
  ];

  const principles = [
    {
      icon: <Heart className="w-8 h-8" />,
      title: 'الشفافية الكاملة',
      description: 'نوضح بوضوح كيف نجمع ونستخدم معلوماتكم'
    },
    {
      icon: <Key className="w-8 h-8" />,
      title: 'التحكم الكامل',
      description: 'أنتم تتحكمون في بياناتكم ويمكنكم تعديلها أو حذفها'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'الأمان المتقدم',
      description: 'نحمي بياناتكم بأعلى معايير الأمان العالمية'
    },
    {
      icon: <CheckCircle className="w-8 h-8" />,
      title: 'الامتثال القانوني',
      description: 'نلتزم بجميع القوانين المحلية والدولية للخصوصية'
    }
  ];

  const stats = [
    {
      value: '256-bit',
      label: 'تشفير متقدم',
      icon: <Lock className="w-6 h-6" />,
      description: 'لحماية بياناتكم'
    },
    {
      value: '24/7',
      label: 'مراقبة أمنية',
      icon: <Eye className="w-6 h-6" />,
      description: 'حماية مستمرة'
    },
    {
      value: '99.9%',
      label: 'موثوقية النظام',
      icon: <Shield className="w-6 h-6" />,
      description: 'خدمة مستقرة'
    },
    {
      value: 'GDPR',
      label: 'متوافق مع',
      icon: <Globe className="w-6 h-6" />,
      description: 'المعايير العالمية'
    }
  ];

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700">
        
        {/* Hero Section - تصميم ناعم وأنيق */}
        <div className="relative bg-gradient-to-b from-white via-green-50 to-white dark:from-slate-800 dark:via-slate-700 dark:to-slate-600 overflow-hidden">
          {/* خلفية زخرفية ناعمة */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl bg-green-200/30 dark:bg-green-900/20" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full blur-3xl bg-blue-200/30 dark:bg-blue-900/20" />
          </div>
          
          <div className="relative container mx-auto px-4 py-16">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm mb-8 text-slate-600 dark:text-slate-400">
              <Link href="/" className="hover:text-green-600 dark:hover:text-green-400 transition-colors">
                الرئيسية
              </Link>
              <span>/</span>
              <span className="text-green-600 dark:text-green-400 font-medium">سياسة الخصوصية</span>
            </div>

            {/* العنوان الرئيسي - محسن */}
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 shadow-2xl">
                <Shield className="w-10 h-10 text-white" />
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-slate-900 via-green-800 to-slate-900 dark:from-white dark:via-green-300 dark:to-white bg-clip-text text-transparent">
                سياسة الخصوصية
              </h1>
              
              <p className="text-xl md:text-2xl text-green-700 dark:text-green-300 mb-2 font-semibold">
                حماية خصوصيتكم أولويتنا
              </p>
              
              <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
                نلتزم بحماية معلوماتكم الشخصية وفقاً لأعلى معايير الأمان والشفافية
              </p>
            </div>
          </div>
        </div>

        {/* إحصائيات الأمان */}
        <div className="container mx-auto px-4 -mt-12 mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 text-center group hover:scale-105 border border-white/20"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 mb-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg group-hover:scale-110 transition-transform">
                  {stat.icon}
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {stat.label}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {stat.description}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* المحتوى الرئيسي */}
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto">
            
            {/* مبادئ الخصوصية */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl shadow-xl p-10 mb-12 border border-white/20">
              <div className="text-center mb-10">
                <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">مبادئنا في الخصوصية</h2>
                <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                  القيم الأساسية التي توجه التزامنا بحماية خصوصيتكم
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {principles.map((principle, index) => (
                  <div key={index} className="text-center group hover:scale-105 transition-transform duration-300">
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-600 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-500 h-full">
                      <div className="text-green-600 dark:text-green-400 mb-4 flex justify-center">
                        {principle.icon}
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
                        {principle.title}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                        {principle.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* آخر تحديث */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl p-6 mb-8 border border-blue-200/50">
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">آخر تحديث للسياسة</h3>
                  <p className="text-slate-600 dark:text-slate-400">15 يوليو 2024 - تحديث شامل لتعزيز الحماية</p>
                </div>
              </div>
            </div>

            {/* أقسام السياسة */}
            <div className="space-y-8">
              {sections.map((section, index) => (
                <div 
                  key={section.id}
                  className={`${section.bgColor} rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border border-white/20 group`}
                  id={section.id}
                >
                  <div className="flex items-start gap-6">
                    <div className={`flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-r ${section.color} text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                      {section.icon}
                    </div>
                    
                    <div className="flex-1">
                      <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4">
                        {section.title}
                      </h2>
                      <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                        {section.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* فهرس سريع */}
            <div className="mt-12 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-white/20">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">
                الانتقال السريع للأقسام
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {sections.map((section, index) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors group"
                  >
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${section.color} text-white flex items-center justify-center text-sm`}>
                      {section.icon}
                    </div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white">
                      {section.title}
                    </span>
                  </a>
                ))}
              </div>
            </div>

            {/* معلومات التواصل */}
            <div className="mt-12 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-600 rounded-3xl shadow-xl p-10 border border-slate-200 dark:border-slate-500">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                  <Bell className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                  لديكم أسئلة حول الخصوصية؟
                </h3>
                
                <p className="text-lg text-slate-600 dark:text-slate-400 mb-6 max-w-2xl mx-auto">
                  فريق الخصوصية لدينا مستعد للإجابة على جميع استفساراتكم والمساعدة في إدارة إعدادات حسابكم
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a 
                    href="mailto:privacy@sabq.ai" 
                    className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors shadow-lg hover:shadow-xl"
                  >
                    <FileText className="w-5 h-5" />
                    تواصل مع فريق الخصوصية
                  </a>
                  
                  <Link 
                    href="/settings" 
                    className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-colors shadow-lg hover:shadow-xl"
                  >
                    <Settings className="w-5 h-5" />
                    إدارة إعدادات الحساب
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
} 