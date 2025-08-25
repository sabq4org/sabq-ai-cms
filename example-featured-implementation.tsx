// مثال تطبيقي لاستخدام المكون الجديد FeaturedNewsBlock.new.tsx
// يمكن استخدام هذا المثال في أي صفحة تحتاج لعرض الأخبار المميزة

import React, { useState, useEffect } from 'react';
import FeaturedNewsBlockNew from '@/components/FeaturedNewsBlock.new';

// نموذج للبيانات المطلوبة
interface Article {
  id: string;
  title: string;
  content: string;
  slug: string;
  status: string;
  featured_image?: string;
  published_at: string;
  excerpt?: string;
  breaking?: boolean;
  is_breaking?: boolean;
  featured?: boolean;
  is_featured?: boolean;
  views?: number;
  views_count?: number;
  
  // بيانات الكاتب
  author?: {
    id: string;
    name: string;
    avatar?: string;
    verified?: boolean;
    reporter_profile?: {
      full_name?: string;
      verified?: boolean;
      verification_status?: string;
    };
  };
  author_id?: string;
  author_name?: string;
  
  // بيانات التصنيف
  categories?: {
    id: string;
    name: string;
    color?: string;
    color_hex?: string;
    icon?: string;
  };
  category?: {
    id: string;
    name: string;
    color?: string;
    color_hex?: string;
    icon?: string;
  };
  category_id?: string;
  category_name?: string;
}

// مثال 1: الصفحة الرئيسية مع الأخبار المميزة (النسخة المضغوطة - Lite Style)
export function HomePageWithFeaturedNews() {
  const [featuredArticles, setFeaturedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedNews = async () => {
      try {
        const response = await fetch('/api/featured-news-carousel');
        const data = await response.json();
        if (data.success) {
          setFeaturedArticles(data.articles || []);
        }
      } catch (error) {
        console.error('Error fetching featured news:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedNews();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-64 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
    );
  }

  if (!featuredArticles.length) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-6 py-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        الأخبار المميزة
      </h2>
      
      {/* استخدام النسخة المضغوطة (تصميم النسخة الخفيفة) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {featuredArticles.slice(0, 6).map((article) => (
          <FeaturedNewsBlockNew
            key={article.id}
            article={article}
            showCompact={true}  // ✨ تفعيل التصميم المضغوط (تصميم النسخة الخفيفة)
            showBadge={true}
            showAuthor={false}
            className="h-72"
          />
        ))}
      </div>
    </section>
  );
}

// مثال 2: صفحة قسم الأخبار مع التصميم الكامل المحسن
export function NewsPageWithEnhancedFeatured() {
  const [featuredArticles, setFeaturedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedNews = async () => {
      try {
        const response = await fetch('/api/articles?featured=true&status=published&limit=4');
        const data = await response.json();
        if (data.success) {
          setFeaturedArticles(data.articles || []);
        }
      } catch (error) {
        console.error('Error fetching featured news:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedNews();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-96 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
    );
  }

  if (!featuredArticles.length) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          الأخبار المميزة
        </h2>
        <a 
          href="/news" 
          className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
        >
          عرض الكل →
        </a>
      </div>
      
      {/* التصميم الكامل المحسن */}
      <div className="space-y-8">
        {/* الخبر الأول - حجم كبير */}
        {featuredArticles[0] && (
          <FeaturedNewsBlockNew
            article={featuredArticles[0]}
            showCompact={false}  // ✨ التصميم الكامل المحسن
            showBadge={true}
            showAuthor={true}
            showExcerpt={true}
            showReadingTime={true}
            className="h-96"
          />
        )}
        
        {/* باقي الأخبار - شبكة صغيرة */}
        {featuredArticles.length > 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredArticles.slice(1).map((article) => (
              <FeaturedNewsBlockNew
                key={article.id}
                article={article}
                showCompact={true}  // ✨ النسخة المضغوطة للأخبار الفرعية
                showBadge={true}
                showAuthor={true}
                className="h-64"
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// مثال 3: دالة مساعدة لتحضير البيانات
export function prepareArticleData(rawArticle: any): Article {
  return {
    id: rawArticle.id || '',
    title: rawArticle.title || '',
    content: rawArticle.content || '',
    slug: rawArticle.slug || '',
    status: rawArticle.status || 'published',
    featured_image: rawArticle.featured_image || rawArticle.featuredImage,
    published_at: rawArticle.published_at || rawArticle.publishedAt || new Date().toISOString(),
    excerpt: rawArticle.excerpt || rawArticle.summary || '',
    breaking: rawArticle.breaking || rawArticle.is_breaking || false,
    featured: rawArticle.featured || rawArticle.is_featured || false,
    views: rawArticle.views || rawArticle.views_count || 0,
    
    // تحضير بيانات الكاتب
    author: rawArticle.author ? {
      id: rawArticle.author.id || '',
      name: rawArticle.author.name || rawArticle.author_name || '',
      avatar: rawArticle.author.avatar || rawArticle.author.profile_picture,
      verified: rawArticle.author.verified || false,
      reporter_profile: rawArticle.author.reporter_profile || null
    } : undefined,
    author_id: rawArticle.author_id || rawArticle.authorId,
    author_name: rawArticle.author_name || rawArticle.authorName,
    
    // تحضير بيانات التصنيف
    categories: rawArticle.categories || rawArticle.category,
    category: rawArticle.category || rawArticle.categories,
    category_id: rawArticle.category_id || rawArticle.categoryId,
    category_name: rawArticle.category_name || rawArticle.categoryName
  };
}

// مثال 4: استخدام مع البيانات الواردة من API
export function FeaturedNewsWithAPI() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // جلب البيانات من API
        const response = await fetch('/api/articles?featured=true&status=published');
        const data = await response.json();
        
        if (data.success && data.articles) {
          // تحضير البيانات للمكون
          const preparedArticles = data.articles.map(prepareArticleData);
          setArticles(preparedArticles);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="animate-pulse bg-gray-200 dark:bg-gray-800 h-80 rounded-xl" />;
  }

  return (
    <div className="space-y-6">
      {articles.map((article, index) => (
        <FeaturedNewsBlockNew
          key={article.id}
          article={article}
          showCompact={index > 0}  // ✨ الخبر الأول كامل، الباقي مضغوط
          showBadge={true}
          showAuthor={true}
          showExcerpt={index === 0}  // ✨ الخلاصة للخبر الأول فقط
          className={index === 0 ? "h-96" : "h-64"}
        />
      ))}
    </div>
  );
}

// مثال 5: كيفية الاستبدال في الملفات الموجودة
/*
// استبدال الاستيراد
// من:
import FeaturedNewsBlock from '@/components/FeaturedNewsBlock';

// إلى:
import FeaturedNewsBlockNew from '@/components/FeaturedNewsBlock.new';

// استبدال الاستخدام
// من:
<FeaturedNewsBlock 
  article={article}
  className="h-80"
/>

// إلى:
<FeaturedNewsBlockNew
  article={article}
  showCompact={true}  // للحصول على تصميم النسخة الخفيفة
  showBadge={true}
  showAuthor={true}
  className="h-80"
/>
*/

export default {
  HomePageWithFeaturedNews,
  NewsPageWithEnhancedFeatured,
  prepareArticleData,
  FeaturedNewsWithAPI
};
