'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { StaticHeader } from '@/components/layout/StaticHeader';
import FooterDashboard from '@/components/FooterDashboard';
import { 
  Clock, 
  Eye, 
  Tag, 
  Zap, 
  User, 
  ArrowLeft,
  TrendingUp,
  Activity,
  Trophy,
  Building2,
  Heart,
  Leaf,
  Globe
} from 'lucide-react';

// أيقونات التصنيفات
const categoryIcons: { [key: string]: any } = {
  'تقنية': Activity,
  'رياضة': Trophy,
  'اقتصاد': TrendingUp,
  'سياسة': Building2,
  'صحة': Heart,
  'بيئة': Leaf,
  'دولي': Globe,
  'default': Tag
};

export default function HomePage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // جلب البيانات عند التحميل
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // جلب المقالات
        const articlesRes = await fetch('/api/articles?status=published&limit=12');
        const articlesData = await articlesRes.json();
        setArticles(articlesData.articles || []);
        
        // جلب التصنيفات
        const categoriesRes = await fetch('/api/categories?is_active=true&limit=8');
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData.categories || []);
        
      } catch (error) {
        console.error('خطأ في جلب البيانات:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // مكون بطاقة المقال
  const ArticleCard = ({ article }: { article: any }) => (
    <Link href={`/article/${article.id}`} className="group block">
      <article className="h-full rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
        {/* صورة المقال */}
        <div className="relative h-48 overflow-hidden">
          <Image 
            src={article.featured_image || '/images/placeholder-news.svg'} 
            alt={article.title || 'صورة المقال'} 
            width={400} 
            height={300}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              img.src = '/images/placeholder-news.svg';
            }}
          />
          
          {/* شارة التصنيف */}
          {article.category_name && (
            <div className="absolute top-3 right-3">
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-blue-500/90 text-white backdrop-blur-sm">
                <Tag className="w-3 h-3" />
                {article.category_name}
              </span>
            </div>
          )}
          
          {/* شارة عاجل */}
          {article.is_breaking && (
            <div className="absolute top-3 left-3">
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-red-500 text-white backdrop-blur-sm animate-pulse">
                <Zap className="w-3 h-3" />
                عاجل
              </span>
            </div>
          )}
        </div>
        
        {/* محتوى البطاقة */}
        <div className="p-4">
          {/* العنوان */}
          <h3 className="font-bold text-lg mb-2 line-clamp-2 text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
            {article.title}
          </h3>
          
          {/* الملخص */}
          {article.summary && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
              {article.summary}
            </p>
          )}
          
          {/* التفاصيل السفلية */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(article.published_at || article.created_at).toLocaleDateString('ar-SA', {
                  month: 'short',
                  day: 'numeric',
                  calendar: 'gregory',
                  numberingSystem: 'latn'
                })}
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {article.views_count || 0}
              </div>
            </div>
            
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 group-hover:bg-blue-100 transition-colors">
              <ArrowLeft className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </article>
    </Link>
  );

  // مكون بطاقة التصنيف
  const CategoryCard = ({ category }: { category: any }) => {
    const Icon = categoryIcons[category.name_ar] || categoryIcons.default;
    
    return (
      <Link href={`/categories/${category.slug || category.name_ar}`} className="group block">
        <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all duration-300 text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
            <Icon className="w-6 h-6 text-white" />
          </div>
          <h4 className="font-bold text-gray-900 dark:text-white mb-1">{category.name_ar}</h4>
          <p className="text-sm text-gray-500">{category.articles_count || 0} مقال</p>
        </div>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <StaticHeader />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            مرحباً بكم في صحيفة سبق الإلكترونية
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            أحدث الأخبار والتحليلات من السعودية والعالم
          </p>
        </div>

        {/* التصنيفات */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            التصنيفات
          </h2>
          
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          )}
        </section>

        {/* المقالات الأحدث */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            الأخبار الأحدث
          </h2>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-80 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </section>

        {/* رابط عرض المزيد */}
        <div className="text-center mt-12">
          <Link
            href="/articles"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            عرض المزيد من الأخبار
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
      </main>

      <FooterDashboard />
    </div>
  );
}