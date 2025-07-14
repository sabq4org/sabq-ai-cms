'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Shield, Cookie, Mail, Trash2, User, Monitor, Database, Clock } from 'lucide-react'

export default function PrivacyPolicyPage() {
  const [currentDate, setCurrentDate] = useState('')

  useEffect(() => {
    const date = new Date().toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    setCurrentDate(date)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8e] text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 py-16 sm:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <Shield className="w-20 h-20 mx-auto mb-6 text-white/90" />
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">سياسة الخصوصية</h1>
            <p className="text-xl text-white/90 mb-4">
              في صحيفة سبق الإلكترونية، نؤمن أن خصوصيتك ليست مجرد بند قانوني… بل هي حق أصيل.
            </p>
            <p className="text-lg text-white/80">
              ونلتزم بحمايتها بكل شفافية، ووضوح، واحترام.
            </p>
            <div className="mt-8 text-sm text-white/70">
              آخر تحديث: {currentDate}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          
          {/* لمحة عامة */}
          <section className="mb-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Monitor className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">لمحة عامة</h2>
            </div>
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p>
                نقوم بتشغيل هذا الموقع والخدمة المرتبطة به بهدف تقديم تجربة إعلامية ذكية.
                من خلال استخدامك لمنصتنا، فإنك توافق على جمع واستخدام معلوماتك حسب ما هو موضح أدناه.
              </p>
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <p className="font-semibold text-green-800 dark:text-green-400">
                  نحن لا نبيع، لا نشارك، ولا نستخدم بياناتك خارج الإطار الموضّح في هذه السياسة.
                </p>
              </div>
            </div>
          </section>

          {/* المعلومات التي نجمعها */}
          <section className="mb-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Database className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">المعلومات التي نجمعها</h2>
            </div>
            
            {/* معلوماتك الشخصية */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                معلوماتك الشخصية (عند التسجيل أو الاستخدام):
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                {['الاسم الكامل', 'البريد الإلكتروني', 'رقم الجوال (إن وُجد)', 'صورتك الشخصية', 'اهتماماتك وسلوكيات القراءة'].map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="font-semibold text-gray-800 dark:text-gray-200 mb-2">نستخدم هذه المعلومات لـ:</p>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 mt-0.5 text-green-500" />
                    تحسين تجربتك داخل المنصة
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 mt-0.5 text-green-500" />
                    تخصيص المحتوى المناسب لك
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 mt-0.5 text-green-500" />
                    تطوير خدمات وتطبيقات مستقبلية بناءً على اهتمامات المستخدمين
                  </li>
                </ul>
              </div>
            </div>

            {/* بيانات السجل */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                بيانات السجل (Log Data):
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                عند تصفحك للموقع، قد يتم تلقائيًا تسجيل بعض المعلومات التقنية مثل:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {['عنوان IP', 'نوع المتصفح', 'الصفحات التي تزورها', 'الوقت المستغرق', 'إحصائيات سلوك المستخدم'].map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ملفات الكوكيز */}
          <section className="mb-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Cookie className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">ملفات الكوكيز</h2>
            </div>
            <p className="text-gray-700 dark:text-gray-300">
              نستخدم ملفات "الكوكيز" لتحسين سرعة التحميل والتجربة المخصصة لك.
              يمكنك رفض استخدام الكوكيز من إعدادات المتصفح، لكن هذا قد يحد من بعض وظائف الموقع.
            </p>
          </section>

          {/* مزودي الخدمة */}
          <section className="mb-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                <Shield className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">مزودي الخدمة</h2>
            </div>
            <p className="text-gray-700 dark:text-gray-300">
              قد نلجأ إلى أطراف خارجية (مثل Google، أدوات تحليل، أو دعم فني) لأداء بعض الخدمات نيابةً عنّا.
              هؤلاء لا يملكون صلاحية استخدام بياناتك لأي غرض آخر، وهم ملتزمون باتفاقيات خصوصية صارمة.
            </p>
          </section>

          {/* التواصل معك */}
          <section className="mb-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-pink-100 dark:bg-pink-900 rounded-lg">
                <Mail className="w-6 h-6 text-pink-600 dark:text-pink-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">التواصل معك</h2>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-4">قد نرسل إليك:</p>
            <ul className="space-y-2 mb-6">
              {['نشرات إخبارية', 'تحديثات تقنية', 'عروض أو تنبيهات تهمك'].map((item, index) => (
                <li key={index} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-gray-700 dark:text-gray-300 italic">
              ويمكنك دائمًا إلغاء الاشتراك من خلال الرابط الموجود في كل رسالة.
            </p>
          </section>

          {/* حذف بياناتك */}
          <section className="mb-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">حذف بياناتك</h2>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              لك كامل الحق في حذف حسابك ومعلوماتك الشخصية في أي وقت. يتم ذلك عبر:
            </p>
            <ol className="space-y-3 mb-6">
              <li className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                <span className="flex-shrink-0 w-8 h-8 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center text-red-600 dark:text-red-400 font-bold">1</span>
                <span>الدخول إلى صفحة ملفك الشخصي</span>
              </li>
              <li className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                <span className="flex-shrink-0 w-8 h-8 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center text-red-600 dark:text-red-400 font-bold">2</span>
                <span>النقر على "حذف الحساب"</span>
              </li>
              <li className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                <span className="flex-shrink-0 w-8 h-8 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center text-red-600 dark:text-red-400 font-bold">3</span>
                <span>سيتم إرسال طلبك إلى فريق الدعم، ويتم حذفه خلال ٣ إلى ٤ أيام عمل</span>
              </li>
            </ol>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p className="text-gray-700 dark:text-gray-300">
                بعد حذف الحساب، يتم تحويل بياناتك إلى "زائر غير مسجّل" ولن تُستخدم في أي تتبع.
              </p>
            </div>
          </section>

          {/* ملاحظات هامة */}
          <section className="mb-12 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-2xl shadow-lg p-8 border border-yellow-200 dark:border-yellow-800">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">ملاحظات هامة</h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-1.5"></div>
                <span>أي تحديث جوهري في سياسة الخصوصية سيتم إعلامك به بوضوح.</span>
              </li>
              <li className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-1.5"></div>
                <span>باستخدامك لموقعنا، فأنت توافق على هذه السياسة بجميع بنودها.</span>
              </li>
            </ul>
          </section>

          {/* تواصل معنا */}
          <section className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8e] text-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-4">تواصل معنا</h2>
            <p className="mb-6">
              لأي استفسار بخصوص هذه السياسة أو لطلب توضيح، يمكنك مراسلتنا عبر:
            </p>
            <div className="flex items-center gap-3">
              <Mail className="w-6 h-6" />
              <a href="mailto:support@sabq.ai" className="text-xl hover:underline">
                support@sabq.ai
              </a>
            </div>
          </section>
        </div>

        {/* Back to Home Button */}
        <div className="text-center mt-12">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2d5a8e] transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
            العودة للصفحة الرئيسية
          </Link>
        </div>
      </div>
    </div>
  )
} 