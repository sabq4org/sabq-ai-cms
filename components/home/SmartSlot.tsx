'use client';

import React, { useState, useEffect } from 'react';
import { SmartBlockRenderer } from '@/components/smart-blocks/SmartBlockRenderer';
import { useDarkModeContext } from '@/contexts/DarkModeContext';

interface SmartBlock {
  id: string;
  name: string;
  position: 'topBanner' | 'afterHighlights' | 'afterCards' | 'beforePersonalization' | 'beforeFooter';
  type: 'smart' | 'custom' | 'html';
  status: 'active' | 'inactive' | 'scheduled';
  displayType: 'grid' | 'cards' | 'horizontal' | 'gallery' | 'list' | 'headline' | 'image-left' | 'carousel';
  keywords?: string[];
  category?: string;
  articlesCount: number;
  theme: {
    primaryColor: string;
    backgroundColor: string;
    textColor: string;
  };
  customHtml?: string;
  schedule?: {
    startDate: string;
    endDate: string;
    isAlwaysActive: boolean;
  };
  order: number;
  padding?: string;
  margin?: string;
  bgColor?: string;
  visibility?: 'all' | 'guest' | 'user';
  maxItems?: number;
}

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  imageUrl?: string;
  category?: string;
  author?: {
    name: string;
    avatar?: string;
  };
  publishedAt: string;
  views?: number;
  readTime?: number;
}

interface SmartSlotProps {
  position: 'topBanner' | 'afterHighlights' | 'afterCards' | 'beforePersonalization' | 'beforeFooter';
  userType?: 'guest' | 'user';
}

/**
 * SmartSlot: Placeholder لبلوكات ذكية يتم حقنها ديناميكياً لاحقاً.
 * حالياً يعرض حاوية بسيطة لتجنب أخطاء البناء.
 */
export default function SmartSlot({ position, userType = 'guest' }: SmartSlotProps) {
  const { darkMode } = useDarkModeContext();
  const [blocks, setBlocks] = useState<SmartBlock[]>([]);
  const [articles, setArticles] = useState<{ [blockId: string]: Article[] }>({});
  const [loading, setLoading] = useState(true);

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
      const activeBlocks = data.filter((block: SmartBlock) => block.status === 'active');
      
      setBlocks(activeBlocks);
      
      // جلب المقالات لكل بلوك
      for (const block of activeBlocks) {
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
      let url = `/api/articles?status=published&limit=${block.articlesCount || 6}`;
      
      // دعم الكلمات المفتاحية المتعددة
      if (block.keywords && block.keywords.length > 0) {
        const searchQuery = block.keywords.join(' ');
        url += `&search=${encodeURIComponent(searchQuery)}`;
      }
      
      if (block.category) {
        url += `&category=${encodeURIComponent(block.category)}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      const articlesData = data.data || data.articles || data || [];
      
      setArticles(prev => ({
        ...prev,
        [block.id]: articlesData.map((article: any) => ({
          id: article.id,
          title: article.title,
          slug: article.slug || article.id,
          excerpt: article.summary || article.excerpt || '',
          imageUrl: article.featured_image || article.image || article.imageUrl || null,
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
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">جاري تحميل البلوكات الذكية...</p>
          </div>
        </div>
      </div>
    );
  }

  if (blocks.length === 0) {
    return null;
  }

  return (
    <div className={`smart-slots-container ${darkMode ? 'dark' : ''}`}>
      {blocks.map(block => (
        <div key={block.id} className="mb-8 lg:mb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SmartBlockRenderer 
              block={block} 
              articles={articles[block.id] || []} 
              userType={userType}
            />
          </div>
        </div>
      ))}
    </div>
  );
} 