'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Eye, Target, Brain, Clock, Shield, Award, Sparkles, Zap, Users, Globe, TrendingUp } from 'lucide-react'

export default function AboutPage() {
  const [yearsActive, setYearsActive] = useState(0)

  useEffect(() => {
    const startYear = 2007
    const currentYear = new Date().getFullYear()
    setYearsActive(currentYear - startYear)
  }, [])

  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: 'خبر يُقترح لك بناءً على اهتماماتك',
      description: 'لا خوارزميات عشوائية'
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'تحليل محتوى لحظي',
      description: 'يساعدنا نحسّن تجربتك أولاً بأول'
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: 'تجربة قراءة مخصصة',
      description: 'تتغير وتتعلم معك'
    }
  ]

  const values = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'المصداقية',
      description: 'نقل الحقيقة كما هي'
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: 'المهنية',
      description: 'معايير صحفية دقيقة'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'المسؤولية',
      description: 'خدمة المجتمع والوطن'
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: 'الشمولية',
      description: 'تغطية محلية وعالمية'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1e3a5f] via-[#2d5a8e] to-[#1e3a5f] text-white">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative container mx-auto px-4 py-20 sm:py-32">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-5xl sm:text-7xl font-bold mb-6 animate-fade-in">
              نحن <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300">سبق</span>
            </h1>
            <p className="text-2xl sm:text-3xl text-white/90 mb-4 font-light">
              أكثر من مجرد صحيفة إلكترونية
            </p>
            <div className="flex items-center justify-center gap-8 mt-8 text-white/80">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span className="text-lg">منذ {yearsActive} عاماً</span>
              </div>
              <div className="w-px h-6 bg-white/30"></div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                <span className="text-lg">مرخصة من وزارة الإعلام</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          
          {/* Story Section */}
          <section className="mb-20">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                  منذ عام 2007 ونحن نكتب الخبر،
                  <br />
                  <span className="text-[#2d5a8e]">واليوم… نعيد تعريفه</span>
                </h2>
                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                  <p className="text-lg leading-relaxed">
                    صحيفة سعودية مرخّصة من وزارة الإعلام، تأسست على المهنية، ونضجت على ثقة القارئ.
                  </p>
                  <p className="text-lg leading-relaxed">
                    نعمل على مدار الساعة لنقدم تغطيات صحفية موثوقة، وحوارات جريئة، وتقارير دقيقة؛ تلامس نبض الوطن، وتتابع متغيرات المنطقة والعالم.
                  </p>
                  <p className="text-lg leading-relaxed font-semibold text-[#2d5a8e] dark:text-blue-400">
                    وفي عصر الذكاء الاصطناعي، سبق تتحول من منصة إخبارية… إلى تجربة إعلامية ذكية.
                  </p>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-square bg-gradient-to-br from-[#1e3a5f] to-[#2d5a8e] rounded-2xl p-8 shadow-2xl">
                  <div className="h-full flex flex-col justify-center items-center text-white">
                    <Brain className="w-24 h-24 mb-4 opacity-90" />
                    <h3 className="text-2xl font-bold mb-2">إعلام ذكي</h3>
                    <p className="text-center text-white/80">
                      نستخدم تقنيات الذكاء الاصطناعي لرصد الأخبار، تخصيص المحتوى، وتحليل التفاعل
                    </p>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-blue-500/20 rounded-full blur-2xl"></div>
                <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-purple-500/20 rounded-full blur-2xl"></div>
              </div>
            </div>
          </section>

          {/* Vision & Mission */}
          <section className="mb-20">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Vision */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-lg">
                    <Eye className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">الرؤية</h2>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                  أن تكون سبق حجر زاوية في بناء وعي إعلامي سعودي حديث، يسهم في:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                    <TrendingUp className="w-5 h-5 mt-0.5 text-green-500 flex-shrink-0" />
                    <span>تحقيق مستهدفات رؤية المملكة 2030</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                    <TrendingUp className="w-5 h-5 mt-0.5 text-green-500 flex-shrink-0" />
                    <span>تعزيز القيم الوطنية والاجتماعية</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                    <TrendingUp className="w-5 h-5 mt-0.5 text-green-500 flex-shrink-0" />
                    <span>تقديم محتوى يرتقي بالقارئ ويفيد المجتمع</span>
                  </li>
                </ul>
              </div>

              {/* Mission */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800 rounded-lg">
                    <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">الرسالة</h2>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                  نحن نؤمن أن الإعلام ليس نقل الحدث فقط، بل صناعة وعي ومسؤولية وطنية.
                  <br />
                  رسالتنا تقديم نشاط إعلامي سعودي متميز:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                    <ArrowRight className="w-5 h-5 mt-0.5 text-purple-500 flex-shrink-0" />
                    <span>بمعايير مهنية دقيقة</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                    <ArrowRight className="w-5 h-5 mt-0.5 text-purple-500 flex-shrink-0" />
                    <span>بروح وطنية صادقة</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                    <ArrowRight className="w-5 h-5 mt-0.5 text-purple-500 flex-shrink-0" />
                    <span>وبتقنيات ذكية تُسهم في تطوير الفرد والمجتمع</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* AI Features */}
          <section className="mb-20">
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 rounded-3xl p-12 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
              
              <div className="relative">
                <h2 className="text-3xl font-bold mb-4 text-center flex items-center justify-center gap-3">
                  <Brain className="w-8 h-8" />
                  ماذا يعني "ذكاء إعلامي" عندنا؟
                </h2>
                <div className="grid md:grid-cols-3 gap-8 mt-12">
                  {features.map((feature, index) => (
                    <div key={index} className="text-center">
                      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all duration-300">
                        <div className="bg-gradient-to-br from-blue-500 to-purple-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                          {feature.icon}
                        </div>
                        <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                        <p className="text-white/80">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Values */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">قيمنا الأساسية</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <div key={index} className="text-center group">
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 h-full">
                    <div className="text-[#2d5a8e] dark:text-blue-400 mb-4 group-hover:scale-110 transition-transform">
                      {value.icon}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{value.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{value.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="text-center">
            <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8e] rounded-2xl p-12 text-white shadow-2xl">
              <h2 className="text-3xl font-bold mb-4">انضم إلى رحلتنا</h2>
              <p className="text-xl mb-8 text-white/90">
                اكتشف الإعلام بشكل جديد مع سبق
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link 
                  href="/"
                  className="inline-flex items-center gap-2 px-8 py-3 bg-white text-[#1e3a5f] rounded-lg hover:bg-gray-100 transition-colors font-semibold"
                >
                  <ArrowRight className="w-5 h-5" />
                  تصفح الأخبار
                </Link>
                <Link 
                  href="/register"
                  className="inline-flex items-center gap-2 px-8 py-3 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 transition-colors font-semibold border border-white/30"
                >
                  <Users className="w-5 h-5" />
                  إنشاء حساب
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
} 