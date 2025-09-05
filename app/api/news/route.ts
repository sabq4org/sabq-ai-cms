import type { NextRequest } from 'next/server';
import { processArticleImage, getSafeImageUrl } from '@/lib/image-utils';

// Proxy to /api/articles to avoid re-export build conflicts
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const target = new URL(`/api/articles${url.search}`, url.origin);

  const upstream = await fetch(target.toString(), {
    headers: {
      'X-Requested-With': 'news-alias',
    },
    next: { revalidate: 300 }, // 5 minutes cache
  });

  const body = await upstream.text();

  return new Response(body, {
    status: upstream.status,
      headers: {
      'Content-Type': upstream.headers.get('Content-Type') || 'application/json',
      'Cache-Control': 'public, max-age=300, s-maxage=600, stale-while-revalidate=1800',
      },
    });
}
