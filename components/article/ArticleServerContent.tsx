/* eslint-disable @next/next/no-img-element */

interface ArticleLike {
  id: string;
  title: string;
  featured_image?: string | null;
  social_image?: string | null;
  image_url?: string | null;
  image?: string | null;
  thumbnail?: string | null;
  published_at?: string | Date | null;
  content?: string | null;
  author_name?: string | null;
}

function withCloudinaryTransform(src: string): string {
  try {
    if (!src || typeof src !== 'string') return src;
    if (!src.includes('res.cloudinary.com') || !src.includes('/upload/')) {
      return src;
    }
    const [prefix, rest] = src.split('/upload/');
    if (/^(c_|w_|h_|f_|q_)/.test(rest)) {
      return `${prefix}/upload/${rest}`;
    }
    const t = 'c_fill,w_1200,h_675,q_auto,f_auto';
    return `${prefix}/upload/${t}/${rest}`;
  } catch {
    return src;
  }
}

function normalizeImageSrc(raw?: string | null): string | null {
  if (!raw || typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  if (!trimmed || trimmed === 'null' || trimmed === 'undefined') return null;
  const isProd = process.env.NODE_ENV === 'production';
  const fixed = trimmed.startsWith('http://')
    ? (isProd ? trimmed.replace(/^http:\/\//, 'https://') : trimmed)
    : trimmed;
  return fixed.startsWith('http') || fixed.startsWith('/') ? fixed : `/${fixed.replace(/^\/+/, '')}`;
}

export default function ArticleServerContent({ article }: { article: ArticleLike }) {
  const rawImage = article.featured_image || article.social_image || article.image_url || article.image || article.thumbnail;
  const normalized = normalizeImageSrc(rawImage);
  const displaySrc = normalized ? withCloudinaryTransform(normalized) : '/images/news-placeholder-lite.svg';

  const publishedAt = article.published_at
    ? new Date(typeof article.published_at === 'string' ? article.published_at : (article.published_at as Date))
    : null;

  return (
    <main className="min-h-[100svh] pt-[var(--mobile-header-height)] sm:pt-[var(--header-height)] lg:pt-20">
      <div className="relative">
        <article className="max-w-screen-lg lg:max-w-[110ch] mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:py-8">
          {/* الصورة البارزة */}
          <div className="relative mb-4 rounded-2xl overflow-hidden">
            <div className="relative w-full" style={{ aspectRatio: '16 / 9' } as any}>
              <img
                src={displaySrc!}
                alt={article.title}
                loading="eager"
                decoding="async"
                fetchPriority="high"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          </div>

          {/* العنوان */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-snug text-gray-900 dark:text-white mb-3">
            {article.title}
          </h1>

          {/* معلومات ميتا بسيطة */}
          <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300 mb-6">
            {publishedAt && (
              <time dateTime={publishedAt.toISOString()}>
                {publishedAt.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })}
              </time>
            )}
            {article.author_name && (
              <span className="inline-flex items-center">• {article.author_name}</span>
            )}
          </div>

          {/* المحتوى الأساسي */}
          <div className="mb-12" style={{ contentVisibility: 'auto' as any, containIntrinsicSize: '100% 900px' as any }}>
            <div className="w-full">
              <div
                className={`prose max-w-none dark:prose-invert arabic-article-content prose-lg`}
                dangerouslySetInnerHTML={{ __html: article.content || '' }}
              />
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}


