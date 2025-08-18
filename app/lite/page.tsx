'use client';

import MobileLiteLayout from '@/components/mobile/MobileLiteLayout';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MobileStats } from '@/components/mobile/MobileOptimizer';
import BreakingBar from '@/components/BreakingBar';

export default function LitePage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // جلب آخر الأخبار والإحصائيات
    Promise.all([
      fetch('/api/articles?limit=20').then(res => res.json()),
      fetch('/api/stats/summary').then(res => res.json())
    ])
      .then(([articlesData, statsData]) => {
        if (articlesData.articles) {
          setArticles(articlesData.articles);
        }
        if (statsData.success) {
          setStats(statsData);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <MobileLiteLayout>
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          سبق الذكية - النسخة الخفيفة
        </h2>
        
        {/* إحصائيات سريعة */}
        {stats && (
          <MobileStats 
            stats={[
              { label: 'الأخبار', value: stats.totalArticles || articles.length },
              { label: 'اليوم', value: stats.todayArticles || 0 },
              { label: 'عاجل', value: stats.breakingNews || 0 },
              { label: 'المشاهدات', value: `${Math.floor((stats.totalViews || 0) / 1000)}ك` }
            ]}
          />
        )}
        
        {/* شريط الخبر العاجل - يظهر تحت الإحصائيات */}
        <div style={{ margin: '16px -16px 0 -16px' }}>
          <BreakingBar variant="inline" />
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-6 mb-4">
          آخر الأخبار
        </h3>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            لا توجد أخبار حالياً
          </div>
        ) : (
          <div className="space-y-3">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/article/${article.id}`}
                className="block bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                  {article.title}
                </h3>
                {article.excerpt && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {article.excerpt}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-500">
                  {article.categories?.name && (
                    <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                      {article.categories.name}
                    </span>
                  )}
                  <span>{new Date(article.published_at || article.created_at).toLocaleDateString('ar-SA')}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </MobileLiteLayout>
  );
}
