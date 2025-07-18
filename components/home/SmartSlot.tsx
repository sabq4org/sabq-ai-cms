'use client';

import Image from 'next/image';
import React, { useState, useEffect, useRef } from 'react';
import SmartBlockRenderer from '@/components/smart-blocks/SmartBlockRenderer';
import { SmartBlock } from '@/types/smart-block';

// import { useDarkModeContext } from '@/contexts/DarkModeContext'; // تم تعطيل الوضع الليلي

interface SmartSlotProps {
  position: 'topBanner' | 'afterHighlights' | 'afterCards' | 'beforePersonalization' | 'beforeFooter' | 'below_header' | 'below_personalized' | 'below_deep_analysis' | 'above_footer';
  className?: string;
}

interface Article {
  id: string;
  title: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  image?: string;
  featured_image?: string;
  imageUrl?: string;
  category?: string;
  category_id?: number;
  author?: {
    name: string;
    avatar?: string;
  };
  published_at?: string;
  created_at?: string;
  publishedAt?: string;
  views?: number;
  readTime?: number;
  breaking?: boolean;
  seo_keywords?: string[];
}

/**
 * SmartSlot: Placeholder لبلوكات ذكية يتم حقنها ديناميكياً لاحقاً.
 * حالياً يعرض حاوية بسيطة لتجنب أخطاء البناء.
 */
