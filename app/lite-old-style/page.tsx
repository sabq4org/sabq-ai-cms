// Use ISR with longer cache for better performance
// الصفحة قد تحتوي fetch no-store داخلي، فلا نفرض force-cache على مستوى الصفحة
export const dynamic = 'force-dynamic'; // منع SSG لتفادي Dynamic server usage
export const revalidate = 60; // دقيقة واحدة فقط لتقليل تعارض ISR

import { Suspense } from 'react';
import OldStyleNewsServerMarkup from '@/components/old-style/OldStyleNewsServerMarkup';
import LightFeaturedServer from '@/components/featured/LightFeaturedServer';

export default async function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            سبق الذكية - النسخة الخفيفة مع التصميم القديم
          </h1>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 py-8">
        <section className="mb-8">
          <Suspense
            fallback={
              <div className="w-full px-1">
                <div className="flex gap-4 overflow-hidden">
                  <div className="w-[70%] xs:w-[60%] sm:w-[45%] md:w-[320px] max-w-[340px] h-48 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
                  <div className="w-[70%] xs:w-[60%] sm:w-[45%] md:w-[320px] max-w-[340px] h-48 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
                </div>
              </div>
            }
          >
            <LightFeaturedServer limit={3} />
          </Suspense>
        </section>

        <section className="mb-12">
          <Suspense
            fallback={
              <div className="old-style-news-block">
                <div className="old-style-news-header">
                  <h2 className="old-style-news-title">🔥 الأخبار المميزة</h2>
                  <div className="old-style-title-line"></div>
                </div>
                <div className="old-style-news-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="old-style-news-card">
                      <div className="old-style-news-image-container bg-gray-200 animate-pulse" />
                      <div className="old-style-news-content">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse" />
                        <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            }
          >
            <OldStyleNewsServerMarkup
              endpoint="/api/articles/featured-fast?limit=6"
              title="🔥 الأخبار المميزة"
              columns={3}
              showExcerpt={true}
              limit={6}
              revalidateSeconds={300}
            />
          </Suspense>
        </section>

        <section className="mb-12">
          <Suspense
            fallback={
              <div className="old-style-news-block">
                <div className="old-style-news-header">
                  <h2 className="old-style-news-title">📰 آخر الأخبار</h2>
                  <div className="old-style-title-line"></div>
                </div>
                <div className="old-style-news-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="old-style-news-card">
                      <div className="old-style-news-image-container bg-gray-200 animate-pulse" />
                      <div className="old-style-news-content">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse" />
                        <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            }
          >
            <OldStyleNewsServerMarkup
              endpoint="/api/articles?sort=published_at&order=desc&limit=9"
              title="📰 آخر الأخبار"
              columns={3}
              showExcerpt={false}
              limit={9}
              revalidateSeconds={300}
            />
          </Suspense>
        </section>

        <section className="mb-12">
          <Suspense
            fallback={
              <div className="old-style-news-block">
                <div className="old-style-news-header">
                  <h2 className="old-style-news-title">👁️ الأكثر قراءة</h2>
                  <div className="old-style-title-line"></div>
                </div>
                <div className="old-style-news-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="old-style-news-card">
                      <div className="old-style-news-image-container bg-gray-200 animate-pulse" />
                      <div className="old-style-news-content">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse" />
                        <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            }
          >
            <OldStyleNewsServerMarkup
              endpoint="/api/articles?sort=views&order=desc&limit=4"
              title="👁️ الأكثر قراءة"
              columns={2}
              showExcerpt={true}
              limit={4}
              revalidateSeconds={600}
            />
          </Suspense>
        </section>
      </div>

      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <p>&copy; 2025 سبق الذكية. جميع الحقوق محفوظة.</p>
        </div>
      </footer>
    </main>
  );
}
