'use client';

import { motion } from 'framer-motion';
import { Trophy, Target, Gift, Star, Users, Calendar, MessageCircle, Heart, Bookmark, UserPlus, Clock, CheckCircle2, Sparkles, HelpCircle, AlertCircle } from 'lucide-react';
import { useState } from 'react';

export default function LoyaltyProgramPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const membershipTiers = [
    { name: 'قارئ جديد', points: '0 - 199', color: 'bg-orange-600', icon: '🟤', label: 'برونزي' },
    { name: 'قارئ نشط', points: '200 - 499', color: 'bg-gray-400', icon: '🔵', label: 'فضي' },
    { name: 'قارئ مخلص', points: '500 - 999', color: 'bg-yellow-500', icon: '🟣', label: 'ذهبي' },
    { name: 'قارئ نادر', points: '1000+', color: 'bg-purple-600', icon: '🟠', label: 'ألماسي' }
  ];

  const pointsActivities = [
    { activity: 'قراءة مقال كامل', points: 5, icon: <CheckCircle2 className="w-5 h-5" /> },
    { activity: 'مشاركة المقال عبر الشبكات', points: 10, icon: <Users className="w-5 h-5" /> },
    { activity: 'تسجيل إعجاب بالمقال', points: 2, icon: <Heart className="w-5 h-5" /> },
    { activity: 'كتابة تعليق', points: 3, icon: <MessageCircle className="w-5 h-5" /> },
    { activity: 'حفظ مقال في المفضلة', points: 4, icon: <Bookmark className="w-5 h-5" /> },
    { activity: 'متابعة كاتب', points: 6, icon: <UserPlus className="w-5 h-5" /> },
    { activity: 'الدخول اليومي إلى الموقع', points: 2, icon: <Calendar className="w-5 h-5" /> },
    { activity: 'البقاء لأكثر من 3 دقائق', points: 5, icon: <Clock className="w-5 h-5" /> },
    { activity: 'إكمال قراءة 5 مقالات في جلسة واحدة', points: 15, icon: <Trophy className="w-5 h-5" /> }
  ];

  const rewards = [
    'اشتراك شهري في محتوى مميز بدون إعلانات',
    'قسائم خصم من شركائنا (سيعلن عنها لاحقًا)',
    'خلفيات رقمية وهدايا افتراضية',
    'شارة خاصة بجانب اسمك في التعليقات',
    'دخول مبكر لتجارب وتجديدات الصحيفة'
  ];

  const faqs = [
    {
      question: 'كيف يتم احتساب النقاط تلقائياً؟',
      answer: 'يتم احتساب النقاط تلقائياً عند تسجيل دخولك وأثناء تفاعلك مع المحتوى. كل نشاط تقوم به يُسجل فوراً في حسابك.'
    },
    {
      question: 'هل يمكنني استبدال النقاط بمكافآت حقيقية؟',
      answer: 'نعم، سيتم قريباً إطلاق متجر النقاط حيث يمكنك استبدال نقاطك بمكافآت رقمية وخصومات من شركائنا.'
    },
    {
      question: 'هل تنتهي صلاحية النقاط؟',
      answer: 'لا، النقاط لا تنتهي صلاحيتها طالما كنت نشطاً على المنصة. النشاط يعني زيارة واحدة على الأقل كل 90 يوماً.'
    },
    {
      question: 'كيف أعرف مستواي الحالي؟',
      answer: 'يمكنك معرفة مستواك الحالي من خلال صفحة الملف الشخصي أو من خلال الشريط العلوي عند تسجيل الدخول.'
    },
    {
      question: 'هل يمكنني نقل نقاطي لشخص آخر؟',
      answer: 'حالياً، النقاط شخصية ولا يمكن نقلها. قد نضيف هذه الميزة مستقبلاً.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10" />
        <div className="container mx-auto px-4 py-20 relative">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-center"
          >
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              🔁 نظام الولاء في صحيفة سبق
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              برنامج مصمم خصيصًا لمكافأة قراء سبق الأوفياء من خلال منحهم نقاطًا مقابل تفاعلهم المستمر
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* ما هو نظام الولاء */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="py-16"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Trophy className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-3xl font-bold">ما هو نظام الولاء؟</h2>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              نظام الولاء هو برنامج مصمم خصيصًا لمكافأة قراء سبق الأوفياء، من خلال منحهم نقاطًا مقابل تفاعلهم المستمر مع محتوى الصحيفة. 
              كلما زاد تفاعلك، زادت نقاطك، وارتفعت فئتك، وزادت فرصك في الحصول على مزايا وهدايا رقمية حصرية.
            </p>
          </div>
        </div>
      </motion.section>

      {/* أهداف النظام */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="py-16 bg-gray-50 dark:bg-gray-800/50"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">🎯 أهداف نظام الولاء</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              { icon: <Users />, text: 'تعزيز العلاقة بين الصحيفة وقرّائها' },
              { icon: <Target />, text: 'تشجيع التفاعل اليومي مع المحتوى' },
              { icon: <Gift />, text: 'تقديم مزايا ملموسة مقابل الولاء والقراءة المستمرة' },
              { icon: <Star />, text: 'تمكين القارئ من الوصول إلى محتوى مميز ومكافآت رقمية حقيقية' }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="text-blue-600 dark:text-blue-400 mb-4">{item.icon}</div>
                <p className="text-gray-700 dark:text-gray-300">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* فئات الأعضاء */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="py-16"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">🪪 فئات الأعضاء</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {membershipTiers.map((tier, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
              >
                <div className={`h-2 ${tier.color}`} />
                <div className="p-6 text-center">
                  <div className="text-4xl mb-3">{tier.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
                  <p className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">{tier.label}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">{tier.points} نقطة</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* كيف أكسب النقاط */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="py-16 bg-gray-50 dark:bg-gray-800/50"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">💎 كيف أكسب النقاط؟</h2>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
              <div className="p-8">
                <div className="space-y-4">
                  {pointsActivities.map((activity, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-blue-600 dark:text-blue-400">{activity.icon}</div>
                        <span className="text-lg">{activity.activity}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">+{activity.points}</span>
                        <span className="text-sm text-gray-500">نقطة</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* المكافآت والهدايا */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="py-16"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">🎁 المكافآت والهدايا الرقمية</h2>
            <p className="text-lg text-amber-600 dark:text-amber-400 font-semibold">سيتم تفعيلها قريبًا</p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="grid gap-4">
              {rewards.map((reward, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                    <p className="text-lg">{reward}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* ملاحظات عامة */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="py-16 bg-gray-50 dark:bg-gray-800/50"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold mb-6">📝 ملاحظات عامة:</h2>
              <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <span>النقاط تُحتسب تلقائيًا عند تسجيل الدخول</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <span>بعض التفاعلات مشروطة بمستوى الفئة (مثلاً كتابة تعليق متاحة من الفئة الفضية)</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <span>سيتم لاحقًا ربط النقاط بمتجر مصغر داخل المنصة</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </motion.section>

      {/* الأسئلة الشائعة */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="py-16"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">❓ الأسئلة الشائعة</h2>
          </div>
          <div className="max-w-3xl mx-auto">
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full p-6 text-right flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <span className="text-lg font-semibold">{faq.question}</span>
                    <HelpCircle className={`w-5 h-5 transition-transform ${openFaq === index ? 'rotate-180' : ''}`} />
                  </button>
                  {openFaq === index && (
                    <div className="px-6 pb-6">
                      <p className="text-gray-600 dark:text-gray-300">{faq.answer}</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* تنبيه النظام قيد التطوير */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="py-16"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-8">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold mb-2 text-amber-900 dark:text-amber-100">
                    النظام قيد التطوير المستمر
                  </h3>
                  <p className="text-amber-800 dark:text-amber-200">
                    نعمل باستمرار على تحسين نظام الولاء وإضافة مزايا جديدة. 
                    تابعونا للحصول على آخر التحديثات والمكافآت القادمة. 
                    رأيك وملاحظاتك مهمة لنا لتطوير نظام يلبي تطلعاتك.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
} 