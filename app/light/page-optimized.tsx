import Link from "next/link";
import Image from "next/image";

// تحسين رابط Cloudinary
function transformCloudinaryUrl(url: string | null | undefined, width: number = 800): string {
  if (!url || typeof url !== 'string') return '/images/news-placeholder-lite.svg';
  
  // إذا كان رابط Cloudinary، أضف التحويلات
  if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
    const parts = url.split('/upload/');
    if (parts.length === 2 && !/\/upload\/(c_|w_|f_|q_)/.test(url)) {
      return `${parts[0]}/upload/f_auto,q_auto,w_${width}/${parts[1]}`;
    }
  }
  
  return url;
}

// مكون بطاقة خبر مبسط
function NewsCard({ article }: { article: any }) {
  const imageUrl = transformCloudinaryUrl(
    article.featured_image || article.image || article.thumbnail,
    400
  );
  
  return (
    <Link 
      href={`/news/${article.slug || article.id}`}
      className="group block"
      prefetch={false}
    >
      <article className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        {/* الصورة */}
        <div className="relative aspect-video">
          <img
            src={imageUrl}
            alt={article.title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* المحتوى */}
        <div className="p-4">
          <h3 className="font-semibold line-clamp-2 text-gray-900 dark:text-white">
            {article.title}
          </h3>
          
          {/* التصنيف والوقت */}
          <div className="flex items-center gap-2 mt-2 text-sm text-gray-500 dark:text-gray-400">
            {article.categories?.name && (
              <span className="text-blue-600 dark:text-blue-400">
                {article.categories.name}
              </span>
            )}
            {article.published_at && (
              <time>
                {new Date(article.published_at).toLocaleDateString('ar-SA')}
              </time>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}

// مكون الأخبار المميزة المبسط
async function FeaturedNews() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/articles/featured?limit=3`, {
      next: { revalidate: 60 }, // 1 دقيقة للأخبار المميزة (يمكن أن تكون أبطأ قليلاً)
      cache: 'no-store' // عدم تخزين لضمان الحصول على أحدث المحتوى
    });
    
    if (!res.ok) return null;
    
    const data = await res.json();
    const articles = data?.data || [];
    
    if (!articles.length) return null;
    
    return (
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">الأخبار المميزة</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {articles.slice(0, 3).map((article: any, idx: number) => (
            <div key={article.id || idx}>
              <NewsCard article={article} />
            </div>
          ))}
        </div>
      </section>
    );
  } catch (error) {
    console.error('Error loading featured news:', error);
    return null;
  }
}

// مكون آخر الأخبار المبسط
async function LatestNews() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/light/news?limit=9`, {
      next: { revalidate: 0 }, // تحديث فوري للأخبار
      cache: 'no-store' // عدم تخزين الأخبار لضمان الحصول على أحدث المحتوى
    });
    
    if (!res.ok) return null;
    
    const data = await res.json();
    const articles = data?.articles || [];
    
    if (!articles.length) return null;
    
    return (
      <section>
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">آخر الأخبار</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {articles.map((article: any) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      </section>
    );
  } catch (error) {
    console.error('Error loading latest news:', error);
    return null;
  }
}

export default async function LightPageOptimized() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header بسيط */}
      <header className="bg-white dark:bg-gray-900 shadow-sm mb-6">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              النسخة الخفيفة
            </h1>
            <Link 
              href="/" 
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              النسخة الكاملة ←
            </Link>
          </div>
        </div>
      </header>
      
      {/* المحتوى الرئيسي */}
      <main className="max-w-6xl mx-auto px-4 pb-8">
        {/* الأخبار المميزة */}
        <FeaturedNews />
        
        {/* آخر الأخبار */}
        <LatestNews />
        
        {/* دعوة للتسجيل */}
        <div className="mt-12 text-center bg-blue-50 dark:bg-blue-900/20 rounded-lg p-8">
          <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
            احصل على تجربة أفضل
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            سجّل الآن للحصول على مزايا إضافية وتخصيص تجربتك
          </p>
          <Link 
            href="/register" 
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            سجّل مجاناً
          </Link>
        </div>
      </main>
    </div>
  );
}
