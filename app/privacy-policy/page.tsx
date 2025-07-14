'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  Shield, Lock, Eye, FileText, UserCheck, 
  Database, Share2, AlertCircle, ChevronLeft,
  Newspaper
} from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  const sections = [
    {
      id: 'intro',
      title: 'مقدمة',
      icon: <FileText className="w-5 h-5" />,
      content: 'نحن في صحيفة سبق الإلكترونية نقدر ثقتكم ونلتزم بحماية خصوصيتكم. توضح هذه السياسة كيفية جمعنا واستخدامنا وحمايتنا لمعلوماتكم الشخصية.'
    },
    {
      id: 'data-collection',
      title: 'المعلومات التي نجمعها',
      icon: <Database className="w-5 h-5" />,
      content: 'نجمع المعلومات الضرورية لتحسين تجربتكم الإخبارية، مثل: البريد الإلكتروني عند التسجيل، تفضيلات القراءة، والتفاعلات مع المحتوى.'
    },
    {
      id: 'usage',
      title: 'كيف نستخدم معلوماتكم',
      icon: <UserCheck className="w-5 h-5" />,
      content: 'نستخدم معلوماتكم لتخصيص المحتوى الإخباري، إرسال النشرات البريدية، تحسين خدماتنا، وضمان أمان المنصة.'
    },
    {
      id: 'protection',
      title: 'حماية المعلومات',
      icon: <Shield className="w-5 h-5" />,
      content: 'نطبق أعلى معايير الأمان لحماية بياناتكم، بما في ذلك التشفير، المصادقة الثنائية، والمراجعات الأمنية الدورية.'
    },
    {
      id: 'sharing',
      title: 'مشاركة المعلومات',
      icon: <Share2 className="w-5 h-5" />,
      content: 'لا نبيع أو نشارك معلوماتكم الشخصية مع أطراف ثالثة إلا في حالات قانونية محددة أو بموافقتكم الصريحة.'
    },
    {
      id: 'rights',
      title: 'حقوقكم',
      icon: <Eye className="w-5 h-5" />,
      content: 'لكم الحق في الوصول إلى بياناتكم، تحديثها، حذفها، أو الاعتراض على معالجتها. يمكنكم ممارسة هذه الحقوق عبر إعدادات حسابكم.'
    },
    {
      id: 'cookies',
      title: 'ملفات تعريف الارتباط',
      icon: <Lock className="w-5 h-5" />,
      content: 'نستخدم ملفات تعريف الارتباط لتحسين تجربة التصفح وتذكر تفضيلاتكم. يمكنكم إدارة إعدادات ملفات تعريف الارتباط من متصفحكم.'
    },
    {
      id: 'updates',
      title: 'تحديثات السياسة',
      icon: <AlertCircle className="w-5 h-5" />,
      content: 'قد نحدث سياسة الخصوصية من وقت لآخر. سنعلمكم بأي تغييرات جوهرية عبر البريد الإلكتروني أو إشعار على الموقع.'
    }
  ];

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Hero Section - News Style */}
        <div className="bg-gradient-to-b from-blue-900 to-blue-800 text-white">
          <div className="container mx-auto px-4 py-12">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm mb-6 text-blue-100">
              <Link href="/" className="hover:text-white transition-colors">
                الرئيسية
              </Link>
              <span>/</span>
              <span>سياسة الخصوصية</span>
            </div>

            {/* Title Section */}
            <div className="max-w-4xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                  <Shield className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">سياسة الخصوصية</h1>
                  <p className="text-blue-100">آخر تحديث: يناير 2025</p>
                </div>
              </div>
              <p className="text-lg text-blue-50 leading-relaxed">
                التزامنا بحماية خصوصيتكم وأمان معلوماتكم الشخصية
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Quick Navigation */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-blue-600" />
                محتويات السياسة
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {sections.map((section) => (
                  <a 
                    key={section.id}
                    href={`#${section.id}`}
                    className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-gray-600 transition-colors text-sm"
                  >
                    <span className="text-blue-600 dark:text-blue-400">{section.icon}</span>
                    <span className="font-medium">{section.title}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Content Sections */}
            <div className="space-y-8">
              {sections.map((section, index) => (
                <div 
                  key={section.id}
                  id={section.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 md:p-8"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                      {section.icon}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold mb-3">
                        <span className="text-blue-600 dark:text-blue-400 ml-2">{index + 1}.</span>
                        {section.title}
                      </h2>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                        {section.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Contact Section */}
            <div className="mt-12 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-700 rounded-xl p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">لديك استفسار؟</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                إذا كان لديك أي أسئلة حول سياسة الخصوصية، لا تتردد في التواصل معنا
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  تواصل معنا
                </Link>
                <Link 
                  href="/settings"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  إعدادات الخصوصية
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