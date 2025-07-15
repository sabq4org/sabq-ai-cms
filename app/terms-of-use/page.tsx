'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  FileText, CheckCircle, UserCheck, Shield,
  AlertTriangle, Gavel, Mail, Users
} from 'lucide-react';
import Link from 'next/link';

export default function TermsOfUsePage() {
  const sections = [
    {
      title: 'التسجيل والعضوية',
      content: 'التسجيل في الموقع متاح للجميع. يجب أن تكون جميع البيانات المقدمة صحيحة ومحدثة. يحق لـ"سبق" إيقاف أو حذف الحسابات الوهمية أو المخالفة.'
    },
    {
      title: 'استخدام المحتوى',
      content: 'المحتوى المنشور مملوك للصحيفة، ويُمنع نسخه أو إعادة نشره بدون إذن رسمي. يمكن مشاركة روابط المقالات مع الإشارة إلى المصدر.'
    },
    {
      title: 'التفاعل والمشاركة',
      content: 'يلتزم المستخدم بعدم نشر تعليقات مسيئة أو خادشة للذوق العام. يحق لإدارة المنصة حذف أو إخفاء أي تفاعل غير لائق.'
    },
    {
      title: 'سياسة التحديث',
      content: 'تحتفظ "سبق" بحق تعديل هذه الشروط في أي وقت. يتم إشعار المستخدمين في حال وجود تغييرات جوهرية.'
    },
    {
      title: 'الإخلاء من المسؤولية',
      content: 'تقدم "سبق" محتواها كما هو، دون ضمانات. المستخدم يتحمل مسؤولية تفسير أو استخدام المعلومات المنشورة.'
    }
  ];

  const highlights = [
    'استخدام مسؤول للمنصة',
    'احترام حقوق الملكية الفكرية',
    'التفاعل الإيجابي مع المجتمع',
    'الامتثال للقوانين المحلية'
  ];

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        
        {/* Hero Section - بسيط ونظيف */}
        <div className="bg-white dark:bg-gray-800 py-20">
          <div className="container mx-auto px-4 text-center">

            {/* العنوان الرئيسي */}
            <div className="max-w-4xl mx-auto">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-6 bg-blue-600 rounded-full">
                <Gavel className="w-8 h-8 text-white" />
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold mb-6 text-gray-900 dark:text-white">
                شروط الاستخدام
              </h1>
              
              <p className="text-2xl text-blue-600 dark:text-blue-400 mb-4">
                مرحباً بك في صحيفة سبق الإلكترونية!
              </p>
              
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                باستخدامك لمنصتنا فإنك توافق على الشروط التالية
                <br />
                نأمل منك قراءتها بعناية
              </p>
            </div>
          </div>
        </div>

        {/* المحتوى الرئيسي */}
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto">
            
            {/* مقدمة */}
            <div className="text-center mb-20">
              <div className="mb-8">
                <FileText className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
                <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">شروط استخدام المنصة</h2>
              </div>
              
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                هذه الشروط تحكم استخدامك لمنصة سبق الإلكترونية وتضمن تجربة آمنة ومفيدة لجميع المستخدمين.
                نحن نقدر التزامك بهذه المبادئ لبناء مجتمع إخباري متميز.
              </p>
            </div>

            {/* أقسام الشروط */}
            <div className="space-y-12 mb-20">
              {sections.map((section, index) => (
                <div key={index} className="pb-8 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    {index + 1}. {section.title}
                  </h3>
                  <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                    {section.content}
                  </p>
                </div>
              ))}
            </div>

            {/* النقاط المهمة */}
            <div className="text-center mb-20">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">التزاماتك الأساسية</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-12">
                المبادئ التي نتوقع من كل مستخدم الالتزام بها
              </p>
              
              <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                {highlights.map((highlight, index) => (
                  <div key={index} className="flex items-center gap-3 text-lg text-gray-700 dark:text-gray-300">
                    <CheckCircle className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    {highlight}
                  </div>
                ))}
              </div>
            </div>

            {/* معلومات الاتصال */}
            <div className="text-center">
              <Mail className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">لديك استفسار؟</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                إذا كان لديك أي استفسار بخصوص شروط الاستخدام
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="mailto:support@sabq.ai" 
                  className="bg-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors"
                >
                  تواصل معنا
                </a>
                <Link 
                  href="/user-guide" 
                  className="border-2 border-blue-600 text-blue-600 dark:text-blue-400 px-8 py-3 rounded-full font-semibold hover:bg-blue-600 hover:text-white transition-colors"
                >
                  دليل المستخدم
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
              استمتع بتجربة سبق الآمنة
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              اتبع الشروط واستفد من جميع مزايا منصة سبق الذكية
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/register" 
                className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-blue-50 transition-colors"
              >
                سجل الآن
              </Link>
              <Link 
                href="/" 
                className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                تصفح الأخبار
              </Link>
            </div>
          </div>
        </div>

      </div>
      <Footer />
    </>
  );
} 