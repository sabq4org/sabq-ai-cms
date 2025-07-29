'use client';

import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  Tag, BookOpen, Loader2, Search, TrendingUp, Trophy, Building2, 
  Heart, Leaf, Globe, Activity, Code, Sparkles, Palette, Users,
  Grid3X3, List, ArrowLeft, AlertTriangle, Layers
} from 'lucide-react';

interface Category {
  id: number;
  name: string;
  name_ar: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  cover_image?: string;
  articles_count?: number;
  is_active: boolean;
  metadata?: {
    cover_image?: string;
    [key: string]: any;
  };
}

// بيانات التصنيفات مع الألوان والأيقونات
const categoryData = {
  'تقنية': { 
    icon: Code, 
    color: 'purple',
    bgColor: 'bg-purple-500',
    hoverColor: 'hover:bg-purple-600',
    lightBg: 'bg-purple-50',
    darkBg: 'dark:bg-purple-900/20',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80'
  },
  'رياضة': { 
    icon: Trophy, 
    color: 'blue',
    bgColor: 'bg-blue-500',
    hoverColor: 'hover:bg-blue-600',
    lightBg: 'bg-blue-50',
    darkBg: 'dark:bg-blue-900/20',
    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80'
  },
  'اقتصاد': { 
    icon: TrendingUp, 
    color: 'green',
    bgColor: 'bg-green-500',
    hoverColor: 'hover:bg-green-600',
    lightBg: 'bg-green-50',
    darkBg: 'dark:bg-green-900/20',
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80'
  },
  'سياسة': { 
    icon: Building2, 
    color: 'red',
    bgColor: 'bg-red-500',
    hoverColor: 'hover:bg-red-600',
    lightBg: 'bg-red-50',
    darkBg: 'dark:bg-red-900/20',
    image: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=800&q=80'
  },
  'ثقافة': { 
    icon: Palette, 
    color: 'yellow',
    bgColor: 'bg-yellow-500',
    hoverColor: 'hover:bg-yellow-600',
    lightBg: 'bg-yellow-50',
    darkBg: 'dark:bg-yellow-900/20',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80'
  },
  'صحة': { 
    icon: Heart, 
    color: 'pink',
    bgColor: 'bg-pink-500',
    hoverColor: 'hover:bg-pink-600',
    lightBg: 'bg-pink-50',
    darkBg: 'dark:bg-pink-900/20',
    image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800&q=80'
  },
  'محلي': { 
    icon: Users, 
    color: 'indigo',
    bgColor: 'bg-indigo-500',
    hoverColor: 'hover:bg-indigo-600',
    lightBg: 'bg-indigo-50',
    darkBg: 'dark:bg-indigo-900/20',
    image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=800&q=80'
  },
  'دولي': { 
    icon: Globe, 
    color: 'cyan',
    bgColor: 'bg-cyan-500',
    hoverColor: 'hover:bg-cyan-600',
    lightBg: 'bg-cyan-50',
    darkBg: 'dark:bg-cyan-900/20',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80'
  },
  'منوعات': { 
    icon: Activity, 
    color: 'orange',
    bgColor: 'bg-orange-500',
    hoverColor: 'hover:bg-orange-600',
    lightBg: 'bg-orange-50',
    darkBg: 'dark:bg-orange-900/20',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80'
  },
  'بيئة': { 
    icon: Leaf, 
    color: 'teal',
    bgColor: 'bg-teal-500',
    hoverColor: 'hover:bg-teal-600',
    lightBg: 'bg-teal-50',
    darkBg: 'dark:bg-teal-900/20',
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80'
  },
  'تعليم': { 
    icon: BookOpen, 
    color: 'emerald',
    bgColor: 'bg-emerald-500',
    hoverColor: 'hover:bg-emerald-600',
    lightBg: 'bg-emerald-50',
    darkBg: 'dark:bg-emerald-900/20',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80'
  },
  'فنون': { 
    icon: Palette, 
    color: 'rose',
    bgColor: 'bg-rose-500',
    hoverColor: 'hover:bg-rose-600',
    lightBg: 'bg-rose-50',
    darkBg: 'dark:bg-rose-900/20',
    image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8a?auto=format&fit=crop&w=800&q=80'
  },
  'سفر': { 
    icon: Globe, 
    color: 'sky',
    bgColor: 'bg-sky-500',
    hoverColor: 'hover:bg-sky-600',
    lightBg: 'bg-sky-50',
    darkBg: 'dark:bg-sky-900/20',
    image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80'
  },
  'علوم': { 
    icon: Code, 
    color: 'violet',
    bgColor: 'bg-violet-500',
    hoverColor: 'hover:bg-violet-600',
    lightBg: 'bg-violet-50',
    darkBg: 'dark:bg-violet-900/20',
    image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80'
  },
  'تكنولوجيا': { 
    icon: Code, 
    color: 'purple',
    bgColor: 'bg-purple-500',
    hoverColor: 'hover:bg-purple-600',
    lightBg: 'bg-purple-50',
    darkBg: 'dark:bg-purple-900/20',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?auto=format&fit=crop&w=800&q=80'
  },
  'أخبار': { 
    icon: Activity, 
    color: 'blue',
    bgColor: 'bg-blue-500',
    hoverColor: 'hover:bg-blue-600',
    lightBg: 'bg-blue-50',
    darkBg: 'dark:bg-blue-900/20',
    image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80'
  }
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'articles'>('articles');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const categoriesData = data.categories || data.data || [];
          const activeCategories = categoriesData.filter((cat: Category) => cat.is_active);
          setCategories(activeCategories);
        } else {
          setError(data.message || 'فشل في تحميل التصنيفات');
          setCategories([]);
        }
      } else {
        setError('حدث خطأ في تحميل التصنيفات');
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('فشل في الاتصال بالخادم');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories
    .filter(category =>
      category.name_ar.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.name_ar.localeCompare(b.name_ar);
      } else {
        return (b.articles_count || 0) - (a.articles_count || 0);
      }
    });

  const getCategoryData = (name: string) => {
    // البحث المباشر في البيانات المعرفة
    const directMatch = categoryData[name as keyof typeof categoryData];
    if (directMatch) return directMatch;
    
    // البحث الجزئي في الكلمات المفتاحية
    const keywords = {
      'تقني': categoryData['تقنية'],
      'تكنولوجي': categoryData['تكنولوجيا'],
      'رياضي': categoryData['رياضة'],
      'اقتصادي': categoryData['اقتصاد'],
      'سياسي': categoryData['سياسة'],
      'ثقافي': categoryData['ثقافة'],
      'صحي': categoryData['صحة'],
      'محلي': categoryData['محلي'],
      'دولي': categoryData['دولي'],
      'منوع': categoryData['منوعات'],
      'بيئي': categoryData['بيئة'],
      'تعليمي': categoryData['تعليم'],
      'فني': categoryData['فنون'],
      'سفر': categoryData['سفر'],
      'علمي': categoryData['علوم'],
      'خبر': categoryData['أخبار']
    };
    
    for (const [keyword, data] of Object.entries(keywords)) {
      if (name.includes(keyword)) return data;
    }
    
    // إرجاع بيانات افتراضية جذابة
    const defaultImages = [
      'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80'
    ];
    
    const randomImage = defaultImages[Math.floor(Math.random() * defaultImages.length)];
    
    return {
      icon: Tag,
      color: 'gray',
      bgColor: 'bg-gray-500',
      hoverColor: 'hover:bg-gray-600',
      lightBg: 'bg-gray-50',
      darkBg: 'dark:bg-gray-900/20',
      image: randomImage
    };
  };

  const getCategoryImage = (category: Category) => {
    const coverImage = category.cover_image || 
                      (category.metadata && typeof category.metadata === 'object' && 
                       'cover_image' in category.metadata ? 
                       (category.metadata as any).cover_image : null);
    
    if (coverImage && coverImage.trim() !== '') {
      return coverImage;
    }
    
    const categoryData = getCategoryData(category.name_ar);
    return categoryData.image;
  };

  const totalArticles = categories.reduce((acc, cat) => acc + (cat.articles_count || 0), 0);

  return (
    <>
      <Header />
      
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            تصنيفات الأخبار
          </h1>
          <p className="text-lg text-gray-600">
            استكشف أحدث الأخبار حسب التصنيف ({categories.length} تصنيف متاح)
          </p>
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">
              لا توجد تصنيفات متاحة حالياً
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category: any) => (
              <div
                key={category.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
              >
                {/* صورة التصنيف */}
                {category.metadata?.cover_image && (
                  <div className="h-48 bg-gray-200 relative overflow-hidden">
                    <img
                      src={category.metadata.cover_image}
                      alt={category.metadata?.name_ar || category.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                {/* محتوى التصنيف */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {category.metadata?.name_ar || category.name}
                    </h3>
                    {category.icon && (
                      <span className="text-2xl">{category.icon}</span>
                    )}
                  </div>
                  
                  {category.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {category.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 space-x-reverse">
                      <span className="text-sm text-gray-500">
                        📰 {category.articles_count || 0} مقال
                      </span>
                      {category.color && (
                        <span 
                          className="w-4 h-4 rounded-full inline-block"
                          style={{ backgroundColor: category.color }}
                        />
                      )}
                    </div>
                    
                    <a
                      href={`/categories/${category.slug}`}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      عرض المقالات
                      <svg
                        className="mr-2 w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* إحصائيات */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center space-x-6 space-x-reverse text-sm text-gray-500">
            <span>📊 إجمالي التصنيفات: {categories.length}</span>
            <span>📈 إجمالي المقالات: {categories.reduce((sum: number, cat: any) => sum + (cat.articles_count || 0), 0)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
