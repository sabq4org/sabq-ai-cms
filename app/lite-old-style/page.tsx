'use server';

import OldStyleNewsServer from '@/components/old-style/OldStyleNewsServer';
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
          <LightFeaturedServer limit={3} />
        </section>

        <section className="mb-12">
          <OldStyleNewsServer
            endpoint="/api/news?featured=true"
            title="🔥 الأخبار المميزة"
            columns={3}
            showExcerpt={true}
            limit={6}
            revalidateSeconds={30}
          />
        </section>

        <section className="mb-12">
          <OldStyleNewsServer
            endpoint="/api/news?sort=created_at&order=desc"
            title="📰 آخر الأخبار"
            columns={3}
            showExcerpt={false}
            limit={9}
            revalidateSeconds={30}
          />
        </section>

        <section className="mb-12">
          <OldStyleNewsServer
            endpoint="/api/news?sort=views&order=desc"
            title="👁️ الأكثر قراءة"
            columns={2}
            showExcerpt={true}
            limit={4}
            revalidateSeconds={60}
          />
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
