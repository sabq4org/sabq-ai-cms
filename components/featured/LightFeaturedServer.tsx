import LightFeaturedStrip from '@/components/featured/LightFeaturedStrip';

interface LightFeaturedServerProps {
  heading?: string;
  limit?: number;
  revalidateSeconds?: number;
}

// نسخة سيرفرية من شريط الأخبار المميزة لخفض الهيدرشن
export default async function LightFeaturedServer({ heading = 'الأخبار المميزة', limit = 3, revalidateSeconds = 300 }: LightFeaturedServerProps) {
  const isProd = process.env.NODE_ENV === 'production';
  const endpoint = isProd
    ? `/api/articles/featured?limit=${limit}`
    : `/api/articles/featured-json?limit=${limit}`;

  let articles: any[] = [];
  try {
    const res = await fetch(endpoint, { 
      cache: 'force-cache', 
      next: { revalidate: revalidateSeconds },
      signal: AbortSignal.timeout(3000) // 3 second timeout
    });
    if (res.ok) {
      const json = await res.json();
      const list: any[] = (json?.data || []).map((a: any) => ({
        id: a.id,
        title: a.title,
        slug: a.slug,
        featured_image: a.featured_image || a.social_image || a.image_url || a.image || a.thumbnail || null,
        social_image: a.social_image,
        metadata: a.metadata,
        published_at: a.published_at,
        breaking: a.breaking || a.is_breaking || false,
        category: a.categories ? { id: a.categories.id, name: a.categories.name, slug: a.categories.slug, color: a.categories.color } : null,
        views: a.views ?? a.views_count ?? 0,
      }));
      articles = list.slice(0, Math.max(1, Math.min(6, limit || 3)));
    }
  } catch {
    // تجاهل
  }

  if (!articles.length) {
    return (
      <div className="w-full px-4 sm:px-6">
        <div className="flex gap-4 overflow-hidden">
          <div className="w-[70%] xs:w-[60%] sm:w-[45%] md:w-[320px] max-w-[340px] h-48 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
          <div className="w-[70%] xs:w-[60%] sm:w-[45%] md:w-[320px] max-w-[340px] h-48 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mb-6">
      <LightFeaturedStrip articles={articles as any} />
    </div>
  );
}
