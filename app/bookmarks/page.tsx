import { ArticleCard } from '@/components/ui/ArticleCard';

export default function BookmarksPage() {
  const items: any[] = [];
  return (
    <main dir="rtl" className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-4">المحفوظات</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((a: any) => (
          <ArticleCard
            key={a.id}
            href={`/news/${a.slug || a.id}`}
            title={a.title}
            subtitle={a.excerpt || a.summary}
            image={a.featured_image}
            views={a.views}
            readTime={a.reading_time}
            category={a.category?.name}
            categoryIcon={a.category?.icon}
            dateLabel={a.published_at?.slice(0, 10)}
          />
        ))}
      </div>
    </main>
  );
}