export function SmartSlot({ position, className = '' }: SmartSlotProps) {
  const [blocks, setBlocks] = useState<SmartBlock[]>([]);
  const [blockArticles, setBlockArticles] = useState<{ [key: string]: any[] }>({});
  const [loading, setLoading] = useState(true);
  const darkMode = false; // تم تعطيل الوضع الليلي

  useEffect(() => {
    fetchBlocks();
  }, [position]);

  const fetchBlocks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/smart-blocks?position=${position}&status=active`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch smart blocks');
      }

      const data = await response.json();
      console.log(`[SmartSlot] البلوكات المستلمة للموضع ${position}:`, data);
      
      // فلترة البلوكات النشطة وإستبعاد البودكاست مؤقتاً لمنع الأخطاء
      const activeBlocks = data.filter((block: SmartBlock) => {
        // استبعاد بلوك البودكاست أو النشرة الصوتية مؤقتاً
        if (block.name?.includes('نشرة صوتية') || 
            block.name?.includes('بودكاست') ||
            block.name?.toLowerCase().includes('podcast')) {
          console.warn(`[SmartSlot] تم تجاهل بلوك البودكاست مؤقتاً: ${block.name}`);
          return false;
        }
        return block.status === 'active';
      });
      console.log(`[SmartSlot] البلوكات النشطة:`, activeBlocks);
      
      // ترتيب البلوكات حسب قيمة order
      const sortedBlocks = activeBlocks.sort((a: SmartBlock, b: SmartBlock) => {
        return (a.order || 999) - (b.order || 999);
      });
      console.log(`[SmartSlot] البلوكات بعد الترتيب:`, sortedBlocks);
      
      setBlocks(sortedBlocks);
      
      // جلب المقالات لكل بلوك
      for (const block of sortedBlocks) {
        await fetchArticlesForBlock(block);
      }
    } catch (error) {
      console.error('Error fetching smart blocks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchArticlesForBlock = async (block: SmartBlock) => {
    try {
      console.log(`[SmartSlot] جلب المقالات للبلوك:`, block.name, block);
      
      // إذا لم توجد كلمات مفتاحية ولكن يوجد تصنيف، نكتفي بتصنيف المقالات
      const hasKeywords = Array.isArray(block.keywords) && block.keywords.length > 0;
      
      // جلب جميع المقالات المنشورة
      let url = `/api/articles?status=published&limit=100`; // جلب عدد كبير للفلترة المحلية
      
      if (block.category) {
        url += `&category=${encodeURIComponent(block.category)}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error(`[SmartSlot] خطأ في جلب المقالات: ${response.status} ${response.statusText}`);
        setBlockArticles(prev => ({
          ...prev,
          [block.id]: []
        }));
        return;
      }
      
      const data = await response.json();
      
      // التأكد من أن articlesData دائماً مصفوفة
      let articlesData: any[] = [];
      
      if (Array.isArray(data)) {
        articlesData = data;
      } else if (data && typeof data === 'object') {
        articlesData = data.data || data.articles || [];
      }
      
      // التحقق من أن articlesData مصفوفة قبل استخدام filter
      if (!Array.isArray(articlesData)) {
        console.error('[SmartSlot] البيانات المستلمة ليست مصفوفة:', articlesData);
        setBlockArticles(prev => ({
          ...prev,
          [block.id]: []
        }));
        return;
      }
      
      // فلترة حسب التصنيف أولاً إذا كان block.category مُعطى (باسم التصنيف بالعربية أو الإنجليزية)
      let preFiltered = articlesData;
      if (block.category) {
        const catLower = block.category.toLowerCase();
        preFiltered = preFiltered.filter((a: any) => {
          const nameAr = (a.category_name || '').toLowerCase();
          const nameEn = (a.category?.name_en || a.category?.name || '').toLowerCase();
          return nameAr.includes(catLower) || nameEn.includes(catLower);
        });
      }
      
      // فلترة المقالات بناءً على الكلمات المفتاحية (إن وجدت)
      let filteredArticles = hasKeywords ? preFiltered.filter((article: any) => {
        // التحقق من وجود الكلمات المفتاحية في:
        // 1. seo_keywords (كنص أو مصفوفة)
        // 2. العنوان
        // 3. المحتوى
        // 4. الملخص
        let articleKeywords: string[] = [];
        
        // معالجة seo_keywords سواء كانت نص أو مصفوفة
        if (article.seo_keywords) {
          if (Array.isArray(article.seo_keywords)) {
            articleKeywords = article.seo_keywords;
          } else if (typeof article.seo_keywords === 'string') {
            articleKeywords = article.seo_keywords.split(',').map((k: string) => k.trim());
          }
        }
        
        const title = article.title || '';
        const content = article.content || '';
        const summary = article.summary || article.excerpt || '';
        
        return block.keywords?.some((keyword: string) => {
          const lowerKeyword = keyword.toLowerCase();
          return (
            articleKeywords.some((k: string) => k.toLowerCase().includes(lowerKeyword)) ||
            title.toLowerCase().includes(lowerKeyword) ||
            content.toLowerCase().includes(lowerKeyword) ||
            summary.toLowerCase().includes(lowerKeyword)
          );
        });
      }) : preFiltered;
      
      // أخذ العدد المطلوب فقط
      const limitedArticles = filteredArticles.slice(0, block.articlesCount || 6);
      
      console.log(`[SmartSlot] المقالات المفلترة للبلوك ${block.name}:`, {
        totalArticles: articlesData.length,
        filteredCount: filteredArticles.length,
        limitedCount: limitedArticles.length,
        keywords: block.keywords
      });
      
      // في حال لم ينتج أي مقال بعد الفلترة بالكلمات المفتاحية، أظهر مقالات التصنيف مباشرة
      if (filteredArticles.length === 0) {
        filteredArticles = preFiltered;
      }
      
      setBlockArticles(prev => ({
        ...prev,
        [block.id]: limitedArticles.map((article: any) => ({
          id: article.id,
          title: article.title,
          slug: article.slug || article.id,
          excerpt: article.summary || article.excerpt || '',
          imageUrl: article.featuredImage || article.featured_image || article.image || article.imageUrl || null,
          category: article.category_name || article.category || 'عام',
          author: article.author_name ? {
            name: article.author_name,
            avatar: article.author_avatar
          } : undefined,
          publishedAt: article.published_at || article.created_at,
          views: article.views_count || article.views || 0,
          readTime: article.reading_time || Math.ceil((article.content?.length || 0) / 200)
        }))
      }));
    } catch (error) {
      console.error('Error fetching articles for block:', error);
      setBlockArticles(prev => ({
        ...prev,
        [block.id]: []
      }));
    }
  };

  if (loading) {
    // عدم عرض أي شيء أثناء التحميل لتجربة أكثر سلاسة
    return null;
  }

  if (blocks.length === 0) {
    return null;
  }

  return (
    <div className={`smart-slot smart-slot-${position} ${className}`}>
      {blocks.map((block) => (
        <div key={block.id} className="mb-8">
          <SmartBlockRenderer 
            block={block} 
            articles={blockArticles[block.id] || []} 
            darkMode={darkMode}
          />
        </div>
      ))}
    </div>
  );
}