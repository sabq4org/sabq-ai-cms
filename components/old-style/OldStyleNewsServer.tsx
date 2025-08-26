import OldStyleNewsBlock from './OldStyleNewsBlock';

interface NewsServerProps {
  endpoint?: string;
  title?: string;
  columns?: number;
  showExcerpt?: boolean;
  limit?: number;
  className?: string;
  revalidateSeconds?: number;
}

// مكون سيرفري يجلب الأخبار على الخادم ثم يمررها لمكوّن العرض الخفيف (Client)
export default async function OldStyleNewsServer({
  endpoint = '/api/news?limit=6',
  title = 'آخر الأخبار',
  columns = 3,
  showExcerpt = false,
  limit = 6,
  className = '',
  revalidateSeconds = 30,
}: NewsServerProps) {
  const url = endpoint.includes('limit=') ? endpoint : `${endpoint}${endpoint.includes('?') ? '&' : '?'}limit=${limit}`;

  let articles: any[] = [];
  try {
    const res = await fetch(url, {
      // ISR بسيط لتسريع النسخة الخفيفة
      next: { revalidate: revalidateSeconds },
      cache: 'force-cache',
    });

    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data)) {
        articles = data;
      } else if (data && Array.isArray((data as any).articles)) {
        articles = (data as any).articles;
      }
    }
  } catch {
    // تجاهل الخطأ؛ سنعرض هيكل تحميل بسيط بدل ذلك
  }

  if (!articles || articles.length === 0) {
    // هيكل تحميل خفيف بدون جافاسكربت
    return (
      <div className={`old-style-news-block ${className}`}>
        <div className="old-style-news-header">
          <h2 className="old-style-news-title">{title}</h2>
          <div className="old-style-title-line"></div>
        </div>
        <div
          className="old-style-news-grid"
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: '20px' }}
        >
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="old-style-news-card" style={{ contentVisibility: 'auto' as any, containIntrinsicSize: '300px 220px' as any }}>
              <div className="old-style-news-image-container bg-gray-200 animate-pulse"></div>
              <div className="old-style-news-content">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <OldStyleNewsBlock
      articles={articles}
      title={title}
      columns={columns}
      showExcerpt={showExcerpt}
      className={className}
    />
  );
}
