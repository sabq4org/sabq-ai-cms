'use client';

import React from 'react';
import Footer from '@/components/Footer';
import { 
  Shield, Lock, Database, UserCheck, 
  Share2, Eye, FileText, AlertCircle,
  CheckCircle, Settings, Mail
} from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  const sections = [
    {
      title: 'مقدمة عن الخصوصية',
      content: 'نحن في صحيفة سبق الإلكترونية نقدر ثقتكم ونلتزم بحماية خصوصيتكم. توضح هذه السياسة كيفية جمعنا واستخدامنا وحمايتنا لمعلوماتكم الشخصية بأعلى معايير الأمان والشفافية.'
    },
    {
      title: 'المعلومات التي نجمعها',
      content: 'نجمع المعلومات الضرورية لتحسين تجربتكم الإخبارية، مثل: البريد الإلكتروني عند التسجيل، تفضيلات القراءة والاهتمامات، التفاعلات مع المحتوى، وبيانات الاستخدام التحليلية لتحسين الخدمة.'
    },
    {
      title: 'كيف نستخدم معلوماتكم',
      content: 'نستخدم معلوماتكم لتخصيص المحتوى الإخباري حسب اهتماماتكم، إرسال النشرات البريدية المهمة، تحسين خدماتنا باستمرار، وضمان أمان المنصة وحماية جميع المستخدمين.'
    },
    {
      title: 'حماية المعلومات والأمان',
      content: 'نطبق أعلى معايير الأمان العالمية لحماية بياناتكم، بما في ذلك التشفير المتقدم 256-bit، المصادقة الثنائية، المراجعات الأمنية الدورية، والامتثال للمعايير الدولية GDPR.'
    },
    {
      title: 'مشاركة المعلومات',
      content: 'لا نبيع أو نؤجر معلوماتكم الشخصية لأطراف ثالثة. قد نشارك بعض البيانات المجهولة مع شركائنا التقنيين فقط لتحسين الخدمة، مع ضمان عدم الكشف عن هويتكم الشخصية.'
    },
    {
      title: 'حقوقكم في البيانات',
      content: 'لكم الحق الكامل في الوصول إلى بياناتكم الشخصية، تحديثها أو تعديلها، حذفها نهائياً من خوادمنا، أو الاعتراض على معالجتها. يمكنكم ممارسة هذه الحقوق بسهولة عبر إعدادات حسابكم.'
    },
    {
      title: 'ملفات تعريف الارتباط (الكوكيز)',
      content: 'نستخدم ملفات تعريف الارتباط الضرورية فقط لتحسين تجربة التصفح وتذكر تفضيلاتكم. يمكنكم إدارة وتخصيص إعدادات ملفات تعريف الارتباط من خلال متصفحكم أو إعدادات الموقع.'
    },
    {
      title: 'تحديثات سياسة الخصوصية',
      content: 'قد نحدث سياسة الخصوصية من وقت لآخر لتحسين الخدمة أو للامتثال للقوانين الجديدة. سنعلمكم بأي تغييرات جوهرية مسبقاً عبر البريد الإلكتروني أو إشعار بارز على الموقع.'
    }
  ];

  const principles = [
    'الشفافية الكاملة في جمع واستخدام البيانات',
    'التحكم الكامل للمستخدمين في معلوماتهم',
    'الأمان المتقدم وحماية البيانات',
    'الامتثال للقوانين المحلية والدولية'
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
                <Shield className="w-8 h-8 text-white" />
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold mb-6 text-gray-900 dark:text-white">
                سياسة الخصوصية
              </h1>
              
              <p className="text-2xl text-blue-600 dark:text-blue-400 mb-4">
                حماية خصوصيتكم أولويتنا
              </p>
              
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                نلتزم بحماية معلوماتكم الشخصية وفقاً لأعلى معايير الأمان والشفافية
                <br />
                آخر تحديث: يناير 2025
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
                <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">التزامنا بالخصوصية</h2>
              </div>
              
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                في صحيفة سبق، نؤمن بأن الخصوصية حق أساسي لكل مستخدم. نعمل بشفافية كاملة 
                ونطبق أفضل الممارسات العالمية لحماية بياناتكم وضمان أمانها في جميع الأوقات.
              </p>
            </div>

            {/* أقسام السياسة */}
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

            {/* مبادئنا الأساسية */}
            <div className="text-center mb-20">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">مبادئنا الأساسية</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-12">
                القيم التي توجه التزامنا بحماية خصوصيتكم
              </p>
              
              <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                {principles.map((principle, index) => (
                  <div key={index} className="flex items-center gap-3 text-lg text-gray-700 dark:text-gray-300">
                    <CheckCircle className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    {principle}
                  </div>
                ))}
              </div>
            </div>

            {/* معلومات الاتصال */}
            <div className="text-center">
              <Mail className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">لديكم أسئلة؟</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                فريق الخصوصية مستعد لمساعدتكم في أي استفسار
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="mailto:privacy@sabq.ai" 
                  className="bg-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors"
                >
                  تواصل معنا
                </a>
                <Link 
                  href="/settings" 
                  className="border-2 border-blue-600 text-blue-600 dark:text-blue-400 px-8 py-3 rounded-full font-semibold hover:bg-blue-600 hover:text-white transition-colors"
                >
                  إعدادات الحساب
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
              نضمن خصوصيتكم
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              تصفحوا بثقة مع سبق، حيث أمانكم وخصوصيتكم في المقدمة دائماً
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/" 
                className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-blue-50 transition-colors"
              >
                العودة للرئيسية
              </Link>
              <Link 
                href="/about" 
                className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                تعرف على سبق
              </Link>
            </div>
          </div>
        </div>

      </div>
      <Footer />
    </>
  );
} 