'use client';

import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Tag, BookOpen, Loader2, Search, TrendingUp, Trophy, Building2, Heart, Leaf, Globe, Activity, Code, Sparkles, Palette, Users, ArrowLeft, Star, Zap } from 'lucide-react';
import './categories-fixes.css';

interface Category {
  id: number;
  name: string;
  name_ar: string;
  slug: string;
  description?: string;
  articles_count?: number;
  is_active: boolean;
}

// بيانات التصنيفات المحسنة مع ألوان متدرجة جميلة
const categoryData = {
  'تقنية': { 
    icon: Code, 
    gradient: 'from-violet-500 via-purple-600 to-indigo-600',
    lightGradient: 'from-violet-50 to-purple-100',
    darkGradient: 'from-violet-900/20 to-purple-900/20',
    accentColor: 'text-violet-600',
    hoverScale: 'hover:scale-[1.02]',
    iconBg: 'bg-gradient-to-br from-violet-400 to-purple-500',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=60'
  },
  'رياضة': { 
    icon: Trophy, 
    gradient: 'from-blue-500 via-cyan-500 to-teal-500',
    lightGradient: 'from-blue-50 to-cyan-100',
    darkGradient: 'from-blue-900/20 to-cyan-900/20',
    accentColor: 'text-blue-600',
    hoverScale: 'hover:scale-[1.02]',
    iconBg: 'bg-gradient-to-br from-blue-400 to-cyan-500',
    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=60'
  },
  'اقتصاد': { 
    icon: TrendingUp, 
    gradient: 'from-emerald-500 via-green-500 to-teal-500',
    lightGradient: 'from-emerald-50 to-green-100',
    darkGradient: 'from-emerald-900/20 to-green-900/20',
    accentColor: 'text-emerald-600',
    hoverScale: 'hover:scale-[1.02]',
    iconBg: 'bg-gradient-to-br from-emerald-400 to-green-500',
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=60'
  },
  'سياسة': { 
    icon: Building2, 
    gradient: 'from-red-500 via-rose-500 to-pink-500',
    lightGradient: 'from-red-50 to-rose-100',
    darkGradient: 'from-red-900/20 to-rose-900/20',
    accentColor: 'text-red-600',
    hoverScale: 'hover:scale-[1.02]',
    iconBg: 'bg-gradient-to-br from-red-400 to-rose-500',
    image: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=800&q=60'
  },
  'ثقافة': { 
    icon: Palette, 
    gradient: 'from-amber-500 via-orange-500 to-yellow-500',
    lightGradient: 'from-amber-50 to-orange-100',
    darkGradient: 'from-amber-900/20 to-orange-900/20',
    accentColor: 'text-amber-600',
    hoverScale: 'hover:scale-[1.02]',
    iconBg: 'bg-gradient-to-br from-amber-400 to-orange-500',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=60'
  },
  'صحة': { 
    icon: Heart, 
    gradient: 'from-pink-500 via-rose-500 to-red-400',
    lightGradient: 'from-pink-50 to-rose-100',
    darkGradient: 'from-pink-900/20 to-rose-900/20',
    accentColor: 'text-pink-600',
    hoverScale: 'hover:scale-[1.02]',
    iconBg: 'bg-gradient-to-br from-pink-400 to-rose-500',
    image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800&q=60'
  },
  'محلي': { 
    icon: Users, 
    gradient: 'from-indigo-500 via-blue-600 to-purple-600',
    lightGradient: 'from-indigo-50 to-blue-100',
    darkGradient: 'from-indigo-900/20 to-blue-900/20',
    accentColor: 'text-indigo-600',
    hoverScale: 'hover:scale-[1.02]',
    iconBg: 'bg-gradient-to-br from-indigo-400 to-blue-500',
    image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=800&q=60'
  },
  'دولي': { 
    icon: Globe, 
    gradient: 'from-cyan-500 via-teal-500 to-blue-500',
    lightGradient: 'from-cyan-50 to-teal-100',
    darkGradient: 'from-cyan-900/20 to-teal-900/20',
    accentColor: 'text-cyan-600',
    hoverScale: 'hover:scale-[1.02]',
    iconBg: 'bg-gradient-to-br from-cyan-400 to-teal-500',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=60'
  },
  'منوعات': { 
    icon: Activity, 
    gradient: 'from-orange-500 via-red-500 to-pink-500',
    lightGradient: 'from-orange-50 to-red-100',
    darkGradient: 'from-orange-900/20 to-red-900/20',
    accentColor: 'text-orange-600',
    hoverScale: 'hover:scale-[1.02]',
    iconBg: 'bg-gradient-to-br from-orange-400 to-red-500',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=60'
  },
  'بيئة': { 
    icon: Leaf, 
    gradient: 'from-green-500 via-emerald-500 to-teal-500',
    lightGradient: 'from-green-50 to-emerald-100',
    darkGradient: 'from-green-900/20 to-emerald-900/20',
    accentColor: 'text-green-600',
    hoverScale: 'hover:scale-[1.02]',
    iconBg: 'bg-gradient-to-br from-green-400 to-emerald-500',
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=60'
  }
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        const categoriesData = data.categories || data.data || [];
        const activeCategories = categoriesData.filter((cat: Category) => cat.is_active);
        setCategories(activeCategories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(category =>
    category.name_ar.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryData = (name: string) => {
    return categoryData[name as keyof typeof categoryData] || {
      icon: Tag,
      gradient: 'from-gray-500 to-slate-600',
      lightGradient: 'from-gray-50 to-slate-100',
      darkGradient: 'from-gray-900/20 to-slate-900/20',
      accentColor: 'text-gray-600',
      hoverScale: 'hover:scale-[1.02]',
      iconBg: 'bg-gradient-to-br from-gray-400 to-slate-500',
      image: 'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?auto=format&fit=crop&w=800&q=60'
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-900">
        <Header />
        <div className="flex-1 flex items-center justify-center min-h-[70vh]">
          <div className="text-center relative">
            {/* خلفية متحركة للودر */}
            <div className="absolute inset-0 -m-8">
              <div className="w-32 h-32 mx-auto bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-20 animate-pulse"></div>
            </div>
            <div className="relative">
              <div className="loading-glow w-20 h-20 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-2xl animate-bounce">
                <Loader2 className="w-10 h-10 text-white animate-spin" />
              </div>
              <h3 className="arabic-font text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent dark:from-white dark:to-gray-300 mb-3">
                جاري تحميل التصنيفات
              </h3>
              <p className="arabic-font text-gray-600 dark:text-gray-400 text-lg">
                نحضر لك أجمل التصنيفات المنظمة...
              </p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-900">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section المحسن */}
        <section className="relative overflow-hidden">
          {/* خلفية متدرجة جميلة */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-700 to-pink-600"></div>
          
          {/* أنماط هندسية متحركة */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-2xl animate-ping"></div>
          </div>
          
          <div className="relative max-w-7xl mx-auto px-6 py-24">
            <div className="text-center">
              {/* أيقونة مميزة */}
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-yellow-400 via-orange-400 to-pink-500 rounded-3xl mb-8 shadow-2xl transform hover:rotate-6 transition-transform duration-500">
                <Sparkles className="w-12 h-12 text-white drop-shadow-lg animate-pulse" />
              </div>
              
              {/* العنوان الرئيسي */}
              <h1 className="arabic-font text-6xl md:text-7xl font-black text-white mb-6 drop-shadow-2xl">
                <span className="gradient-text bg-gradient-to-r from-white via-yellow-200 to-orange-200 bg-clip-text text-transparent">
                  عالم التصنيفات
                </span>
              </h1>
              
              {/* الوصف */}
              <p className="arabic-font text-xl md:text-2xl text-white/90 max-w-4xl mx-auto mb-12 leading-relaxed drop-shadow-lg">
                اكتشف مجموعة متنوعة من التصنيفات المصممة بعناية لتوفر لك أفضل تجربة تصفح ممكنة
              </p>
              
              {/* إحصائيات مع تأثير الزجاج */}
              <div className="glass-effect inline-flex items-center gap-8 bg-white/10 backdrop-blur-xl rounded-3xl px-10 py-6 shadow-2xl border border-white/20">
                <div className="text-center">
                  <div className="count-animation text-4xl font-black text-white mb-2 drop-shadow-lg">
                    {categories.length}
                  </div>
                  <div className="text-sm text-white/80 font-medium arabic-font">تصنيف متاح</div>
                </div>
                <div className="w-px h-16 bg-white/30"></div>
                <div className="text-center">
                  <div className="count-animation text-4xl font-black text-white mb-2 drop-shadow-lg">
                    {categories.reduce((acc, cat) => acc + (cat.articles_count || 0), 0)}
                  </div>
                  <div className="text-sm text-white/80 font-medium arabic-font">مقال رائع</div>
                </div>
                <div className="w-px h-16 bg-white/30"></div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className="pulse-star w-6 h-6 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <div className="text-sm text-white/80 font-medium arabic-font">تقييم المستخدمين</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* شريط البحث المحسن */}
        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 sticky top-16 z-20 shadow-xl">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="search-glow relative w-full max-w-2xl mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl blur opacity-20"></div>
              <div className="relative">
                <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
                <input
                  type="text"
                  placeholder="ابحث عن التصنيف المفضل لديك..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-14 pl-6 py-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-3xl focus:outline-none focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-300 text-lg font-medium text-gray-900 dark:text-white placeholder-gray-500 shadow-xl arabic-font"
                />
                <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* شبكة التصنيفات المحسنة */}
        <section className="max-w-7xl mx-auto px-6 py-16">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-20">
              <div className="glass-effect w-32 h-32 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-3xl flex items-center justify-center mb-8">
                <Tag className="w-16 h-16 text-gray-400" />
              </div>
              <h3 className="arabic-font text-3xl font-bold text-gray-900 dark:text-white mb-4">لا توجد تصنيفات</h3>
              <p className="arabic-font text-xl text-gray-500 dark:text-gray-400">
                {searchTerm ? 'جرب كلمات بحث أخرى' : 'لا توجد تصنيفات متاحة حالياً'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredCategories.map((category, index) => {
                const categorySlug = category.slug || category.name_ar.toLowerCase().replace(/\s+/g, '-');
                const data = getCategoryData(category.name_ar);
                const Icon = data.icon;
                
                return (
                  <Link
                    key={category.id}
                    href={`/categories/${categorySlug}`}
                    className={`group block transform transition-all duration-500 ${data.hoverScale} hover:-translate-y-2`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="relative">
                      {/* تأثير الهالة */}
                      <div className={`absolute inset-0 bg-gradient-to-r ${data.gradient} rounded-3xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 transform scale-110`}></div>
                      
                      {/* البطاقة الرئيسية */}
                      <div className="category-card card-reflection relative bg-white dark:bg-gray-800 rounded-3xl shadow-xl hover:shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700 backdrop-blur-sm">
                        {/* شريط علوي ملون */}
                        <div className={`h-2 bg-gradient-to-r ${data.gradient}`}></div>
                        
                        {/* عناصر عائمة */}
                        <div className="floating-elements"></div>
                        
                        {/* المحتوى */}
                        <div className="p-8 spacing-enhanced">
                          {/* الأيقونة */}
                          <div className="relative mb-6">
                            <div className={`category-icon w-20 h-20 ${data.iconBg} rounded-2xl flex items-center justify-center shadow-2xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 mx-auto`}>
                              <Icon className="w-10 h-10 text-white drop-shadow-lg" />
                            </div>
                            {/* نقاط تفاعلية */}
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pulse-star"></div>
                          </div>
                          
                          {/* اسم التصنيف */}
                          <h3 className="arabic-font text-2xl font-bold text-gray-900 dark:text-white mb-3 text-center group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                            {category.name_ar}
                          </h3>
                          
                          {/* الوصف */}
                          {category.description && (
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 line-clamp-2 text-center leading-relaxed">
                              {category.description}
                            </p>
                          )}
                          
                          {/* الإحصائيات والتفاصيل */}
                          <div className="flex items-center justify-between">
                            <div className={`glass-effect inline-flex items-center gap-2 text-sm bg-gradient-to-r ${data.lightGradient} dark:${data.darkGradient} px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm`}>
                              <BookOpen className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                              <span className="font-semibold text-gray-700 dark:text-gray-300 count-animation">
                                {category.articles_count || 0} مقال
                              </span>
                            </div>
                            
                            {/* سهم للإشارة للتنقل */}
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                              <ArrowLeft className="w-5 h-5 text-white" />
                            </div>
                          </div>
                        </div>
                        
                        {/* تأثير الانعكاس */}
                        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white/5 to-transparent pointer-events-none"></div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </main>
      
      <Footer />
    </div>
  );
}